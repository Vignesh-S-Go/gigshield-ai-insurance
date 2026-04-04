import { supabase } from '../config/supabase.js';
import { checkTriggers } from './triggerEngine.js';
import { getActivePoliciesForCity } from './policyMatcher.js';
import { getUserFraudScore } from './fraudDetector.js';
import { calculatePayout } from './payoutEngine.js';
import { simulatePayment } from './paymentSimulator.js';
import { generateExplanation } from './aiExplainer.js';
import { logEvent, STEP_TYPES } from './eventLogger.js';
import { sendNotification } from './notificationSimulator.js';

/**
 * @param {string} city
 * @param {Array|null} forcedTriggers
 * @returns {Promise<{triggered: number, processed: number, rejected: number, totalPayout: number, sessionId: string}>}
 */
export const runClaimCycle = async (city, forcedTriggers = null) => {
    const summary = { triggered: 0, processed: 0, rejected: 0, totalPayout: 0 };
    const sessionId = crypto.randomUUID();

    try {
        let triggers;

        if (forcedTriggers && Array.isArray(forcedTriggers) && forcedTriggers.length > 0) {
            triggers = forcedTriggers;
        } else {
            triggers = await checkTriggers(city);
        }

        if (!triggers || triggers.length === 0) {
            return { ...summary, sessionId };
        }

        summary.triggered = triggers.length;

        for (const trigger of triggers) {
            await logEvent({
                sessionId,
                city,
                step: STEP_TYPES.TRIGGER_DETECTED,
                payload: { trigger }
            });

            const policies = await getActivePoliciesForCity(city);

            await logEvent({
                sessionId,
                city,
                step: STEP_TYPES.POLICY_MATCHED,
                payload: { policyCount: policies.length, policies: policies.map(p => p.id) }
            });

            for (const policy of policies) {
                try {
                    const fraudResult = await getUserFraudScore(policy.worker_id);

                    await logEvent({
                        sessionId,
                        city,
                        step: STEP_TYPES.FRAUD_CHECK,
                        payload: {
                            workerId: policy.worker_id,
                            score: fraudResult.score,
                            eligible: fraudResult.eligible,
                            reason: fraudResult.reason
                        }
                    });

                    if (!fraudResult.eligible) {
                        await logEvent({
                            sessionId,
                            city,
                            step: STEP_TYPES.REJECTED,
                            payload: {
                                workerId: policy.worker_id,
                                reason: fraudResult.reason,
                                score: fraudResult.score
                            }
                        });

                        const aiExplanation = await generateExplanation({
                            trigger,
                            payout: 0,
                            status: 'rejected',
                            reason: fraudResult.reason,
                            city
                        });

                        const claimId = `CL-${Date.now().toString(36).toUpperCase()}`;

                        await supabase.from('claims').insert([{
                            id: claimId,
                            worker_id: policy.worker_id,
                            trigger_type: trigger.type,
                            trigger_value: trigger.value,
                            status: 'Rejected',
                            payout_amount: 0,
                            payout: 0,
                            fraud_score: fraudResult.score,
                            severity: null,
                            ai_meta: { ai_explanation: aiExplanation, rejection_reason: fraudResult.reason }
                        }]);

                        await sendNotification({
                            userId: policy.worker_id,
                            claimId: claimId,
                            payoutAmount: 0,
                            city,
                            triggerType: trigger.type,
                            status: 'rejected'
                        });

                        summary.rejected++;
                    } else {
                        const payoutResult = calculatePayout(
                            policy.max_payout,
                            trigger.value,
                            trigger.threshold
                        );

                        await logEvent({
                            sessionId,
                            city,
                            step: STEP_TYPES.PAYOUT_CALCULATED,
                            payload: { amount: payoutResult.amount, severity: payoutResult.severity }
                        });

                        let paymentReference = null;
                        let paymentSuccess = false;

                        try {
                            const paymentResult = await simulatePayment({
                                userId: policy.worker_id,
                                amount: payoutResult.amount
                            });
                            paymentReference = paymentResult.referenceId;
                            paymentSuccess = paymentResult.success;
                        } catch (paymentErr) {
                            console.error('[claimProcessor]', `Payment failed: ${paymentErr.message}`);
                            paymentReference = `FAILED-${Date.now()}`;
                        }

                        await logEvent({
                            sessionId,
                            city,
                            step: STEP_TYPES.PAYMENT_PROCESSED,
                            payload: { referenceId: paymentReference, method: 'UPI', success: paymentSuccess }
                        });

                        const aiExplanation = await generateExplanation({
                            trigger,
                            payout: payoutResult.amount,
                            status: 'processed',
                            city
                        });

                        const claimId = `CL-${Date.now().toString(36).toUpperCase()}`;

                        await supabase.from('claims').insert([{
                            id: claimId,
                            worker_id: policy.worker_id,
                            trigger_type: trigger.type,
                            trigger_value: trigger.value,
                            status: 'Paid',
                            payout_amount: payoutResult.amount,
                            payout: payoutResult.amount,
                            fraud_score: fraudResult.score,
                            severity: payoutResult.severity,
                            ai_meta: { ai_explanation: aiExplanation, payment_reference: paymentReference }
                        }]);

                        await sendNotification({
                            userId: policy.worker_id,
                            claimId: claimId,
                            payoutAmount: payoutResult.amount,
                            city,
                            triggerType: trigger.type,
                            status: 'processed'
                        });

                        summary.processed++;
                        summary.totalPayout += payoutResult.amount;
                    }
                } catch (err) {
                    console.error('[claimProcessor]', `Policy processing error for policy ${policy.id}: ${err.message}`);
                    continue;
                }
            }
        }

        return summary;
    } catch (err) {
        console.error('[claimProcessor]', `Claim cycle error for ${city}: ${err.message}`);
        return { ...summary, sessionId };
    }
};
