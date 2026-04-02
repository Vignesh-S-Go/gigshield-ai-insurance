import { supabase } from '../config/supabase.js';
import { getISTISODate, formatIST } from '../utils/timeUtils.js';

export const getSmartPayoutData = async (req, res, next) => {
    try {
        const { worker_id, claim_id } = req.query;

        let workerQuery = supabase.from('workers').select('*');
        let claimQuery = supabase.from('claims').select('*');
        let policyQuery = supabase.from('policies').select('*');

        if (worker_id) {
            workerQuery = workerQuery.eq('id', worker_id);
        }
        if (claim_id) {
            claimQuery = claimQuery.eq('id', claim_id);
        }

        const { data: workers } = await workerQuery;
        const { data: claims } = await claimQuery;
        const { data: policies } = await policyQuery;

        const worker = workers?.[0];
        const claim = claims?.[0];
        const policy = policies?.find(p => p.worker_id === worker?.id && p.status === 'Active');

        if (!worker) {
            return res.status(404).json({ success: false, message: 'Worker not found' });
        }

        const riskScore = Math.round((worker.risk_score || 0.5) * 100);
        const fraudScore = await calculateFraudScore(worker.id, claim);
        const fraudRiskLevel = fraudScore >= 70 ? 'high' : fraudScore >= 40 ? 'medium' : 'low';

        const claimSeverity = claim?.payout_amount > 1500 ? 'High' : claim?.payout_amount > 800 ? 'Moderate' : 'Low';
        
        const approvalChance = calculateApprovalChance(riskScore, fraudScore, claim);
        const calculatedPayout = calculatePayoutAmount(worker, claim, policy, riskScore, fraudScore);

        const aiDecision = {
            risk_score: riskScore,
            fraud_score: fraudScore,
            fraud_risk_level: fraudRiskLevel,
            claim_severity: claimSeverity,
            approval_chance: approvalChance,
            calculated_amount: calculatedPayout,
            factors: [
                { name: 'Worker Risk Score', value: riskScore, impact: riskScore >= 70 ? 'negative' : 'positive' },
                { name: 'Claim Severity', value: claimSeverity, impact: claimSeverity === 'High' ? 'negative' : 'positive' },
                { name: 'Policy Coverage', value: policy?.plan_type || 'Standard', impact: 'positive' },
                { name: 'Fraud Check', value: fraudRiskLevel.toUpperCase(), impact: fraudRiskLevel === 'low' ? 'positive' : 'negative' },
                { name: 'GPS Verification', value: claim?.gps_verified ? 'Verified' : 'Failed', impact: claim?.gps_verified ? 'positive' : 'negative' },
            ],
            status: fraudRiskLevel === 'high' ? 'review' : approvalChance >= 70 ? 'approved' : 'rejected',
            explanation: generateExplanation(riskScore, fraudScore, claimSeverity, fraudRiskLevel, approvalChance)
        };

        res.json({
            success: true,
            data: {
                worker_id: worker.id,
                worker_name: worker.name,
                worker_city: worker.city,
                claim_id: claim?.id,
                risk_score: riskScore,
                fraud_score: fraudScore,
                fraud_risk_level: fraudRiskLevel,
                claim_severity: claimSeverity,
                approval_chance: approvalChance,
                calculated_amount: calculatedPayout,
                max_payout: policy?.max_payout || 2000,
                ai_decision: aiDecision,
                policy: policy ? {
                    plan_type: policy.plan_type,
                    premium: parseFloat(policy.premium),
                    max_payout: parseFloat(policy.max_payout),
                    status: policy.status
                } : null
            }
        });
    } catch (error) {
        next(error);
    }
};

async function calculateFraudScore(workerId, claim) {
    try {
        const { data: fraudHistory } = await supabase
            .from('fraud_history')
            .select('*')
            .eq('worker_id', workerId);

        const { data: workerClaims } = await supabase
            .from('claims')
            .select('*')
            .eq('worker_id', workerId);

        let fraudScore = 0;

        if (fraudHistory?.length > 0) {
            fraudScore += fraudHistory.length * 20;
        }

        const recentClaims = workerClaims?.filter(c => {
            const claimDate = new Date(c.created_at);
            const now = new Date();
            const diffDays = (now - claimDate) / (1000 * 60 * 60 * 24);
            return diffDays <= 30;
        });

        if (recentClaims?.length > 3) {
            fraudScore += (recentClaims.length - 3) * 10;
        }

        if (claim?.validation_status === 'Failed') {
            fraudScore += 30;
        }

        if (claim?.gps_verified === false) {
            fraudScore += 25;
        }

        return Math.min(100, Math.max(0, fraudScore));
    } catch (error) {
        console.error('[FRAUD] Error calculating fraud score:', error);
        return 0;
    }
}

function calculateApprovalChance(riskScore, fraudScore, claim) {
    let chance = 100;

    if (riskScore >= 80) chance -= 40;
    else if (riskScore >= 60) chance -= 20;
    else if (riskScore >= 40) chance -= 10;

    if (fraudScore >= 70) chance -= 50;
    else if (fraudScore >= 40) chance -= 20;

    if (claim?.validation_status === 'Failed') chance -= 30;
    if (claim?.gps_verified === false) chance -= 20;

    return Math.min(100, Math.max(5, chance));
}

