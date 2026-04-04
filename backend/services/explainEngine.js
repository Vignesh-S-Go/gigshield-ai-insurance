/**
 * ZeroClaim Explain Engine
 * Generates detailed, structured explanations for every payout
 */

import { supabase } from '../config/supabase.js';

/**
 * Generate detailed payout explanation
 * @param {string} payoutId
 * @returns {Promise<Object>} Structured explanation
 */
export async function generateExplanation(payoutId) {
    try {
        const { data: payout, error } = await supabase
            .from('payout_logs')
            .select(`
                *,
                trigger_logs(trigger_type, value, threshold, severity, city),
                policies(max_payout, coverage_type),
                users(name, phone)
            `)
            .eq('id', payoutId)
            .single();

        if (error || !payout) {
            return { error: 'Payout not found' };
        }

        const trigger = payout.trigger_logs;
        const policy = payout.policies;
        const worker = payout.users;

        const severityMultipliers = {
            mild: '20%',
            medium: '30%',
            severe: '50%'
        };

        const multiplier = severityMultipliers[payout.severity?.toLowerCase()] || '30%';

        let reason = '';
        switch (trigger?.trigger_type) {
            case 'HEAVY_RAIN':
                reason = `Rainfall of ${trigger.value}mm exceeded threshold of ${trigger.threshold}mm. ${payout.severity} severity triggered ${multiplier} payout based on worker dependency.`;
                break;
            case 'AQI_HIGH':
                reason = `Air Quality Index reached ${trigger.value}, above safe threshold of ${trigger.threshold}. ${payout.severity} severity triggered protection for outdoor worker.`;
                break;
            case 'FLOOD_ALERT':
                reason = `Flood warning issued in ${trigger.city}. ${payout.severity} severity triggered maximum ${multiplier} payout protection.`;
                break;
            case 'HEAT_WAVE':
                reason = `Temperature exceeded ${trigger.threshold}°C at ${trigger.value}°C. ${payout.severity} severity triggered heat protection payout.`;
                break;
            default:
                reason = `${trigger?.trigger_type?.replace(/_/g, ' ')} event detected. ${payout.severity} severity triggered payout based on worker dependency and coverage.`;
        }

        if (payout.impact_score >= 75) {
            reason += ' High worker dependency score applied.';
        } else if (payout.impact_score < 40) {
            reason += ' Lower dependency adjusted payout accordingly.';
        }

        return {
            payout_id: payout.id,
            worker: {
                name: worker?.name || 'Unknown',
                phone: worker?.phone ? `+91 ${worker.phone.slice(-10)}` : 'N/A'
            },
            trigger: {
                type: trigger?.trigger_type?.replace(/_/g, ' ') || 'Unknown',
                value: trigger?.value || 0,
                threshold: trigger?.threshold || 0,
                city: trigger?.city || 'N/A',
                severity: payout.severity || 'Unknown'
            },
            coverage: {
                max_payout: policy?.max_payout || payout.coverage_amount,
                type: policy?.coverage_type || 'parametric'
            },
            calculation: {
                multiplier: multiplier,
                impact_score: payout.impact_score || 0,
                formula: `Coverage (${payout.coverage_amount}) × ${multiplier} × Impact Score (${payout.impact_score || 50}/100)`
            },
            final_payout: payout.amount,
            reason: reason,
            timestamp: payout.paid_at,
            verification: {
                fraud_check: payout.fraud_score <= 70 ? 'PASSED' : 'FAILED',
                policy_verified: payout.policy_id ? 'VERIFIED' : 'PENDING',
                instant_settlement: 'ENABLED'
            }
        };
    } catch (err) {
        console.error('[explainEngine]', err.message);
        return { error: err.message };
    }
}

/**
 * Get batch explanation for multiple payouts
 * @param {Array<string>} payoutIds
 * @returns {Promise<Array>}
 */
export async function generateBatchExplanations(payoutIds) {
    const explanations = [];
    for (const id of payoutIds) {
        const exp = await generateExplanation(id);
        explanations.push(exp);
    }
    return explanations;
}