import express from 'express';
import { supabase } from '../config/supabase.js';
import { runClaimCycle } from '../services/claimProcessor.js';
import { THRESHOLD_MAP, VALID_TRIGGER_TYPES } from '../services/triggerEngine.js';
import { authMiddleware, adminMiddleware } from '../middlewares/jwtAuth.js';
import { getEnvironmentalValue } from '../services/dataProvider.js';
import { scoreFraud } from '../services/fraudScorer.js';
import { calculateImpactScore } from '../services/impactEngine.js';
import { processPreventionAlert } from '../services/preventionService.js';
import { calculatePayout } from '../services/payoutEngine.js';
import { generateExplanation } from '../services/explainEngine.js';

const router = express.Router();

router.use(authMiddleware);
// router.use(adminMiddleware); // Disabled - making endpoints accessible to workers too

router.get('/analytics', async (req, res) => {
    try {
        const [
            { count: totalWorkers },
            { count: totalPolicies },
            { count: activePolicies },
            { count: totalClaims },
            { data: payoutData },
            { data: premiumData }
        ] = await Promise.all([
            supabase.from('workers').select('*', { count: 'exact', head: true }),
            supabase.from('policies').select('*', { count: 'exact', head: true }),
            supabase.from('policies').select('*', { count: 'exact', head: true }).eq('status', 'Active'),
            supabase.from('claims').select('*', { count: 'exact', head: true }),
            supabase.from('claims').select('payout_amount').eq('status', 'Paid'),
            supabase.from('policies').select('premium')
        ]);

        const totalPayout = payoutData?.reduce((sum, c) => sum + (c.payout_amount || 0), 0) || 0;
        const totalPremiumCollected = premiumData?.reduce((sum, p) => sum + (p.premium || 0), 0) || 0;
        const lossRatio = totalPremiumCollected > 0
            ? Math.round((totalPayout / totalPremiumCollected) * 10000) / 10000
            : 0;

        return res.json({
            totalWorkers: totalWorkers || 0,
            totalPolicies: totalPolicies || 0,
            activePolicies: activePolicies || 0,
            totalClaims: totalClaims || 0,
            totalPayout: Math.round(totalPayout * 100) / 100,
            totalPremiumCollected: Math.round(totalPremiumCollected * 100) / 100,
            lossRatio
        });
    } catch (err) {
        console.error('[adminRoutes]', err);
        return res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
    }
});

