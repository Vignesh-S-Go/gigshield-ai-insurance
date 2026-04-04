/**
 * ZeroClaim Prevention Service
 * Generates contextual safety warnings based on trigger type and severity
 * Inserted in pipeline after trigger classification, before fraud check
 */

const TRIGGER_WARNING_MAP = {
    aqi_high: {
        message: 'AQI is critically high in your area. Avoid outdoor work today.',
        severity: 'high'
    },
    aqi_medium: {
        message: 'AQI rising in your area. Consider reducing work hours.',
        severity: 'medium'
    },
    weather_extreme: {
        message: 'Severe weather detected. Prioritize your safety over deliveries.',
        severity: 'high'
    },
    payment_failure: {
        message: 'Payment delays detected on your platform. Document all completed jobs.',
        severity: 'medium'
    },
    platform_downtime: {
        message: 'Your platform is experiencing downtime. Expect payout delays.',
        severity: 'medium'
    }
};

const DEFAULT_WARNING = {
    message: 'An incident has been detected. Please stay cautious.',
    severity: 'low'
};

const MEDIUM_SEVERITY = ['medium', 'severe'];
const HIGH_SEVERITY = ['high', 'severe'];

/**
 * Check if severity qualifies for prevention warning
 * @param {string} severity
 * @returns {boolean}
 */
function shouldGenerateWarning(severity) {
    const s = severity?.toLowerCase();
    return s === 'medium' || s === 'severe' || s === 'high';
}

/**
 * Get warning message for trigger type
 * @param {string} triggerType
 * @returns {Object}
 */
function getWarningForTrigger(triggerType) {
    if (!triggerType) return DEFAULT_WARNING;
    const key = triggerType.toLowerCase();
    return TRIGGER_WARNING_MAP[key] ?? DEFAULT_WARNING;
}

/**
 * Process prevention check for a worker
 * @param {Object} params
 * @param {string} params.workerId - Worker ID
 * @param {string} params.triggerType - Type of trigger
 * @param {string} params.severity - Trigger severity (mild, medium, severe)
 * @param {string} params.city - City location
 * @returns {Promise<{triggered: boolean, message: string}|null>}
 */
export async function processPreventionAlert({ workerId, triggerType, severity, city }) {
    try {
        if (!shouldGenerateWarning(severity)) {
            return null;
        }

        const warning = getWarningForTrigger(triggerType);

        const { supabase } = await import('../config/supabase.js');

        await supabase.from('notification_logs').insert({
            user_id: workerId,
            channel: 'IN_APP',
            message: warning.message,
            metadata: {
                trigger_type: triggerType,
                severity: severity,
                city: city,
                type: 'prevention_alert'
            }
        });

        return {
            triggered: true,
            message: warning.message
        };
    } catch (err) {
        console.error('[preventionService]', 'Failed to generate prevention alert:', err.message);
        return null;
    }
}

/**
 * Batch process prevention alerts for multiple workers
 * @param {Array} workers - Array of worker objects with id
 * @param {string} triggerType
 * @param {string} severity
 * @param {string} city
 * @returns {Promise<Array>} Array of prevention results
 */
export async function batchProcessPreventionAlerts(workers, triggerType, severity, city) {
    const results = [];

    for (const worker of workers) {
        const result = await processPreventionAlert({
            workerId: worker.id,
            triggerType,
            severity,
            city
        });
        results.push({ workerId: worker.id, ...result });
    }

    return results;
}
