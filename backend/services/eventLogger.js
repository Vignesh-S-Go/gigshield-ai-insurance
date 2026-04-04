import { supabase } from '../config/supabase.js';

export const STEP_TYPES = {
    TRIGGER_DETECTED: 'TRIGGER_DETECTED',
    POLICY_MATCHED: 'POLICY_MATCHED',
    FRAUD_CHECK: 'FRAUD_CHECK',
    PAYOUT_CALCULATED: 'PAYOUT_CALCULATED',
    PAYMENT_PROCESSED: 'PAYMENT_PROCESSED',
    REJECTED: 'REJECTED'
};

/**
 * @param {{ sessionId: string, city: string, step: string, payload: object }} params
 * @returns {Promise<void>}
 */
export const logEvent = async ({ sessionId, city, step, payload }) => {
    try {
        const { error } = await supabase
            .from('event_logs')
            .insert([{
                session_id: sessionId,
                city,
                step,
                payload
            }]);

        if (error) {
            console.error('[eventLogger]', `Failed to log event: ${error.message}`);
        }
    } catch (err) {
        console.error('[eventLogger]', err);
    }
};

/**
 * @param {{ limit?: number }} params
 * @returns {Promise<Array>}
 */
export const getRecentEvents = async ({ limit = 50 } = {}) => {
    try {
        const { data, error } = await supabase
            .from('event_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('[eventLogger]', `Failed to fetch events: ${error.message}`);
            return [];
        }

        return data || [];
    } catch (err) {
        console.error('[eventLogger]', err);
        return [];
    }
};
