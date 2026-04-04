/**
 * ZeroClaim Payout Engine
 * Calculates payout amounts with impact score multiplier
 */

const RATE_MILD = parseFloat(process.env.PAYOUT_RATE_MILD) || 0.20;
const RATE_MEDIUM = parseFloat(process.env.PAYOUT_RATE_MEDIUM) || 0.30;
const RATE_SEVERE = parseFloat(process.env.PAYOUT_RATE_SEVERE) || 0.50;

const RATIO_MILD = 1.2;
const RATIO_MEDIUM = 1.6;

/**
 * @param {number} coverageAmount
 * @param {number} triggerValue
 * @param {number} threshold
 * @param {number} impactScore - Worker impact score (0-100)
 * @returns {{ amount: number, severity: string, impactScore: number }}
 */
export const calculatePayout = (coverageAmount, triggerValue, threshold, impactScore = 50) => {
    const ratio = triggerValue / threshold;

    let severity;
    let rate;

    if (ratio < RATIO_MILD) {
        severity = 'MILD';
        rate = RATE_MILD;
    } else if (ratio < RATIO_MEDIUM) {
        severity = 'MEDIUM';
        rate = RATE_MEDIUM;
    } else {
        severity = 'SEVERE';
        rate = RATE_SEVERE;
    }

    const impactMultiplier = Math.max(0, Math.min(impactScore / 100, 1.5));
    const baseAmount = coverageAmount * rate;
    const amount = Math.round(baseAmount * impactMultiplier * 100) / 100;

    return { amount, severity, impactScore };
};

export const SEVERITY_RATES = {
    mild: RATE_MILD,
    medium: RATE_MEDIUM,
    severe: RATE_SEVERE
};
