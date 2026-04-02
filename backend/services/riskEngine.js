const calculateRiskScore = (user, activeGig, weatherData) => {
    // Base score is set at 85 (Good)
    let score = user.safety_score || 85;
    const factors = [];

    // 1. Fatigue Logic (Subtract 5 pts for every 4 hours worked)
    if (activeGig && activeGig.start_time) {
        const hours = (new Date() - new Date(activeGig.start_time)) / (1000 * 60 * 60);
        if (hours > 8) {
            score -= 20;
            factors.push({ type: 'FATIGUE', impact: -20, message: 'DANGER: Over 8 hours of continuous work.' });
        } else if (hours > 4) {
            score -= 10;
            factors.push({ type: 'FATIGUE', impact: -10, message: 'CAUTION: Fatigue building after 4+ hours.' });
        } else {
            score += 2; // Minor bonus for being fresh
            factors.push({ type: 'FATIGUE', impact: 2, message: 'OPTIMAL: Early shift energy.' });
        }
    }

    // 2. Zone/Weather Hazard
    if (weatherData) {
        if (weatherData.condition === 'Storm' || weatherData.condition === 'Snow') {
            score -= 15;
            factors.push({ type: 'ENVIRONMENT', impact: -15, message: 'SEVERE: Dangerous weather conditions detected.' });
        } else if (weatherData.condition === 'Rain') {
            score -= 5;
            factors.push({ type: 'ENVIRONMENT', impact: -5, message: 'MODERATE: Slippery roads alert.' });
        }
    }

    // 3. Job Complexity (e.g., Courier vs Rideshare)
    if (user.job_type === 'COURIER_HV') { // Heavy Delivery
        score -= 5;
        factors.push({ type: 'COMPLEXITY', impact: -5, message: 'JOB: Handling heavy/bulk cargo increases physical risk.' });
    }

    // Clamp score between 0 and 100
    score = Math.max(0, Math.min(100, Math.round(score)));

    // Decision Logic
    let status = 'STABLE';
    if (score < 40) status = 'CRITICAL';
    else if (score < 70) status = 'CAUTION';

    return {
        score,
        status,
        factors,
        recommendation: status === 'CRITICAL' ? 'Stop working immediately and find a safe spot.' :
            status === 'CAUTION' ? 'Be more aware of your surroundings.' :
                'Maintain current safety standards.'
    };
};

module.exports = { calculateRiskScore };
