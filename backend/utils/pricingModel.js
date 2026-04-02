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
    let zoneFactor = 1.0;

    const cityUpper = city?.toUpperCase();
    if (cityUpper === 'MUMBAI' || cityUpper === 'DELHI') {
        zoneFactor = 1.2;
    } else if (cityUpper === 'BANGALORE') {
        zoneFactor = 1.1;
    }

    const validRiskScore = workerRiskScore > 1 ? workerRiskScore / 100 : workerRiskScore;
    const premium = (baseRate * zoneFactor) * (1 + validRiskScore);

    return Math.round(premium * 100) / 100;
};

export const calculatePayoutAmount = (triggerType, maxPayout) => {
    const payoutRates = {
        Rain: 0.50,
        Heat: 0.40,
        Flood: 0.75,
        AQI: 0.30,
        Curfew: 0.60
    };
    return Math.round(maxPayout * (payoutRates[triggerType] || 0.50));
};

export const getZoneRiskMultiplier = (city) => {
    const zoneMultipliers = {
        'MUMBAI': 1.3,
        'DELHI': 1.25,
        'BANGALORE': 1.15,
        'CHENNAI': 1.1,
        'HYDERABAD': 1.05,
        'PUNE': 1.0,
        'KOLKATA': 1.1,
        'JAIPUR': 1.15,
        'AHMEDABAD': 1.05,
        'LUCKNOW': 1.0
    };
    return zoneMultipliers[city?.toUpperCase()] || 1.0;
};

export const getSeasonMultiplier = () => {
    const month = new Date().getMonth();
    if (month >= 6 && month <= 9) return 1.4;
    if (month >= 3 && month <= 5) return 1.2;
    return 1.0;
};
