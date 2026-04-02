/**
 * Simple in-memory anti-fraud perimeter cache 
 * In production this would run against Redis
 */
const userClaimCache = new Map();

exports.checkFraudulentVelocity = (userId) => {
    const timeNow = Date.now();
    const history = userClaimCache.get(userId) || [];

    // Look strictly for claims inside the previous 24-hour cycle
    const oneDayInMs = 24 * 60 * 60 * 1000;
    const recentSubmissions = history.filter(time => (timeNow - time) < oneDayInMs);

    if (recentSubmissions.length >= 2) {
        // Red Flagged for Velocity (User submitting rapid duplicate claims)
        console.warn(`[FRAUD ALERT] User <${userId}> tripped high-velocity submission rule.`);
        return true;
    }

    // Add new footprint and cache
    recentSubmissions.push(timeNow);
    userClaimCache.set(userId, recentSubmissions);

    return false;
};