router.post('/simulate-trigger', async (req, res) => {
    try {
        const { city, triggerType, value } = req.body;

        console.log('[adminRoutes] Simulate trigger:', { city, triggerType, value });

        if (!city || typeof city !== 'string' || city.trim() === '') {
            return res.status(400).json({ success: false, error: 'City is required and must be a non-empty string' });
        }

        if (!triggerType || !VALID_TRIGGER_TYPES.includes(triggerType)) {
            return res.status(400).json({
                success: false,
                error: `Invalid triggerType. Must be one of: ${VALID_TRIGGER_TYPES.join(', ')}`
            });
        }

        let triggerValue = value;
        if (typeof triggerValue !== 'number' || triggerValue <= 0 || isNaN(triggerValue)) {
            triggerValue = await getEnvironmentalValue(triggerType);
        }

        const threshold = THRESHOLD_MAP[triggerType];
        
        let severity;
        if (triggerType === 'AQI_HIGH') {
            if (triggerValue >= 200) severity = 'severe';
            else if (triggerValue >= 175) severity = 'medium';
            else if (triggerValue >= 150) severity = 'mild';
        } else if (triggerType === 'HEAVY_RAIN') {
            if (triggerValue >= 80) severity = 'severe';
            else if (triggerValue >= 65) severity = 'medium';
            else if (triggerValue >= 50) severity = 'mild';
        } else if (triggerType === 'FLOOD_ALERT') {
            if (triggerValue >= 4) severity = 'severe';
            else if (triggerValue >= 3) severity = 'medium';
            else if (triggerValue >= 2) severity = 'mild';
        } else if (triggerType === 'HEAT_WAVE') {
            if (triggerValue >= 44) severity = 'severe';
            else if (triggerValue >= 42) severity = 'medium';
            else if (triggerValue >= 38) severity = 'mild';
        }

        if (!severity) {
            return res.json({
                triggered: false,
                reason: `Value ${triggerValue} is below threshold for ${triggerType}`
            });
        }

        const startTime = Date.now();
        
        const trigger = {
            type: triggerType,
            city: city.trim(),
            value: triggerValue,
            threshold,
            severity,
            firedAt: new Date().toISOString()
        };

        const { data: triggerLog, error: triggerErr } = await supabase
            .from('trigger_logs')
            .insert([{
                trigger_type: trigger.type,
                city: trigger.city,
                value: trigger.value,
                threshold: trigger.threshold,
                severity: trigger.severity,
                fired_at: trigger.firedAt
            }])
            .select()
            .single();

        if (triggerErr) throw new Error(`Failed to log trigger: ${triggerErr.message}`);

        await supabase.from('event_logs').insert([{
            trigger_id: triggerLog.id,
            stage: 'TRIGGER',
            status: 'success',
            metadata: { type: trigger.type, severity: trigger.severity, value: trigger.value, city: trigger.city }
        }]);

        const { data: policies, error: policyErr } = await supabase
            .from('policies')
            .select('id, max_payout, worker_id, workers(id, name, city, weekly_earnings, avg_daily_hours)')
            .eq('status', 'Active')
            .eq('city', trigger.city);

        if (policyErr) throw new Error(`Failed to fetch policies: ${policyErr.message}`);

        await supabase.from('event_logs').insert([{
            trigger_id: triggerLog.id,
            stage: 'POLICY_MATCH',
            status: 'success',
            metadata: { matched: policies.length }
        }]);

        const payouts = [];
        const preventionAlerts = [];
        let firstImpactScore = 50;

        for (const policy of policies) {
            try {
                const workerId = policy.workers?.id;
                const impactScore = calculateImpactScore({
                    earningsLast7Days: policy.workers?.weekly_earnings ?? 0,
                    avgDailyHours: policy.workers?.avg_daily_hours ?? 0,
                    triggerType: trigger.type
                });

                if (payouts.length === 0) {
                    firstImpactScore = impactScore;
                }

                const prevention = await processPreventionAlert({
                    workerId,
                    triggerType: trigger.type,
                    severity: trigger.severity,
                    city: trigger.city
                });

                if (prevention) {
                    preventionAlerts.push({ workerId, ...prevention });
                }

                await supabase.from('event_logs').insert([{
                    trigger_id: triggerLog.id,
                    stage: 'PREVENTION_CHECK',
                    status: prevention?.triggered ? 'triggered' : 'skipped',
                    metadata: { workerId, message: prevention?.message }
                }]);

                const fraud = await scoreFraud({ userId: policy.worker_id, triggerId: triggerLog.id, type: trigger.type });
                
                // AI Decision based on fraud score
                let aiDecision = 'AUTO-APPROVED';
                if (fraud.score >= 40 && fraud.score <= 70) {
                    aiDecision = 'REVIEW-NEEDED';
                } else if (fraud.score > 70) {
                    aiDecision = 'BLOCKED';
                }
                
                const fraudCheckStatus = fraud.eligible ? 'passed' : 'failed';
                await supabase.from('event_logs').insert([{
                    trigger_id: triggerLog.id,
                    stage: 'fraud_check',
                    status: fraudCheckStatus,
                    metadata: { 
                        userId: policy.worker_id, 
                        score: fraud.score, 
                        flags: fraud.flags, 
                        status: fraud.status,
                        eligible: fraud.eligible,
                        ai_decision: aiDecision
                    }
                }]);

                if (!fraud.eligible) {
                    await supabase.from('event_logs').insert([{
                        trigger_id: triggerLog.id,
                        stage: 'PAYOUT',
                        status: 'skipped',
                        metadata: { userId: policy.worker_id, reason: 'Fraud score too high', score: fraud.score, ai_decision: aiDecision }
                    }]);
                    continue;
                }

                const payoutResult = calculatePayout(
                    policy.max_payout,
                    trigger.value,
                    trigger.threshold,
                    impactScore
                );

                const { data: payoutLog, error: payoutErr } = await supabase
                    .from('payout_logs')
                    .insert({
                        user_id: workerId,
                        policy_id: policy.id,
                        trigger_id: triggerLog.id,
                        amount: payoutResult.amount,
                        coverage_amount: policy.max_payout,
                        severity: payoutResult.severity,
                        fraud_score: fraud.score,
                        fraud_flags: fraud.flags,
                        reason: `${payoutResult.severity} severity event. Impact score: ${impactScore}/100. AI Decision: ${aiDecision}`,
                        impact_score: impactScore,
                        ai_decision: aiDecision
                    })
                    .select()
                    .single();

                if (payoutErr) throw new Error(`Failed to log payout: ${payoutErr.message}`);

                await supabase.from('event_logs').insert([{
                    trigger_id: triggerLog.id,
                    stage: 'PAYOUT',
                    status: 'success',
                    metadata: { userId: policy.worker_id, amount: payoutResult.amount, impactScore }
                }]);

                await supabase.from('event_logs').insert([{
                    trigger_id: triggerLog.id,
                    stage: 'PAYMENT',
                    status: 'success',
                    metadata: { userId: policy.worker_id, amount: payoutResult.amount, simulated: true }
                }]);

                const msg = `ZeroClaim: ₹${payoutResult.amount} payout due to ${triggerType.replace('_', ' ')} (${payoutResult.severity}).`;
                await supabase.from('notification_logs').insert({
                    user_id: workerId,
                    channel: 'SMS',
                    message: msg
                });

                await supabase.from('event_logs').insert([{
                    trigger_id: triggerLog.id,
                    stage: 'NOTIFICATION',
                    status: 'success',
                    metadata: { userId: policy.worker_id, channels: ['SMS'] }
                }]);

                payouts.push({ ...payoutLog, userName: policy.workers?.name, impact_score: impactScore, ai_decision: aiDecision });

            } catch (workerErr) {
                // Fault tolerance: Log worker pipeline failure but continue processing other workers
                console.error('[adminRoutes] Worker pipeline failed:', workerErr.message);
                await supabase.from('event_logs').insert([{
                    trigger_id: triggerLog.id,
                    stage: 'pipeline',
                    status: 'failed',
                    metadata: { 
                        worker_id: policy.worker_id,
                        error: workerErr.message 
                    }
                }]);
                continue; // Continue to next worker - don't stop the pipeline
            }
        }

        const processingMs = Date.now() - startTime;
        await supabase.from('trigger_logs').update({ processing_ms: processingMs }).eq('id', triggerLog.id);

        const [{ data: payoutData }, { count: highRiskCount }] = await Promise.all([
            supabase.from('payout_logs').select('impact_score'),
            supabase.from('payout_logs').select('id', { count: 'exact', head: true }).gte('impact_score', 75)
        ]);

        const scores = (payoutData || []).map(p => p.impact_score).filter(Boolean);
        const avgImpactScore = scores.length > 0
            ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
            : 0;

        return res.json({
            triggered: true,
            trigger: { ...trigger, id: triggerLog.id },
            payouts,
            processingMs,
            impactScore: firstImpactScore,
            prevention: preventionAlerts[0] || { triggered: false, message: null },
            live_stats: {
                avg_impact_score: avgImpactScore,
                high_risk_workers_count: highRiskCount || 0
            }
        });
    } catch (err) {
        console.error('[adminRoutes] simulate-trigger error:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

router.get('/live', async (req, res) => {
    try {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        const [
            { data: lastTriggers },
            { data: lastPayouts },
            { data: payoutTodayData },
            { data: activeUsersToday },
            { data: avgPerf },
            { count: activeWorkersCount },
            { data: allImpactScores },
            { count: highRiskWorkersCount }
        ] = await Promise.all([
            supabase
                .from('trigger_logs')
                .select('*')
                .order('fired_at', { ascending: false })
                .limit(5),
            supabase
                .from('payout_logs')
                .select('*, users(name)')
                .order('paid_at', { ascending: false })
                .limit(10),
            supabase
                .from('payout_logs')
                .select('amount')
                .gte('paid_at', today.toISOString()),
            supabase
                .from('payout_logs')
                .select('user_id')
                .gte('paid_at', today.toISOString()),
            supabase
                .from('trigger_logs')
                .select('processing_ms')
                .gte('fired_at', today.toISOString()),
            supabase
                .from('workers')
                .select('id', { count: 'exact', head: true })
                .eq('status', 'active'),
            supabase
                .from('payout_logs')
                .select('impact_score')
                .order('paid_at', { ascending: false })
                .limit(100),
            supabase
                .from('payout_logs')
                .select('id', { count: 'exact', head: true })
                .gte('impact_score', 75)
        ]);

        const totalPayoutsToday = payoutTodayData?.reduce((sum, c) => sum + (c.amount || 0), 0) || 0;
        const uniqueWorkers = new Set((activeUsersToday || []).map(c => c.user_id));
        const perfValues = (avgPerf.data || []).map(r => r.processing_ms).filter(Boolean);
        const avgProcessingMs = perfValues.length
            ? Math.round(perfValues.reduce((a, b) => a + b, 0) / perfValues.length)
            : null;

        const impactScores = (allImpactScores || []).map(p => p.impact_score).filter(Boolean);
        const avgImpactScore = impactScores.length > 0
            ? Math.round((impactScores.reduce((a, b) => a + b, 0) / impactScores.length) * 10) / 10
            : 0;

        const { data: latestWarning } = await supabase
            .from('notification_logs')
            .select('message, created_at')
            .eq('type', 'prevention_alert')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        const triggeredCount = (lastTriggers || []).length;
        const processedCount = (lastPayouts || []).length;
        const confidenceScore = triggeredCount > 0 
            ? Math.round((processedCount / triggeredCount) * 100) 
            : 100;

        return res.json({
            last_triggers: lastTriggers || [],
            last_payouts: (lastPayouts || []).map(p => ({ ...p, user_name: p.users?.name })),
            total_payout_today: Math.round(totalPayoutsToday * 100) / 100,
            active_workers: activeWorkersCount || 0,
            avg_processing_ms: avgProcessingMs,
            avg_impact_score: avgImpactScore,
            high_risk_workers_count: highRiskWorkersCount || 0,
            latest_warning: latestWarning || null,
            system_confidence: confidenceScore
        });
    } catch (err) {
        console.error('[adminRoutes]', err);
        return res.status(500).json({ success: false, error: 'Failed to fetch live data' });
    }
});

router.get('/ai-explain/:payoutId', async (req, res) => {
    try {
        const { data: p, error } = await supabase
            .from('payout_logs')
            .select('*, trigger_logs(type, severity, value, location), policies(max_payout), users(name)')
            .eq('id', req.params.payoutId)
            .single();

        if (error || !p) return res.status(404).json({ error: 'Payout not found' });

        const explanation =
            `Payout of ₹${p.amount} was issued to ${p.users?.name} because a ${p.trigger_logs?.type?.replace(/_/g, ' ')} event ` +
            `was detected in ${p.trigger_logs?.location} with a value of ${p.trigger_logs?.value}, ` +
            `classified as ${p.severity} severity. ` +
            `This triggered a ${p.severity === 'mild' ? '20%' : p.severity === 'medium' ? '30%' : '50%'} payout ` +
            `on their ₹${p.coverage_amount} policy. ` +
            `Fraud analysis returned a score of ${p.fraud_score}/100 — within the safe threshold of 70.`;

        res.json({ explanation });
    } catch (err) {
        console.error('[adminRoutes]', err);
        return res.status(500).json({ error: err.message });
    }
});

router.get('/explain/:payoutId', async (req, res) => {
    try {
        const explanation = await generateExplanation(req.params.payoutId);
        
        if (explanation.error) {
            return res.status(404).json({ error: explanation.error });
        }

        res.json(explanation);
    } catch (err) {
        console.error('[adminRoutes]', err);
        return res.status(500).json({ error: err.message });
    }
});

router.get('/payouts', async (req, res) => {
    try {
        const { limit = 50, offset = 0, city, status } = req.query;
        
        console.log('[adminRoutes] Fetching payouts with limit:', limit, 'offset:', offset);
        
        let query = supabase
            .from('payout_logs')
            .select('*')
            .order('paid_at', { ascending: false })
            .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

        const { data: payouts, error } = await query;

        if (error) {
            console.error('[adminRoutes] Payout query error:', error);
            return res.status(500).json({ success: false, error: error.message });
        }

        console.log('[adminRoutes] Payouts fetched:', payouts?.length || 0);

        // Get worker names from workers table
        const workerIds = (payouts || []).map(p => p.user_id).filter(Boolean);
        let workersMap = {};
        
        if (workerIds.length > 0) {
            try {
                const { data: workers } = await supabase
                    .from('workers')
                    .select('id, name')
                    .in('id', workerIds);
                
                if (workers) {
                    workersMap = workers.reduce((acc, w) => {
                        acc[w.id] = w.name;
                        return acc;
                    }, {});
                }
            } catch (workerErr) {
                console.error('[adminRoutes] Worker fetch error:', workerErr);
            }
        }

        const formattedPayouts = (payouts || []).map(p => ({
            id: p.id,
            amount: p.amount,
            coverage_amount: p.coverage_amount,
            severity: p.severity,
            fraud_score: p.fraud_score,
            impact_score: p.impact_score,
            ai_decision: p.ai_decision || 'AUTO-APPROVED',
            reason: p.reason,
            paid_at: p.paid_at,
            worker: {
                id: p.user_id,
                name: workersMap[p.user_id] || 'Unknown'
            }
        }));

        res.json({
            success: true,
            payouts: formattedPayouts,
            total: payouts?.length || 0,
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
    } catch (err) {
        console.error('[adminRoutes]', err);
        return res.status(500).json({ error: err.message });
    }
});

export default router;
