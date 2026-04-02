const PLAN_BASE_PREMIUM = {
    Basic: 19,
    Standard: 39,
    Pro: 69
}

export const calculatePremium = (riskScore, planType = 'Standard') => {
    const normalizedPlan = PLAN_BASE_PREMIUM[planType] ? planType : 'Standard'
    let multiplier = 1

    if (riskScore >= 80) {
        multiplier = 1.8
    } else if (riskScore >= 60) {
        multiplier = 1.4
    } else if (riskScore >= 40) {
        multiplier = 1.1
    } else {
        multiplier = 0.9
    }

    const premium = Math.round(PLAN_BASE_PREMIUM[normalizedPlan] * multiplier)

    return {
        planType: normalizedPlan,
        multiplier,
        premium
    }
}
