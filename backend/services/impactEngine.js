/**
 * ZeroClaim Impact Engine
 * Calculates worker impact score based on earnings, hours, and trigger relevance
 * Deterministic formula — no randomness, no Math.random()
 */

const TRIGGER_RELEVANCE_MAP = {
    aqi_high: 0.9,
    aqi_medium: 0.6,
    payment_failure: 0.8,
    platform_downtime: 0.7,
    weather_extreme: 0.85,
    unknown: 0.3
};

const WEIGHTS = {
    earnings: 0.50,
    hours: 0.30,
    triggerRelevance: 0.20
};

const NORMALIZATION = {
    earnings: { divisor: 10000, cap: 1.0 },
    hours: { divisor: 10, cap: 1.0 }
};

const DEFAULT_TRIGGER_RELEVANCE = 0.3;

function getTriggerRelevance(triggerType) {
    if (!triggerType) return DEFAULT_TRIGGER_RELEVANCE;
    const key = triggerType.toLowerCase();
    return TRIGGER_RELEVANCE_MAP[key] ?? DEFAULT_TRIGGER_RELEVANCE;
}

function normalize(value, field) {
    if (value === null || value === undefined || isNaN(value)) return 0;
    const normalized = value / NORMALIZATION[field].divisor;
    return Math.min(normalized, NORMALIZATION[field].cap);
}

function clamp(value, min = 0, max = 100) {
    return Math.max(min, Math.min(max, value));
}

/**
 * Calculate worker impact score
 * @param {Object} params
 * @param {number|null} params.earningsLast7Days - Worker's earnings in last 7 days
 * @param {number|null} params.avgDailyHours - Average hours worked per day
 * @param {string|null} params.triggerType - Type of trigger (e.g., 'aqi_high', 'weather_extreme')
 * @returns {number} Impact score 0-100
 */
export function calculateImpactScore({ earningsLast7Days, avgDailyHours, triggerType }) {
    const normalizedEarnings = normalize(earningsLast7Days ?? 0, 'earnings');
    const normalizedHours = normalize(avgDailyHours ?? 0, 'hours');
    const triggerRelevance = getTriggerRelevance(triggerType);

    const rawScore =
        (normalizedEarnings * WEIGHTS.earnings) +
        (normalizedHours * WEIGHTS.hours) +
        (triggerRelevance * WEIGHTS.triggerRelevance);

    const finalScore = rawScore * 100;

    return clamp(Math.round(finalScore), 0, 100);
}

/**
 * Get worker data for impact score calculation
 * @param {string} workerId
 * @returns {Promise<{earningsLast7Days: number, avgDailyHours: number, triggerType: string|null}>}
 */
export async function getWorkerImpactData(workerId) {
    const { supabase } = await import('../config/supabase.js');

    const { data: worker, error } = await supabase
        .from('workers')
        .select('weekly_earnings, avg_daily_hours')
        .eq('id', workerId)
        .single();

    if (error || !worker) {
        return {
            earningsLast7Days: 0,
            avgDailyHours: 0,
            triggerType: null
        };
    }

    return {
        earningsLast7Days: worker.weekly_earnings ?? 0,
        avgDailyHours: worker.avg_daily_hours ?? 0,
        triggerType: null
    };
}

/**
 * Calculate impact score with real worker data
 * @param {string} workerId
 * @param {string|null} triggerType
 * @returns {Promise<number>}
 */
export async function calculateWorkerImpactScore(workerId, triggerType = null) {
    const impactData = await getWorkerImpactData(workerId);
    return calculateImpactScore({
        ...impactData,
        triggerType
    });
}