function calculatePayoutAmount(worker, claim, policy, riskScore, fraudScore) {
    if (!claim) return 0;

    const basePayout = parseFloat(claim.payout_amount) || 1000;
    const maxPayout = policy?.max_payout || 2000;

    let multiplier = 1;
    
    if (riskScore >= 70) multiplier *= 0.7;
    else if (riskScore >= 50) multiplier *= 0.85;
    else multiplier *= 1;

    if (fraudScore >= 50) multiplier *= 0.5;
    else if (fraudScore >= 30) multiplier *= 0.75;

    const calculated = Math.round((basePayout * multiplier) / 100) * 100;
    return Math.min(calculated, maxPayout);
}

function generateExplanation(riskScore, fraudScore, claimSeverity, fraudRiskLevel, approvalChance) {
    if (fraudRiskLevel === 'high') {
        return `Claim requires manual review. Fraud score (${fraudScore}) exceeds threshold.`;
    }
    if (riskScore >= 70) {
        return `Worker risk score (${riskScore}) is high. Payout reduced to 70% of claim amount.`;
    }
    if (approvalChance >= 90) {
        return `All parametric thresholds met. Claim approved with full payout calculation.`;
    }
    return `Partial approval based on risk (${riskScore}) and fraud (${fraudScore}) analysis.`;
}

export const processSmartPayout = async (req, res, next) => {
    try {
        const { claim_id, worker_id, amount, ai_decision } = req.body;

        const { data: worker } = await supabase
            .from('workers')
            .select('risk_score')
            .eq('id', worker_id)
            .single();

        const fraudScore = await calculateFraudScore(worker_id, { id: claim_id });
        const fraudRiskLevel = fraudScore >= 70 ? 'high' : fraudScore >= 40 ? 'medium' : 'low';

        const { data: payout, error } = await supabase
            .from('payouts')
            .insert([{
                claim_id,
                worker_id,
                amount,
                calculated_amount: ai_decision?.calculated_amount || amount,
                risk_score: Math.round((worker?.risk_score || 0.5) * 100),
                fraud_score: fraudScore,
                fraud_risk_level: fraudRiskLevel,
                approval_status: fraudRiskLevel === 'high' ? 'manual_review' : 'auto_approved',
                ai_decision: ai_decision || {},
                status: 'processing'
            }])
            .select()
            .single();

        if (error) throw error;

        await supabase
            .from('claims')
            .update({ 
                status: fraudRiskLevel === 'high' ? 'Flagged' : 'Approved',
                ai_meta: { ...ai_decision, payout_id: payout.id },
                updated_at: getISTISODate()
            })
            .eq('id', claim_id);

        setTimeout(async () => {
            await supabase
                .from('payouts')
                .update({
                    status: 'completed',
                    processed_at: getISTISODate(),
                    blockchain_tx: `0x${Date.now().toString(16).toUpperCase()}`
                })
                .eq('id', payout.id);
        }, 2000);

        console.log(`[SMART PAYOUT: IST] 💰 Payout ${payout.id} processed at ${formatIST(new Date())}`);
        res.json({ success: true, data: payout });
    } catch (error) {
        next(error);
    }
};

export const rejectPayout = async (req, res, next) => {
    try {
        const { claim_id, reason } = req.body;

        const { data: claim, error } = await supabase
            .from('claims')
            .update({
                status: 'Rejected',
                ai_meta: { rejection_reason: reason, rejected_at: getISTISODate() },
                updated_at: getISTISODate()
            })
            .eq('id', claim_id)
            .select()
            .single();

        if (error) throw error;

        res.json({ success: true, data: claim });
    } catch (error) {
        next(error);
    }
};

export const markForReview = async (req, res, next) => {
    try {
        const { claim_id, notes } = req.body;

        const { data: claim, error } = await supabase
            .from('claims')
            .update({
                status: 'Flagged',
                ai_meta: { review_notes: notes, flagged_at: getISTISODate() },
                updated_at: getISTISODate()
            })
            .eq('id', claim_id)
            .select()
            .single();

        if (error) throw error;

        res.json({ success: true, data: claim });
    } catch (error) {
        next(error);
    }
};

export const getPayoutQueue = async (req, res, next) => {
    try {
        const { data: payouts, error } = await supabase
            .from('payouts')
            .select(`
                *,
                workers (id, name, city, risk_score),
                claims (id, trigger_type, payout_amount, status)
            `)
            .in('status', ['pending', 'processing'])
            .order('created_at', { ascending: false });

        if (error) throw error;

        const formattedPayouts = payouts.map(p => ({
            id: p.id,
            claim_id: p.claim_id,
            worker_id: p.worker_id,
            worker_name: p.workers?.name,
            worker_city: p.workers?.city,
            risk_score: Math.round((p.workers?.risk_score || 0.5) * 100),
            trigger_type: p.claims?.trigger_type,
            amount: parseFloat(p.amount),
            calculated_amount: parseFloat(p.calculated_amount),
            fraud_risk_level: p.fraud_risk_level,
            fraud_score: p.fraud_score,
            approval_status: p.approval_status,
            status: p.status,
            created_at: p.created_at
        }));

        res.json({ success: true, data: formattedPayouts });
    } catch (error) {
        next(error);
    }
};
