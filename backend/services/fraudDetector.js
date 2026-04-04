import { supabase } from '../config/supabase.js';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const ELIGIBILITY_THRESHOLD = 40;

/**
 * @param {string} workerId
 * @returns {Promise<{score: number, eligible: boolean, reason: string}>}
 */
export const getUserFraudScore = async (workerId) => {
    try {
        const { data: worker, error: workerError } = await supabase
            .from('workers')
            .select('user_id, last_active_at')
            .eq('id', workerId)
            .single();

        if (workerError || !worker) {
            return {
                score: 0,
                eligible: false,
                reason: 'Worker not found'
            };
        }

        let score = 100;
        const lastActive = worker.last_active_at ? new Date(worker.last_active_at) : null;

        if (!lastActive) {
            return {
                score: 0,
                eligible: false,
                reason: 'No activity recorded for this user.'
            };
        }

        const now = Date.now();
        const lastActiveMs = lastActive.getTime();
        const daysSinceActive = Math.floor((now - lastActiveMs) / (24 * 60 * 60 * 1000));

        if (daysSinceActive > 30) {
            score -= 70;
        } else if (daysSinceActive > 15) {
            score -= 30;
        } else if (daysSinceActive > 7) {
            score -= 10;
        }

        const thirtyDaysAgo = new Date(now - THIRTY_DAYS_MS);
        const sevenDaysAgo = new Date(now - SEVEN_DAYS_MS);

        const { data: recentClaims, error: claimsError } = await supabase
            .from('claims')
            .select('id, status, created_at')
            .eq('worker_id', workerId)
            .gte('created_at', thirtyDaysAgo.toISOString());

        if (!claimsError && recentClaims) {
            if (recentClaims.length > 3) {
                score -= 20;
            }

            const recentRejections = recentClaims.filter(c =>
                c.status === 'Rejected' &&
                new Date(c.created_at) >= sevenDaysAgo
            );

            if (recentRejections.length > 0) {
                score -= 15;
            }
        }

        score = Math.max(0, Math.min(100, score));
        const eligible = score >= ELIGIBILITY_THRESHOLD;

        let reason;
        if (eligible) {
            reason = `User passed fraud check with score ${score}`;
        } else {
            reason = `Fraud score too low: ${score}. Possible inactivity or claim abuse.`;
        }

        return { score, eligible, reason };
    } catch (err) {
        console.error('[fraudDetector]', err);
        return {
            score: 0,
            eligible: false,
            reason: 'Error checking user eligibility'
        };
    }
};

export const isUserEligible = async (userId) => {
    const result = await getUserFraudScore(userId);
    return {
        eligible: result.eligible,
        reason: result.reason
    };
};
