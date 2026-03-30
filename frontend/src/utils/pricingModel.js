/**
 * Actuarial Pricing Model for GigShield
 * 
 * Calculates risk-adjusted premiums based on geographic zones and individual worker risk scores.
 */

/**
 * Calculates the risk-adjusted premium for a gig worker policy.
 * 
 * @param {number} baseRate - The base rate for the selected plan (Basic, Standard, Pro).
 * @param {number} workerRiskScore - A value between 0 and 1 representing the worker's risk.
 * @param {string} city - The city location of the worker.
 * @returns {number} The final calculated premium.
 */
export const calculateRiskAdjustedPremium = (baseRate, workerRiskScore, city) => {
    // Factors: Mumbai/Delhi = 1.2x, Bangalore = 1.1x, others = 1.0x.
    let zoneFactor = 1.0;

    const cityUpper = city?.toUpperCase();
    if (cityUpper === 'MUMBAI' || cityUpper === 'DELHI') {
        zoneFactor = 1.2;
    } else if (cityUpper === 'BANGALORE') {
        zoneFactor = 1.1;
    }

    // Actuarial formula: Premium = (baseRate * zoneFactor) * (1 + risk_score)
    // Enforcing strict premium calculation logic based on mathematical risk probability.
    const validRiskScore = workerRiskScore > 1 ? workerRiskScore / 100 : workerRiskScore;

    // Premium adjustment applying standard 1 + risk_score factor
    const premium = (baseRate * zoneFactor) * (1 + validRiskScore);

    return Math.round(premium * 100) / 100;
};
