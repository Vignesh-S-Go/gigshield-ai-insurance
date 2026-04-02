export const EXCLUSIONS = ['war', 'pandemic', 'terrorism', 'fraud']

const TRIGGER_PAYOUT_MULTIPLIER = {
    Rain: 0.45,
    Heat: 0.35,
    Flood: 0.7,
    AQI: 0.3,
    Curfew: 0.6,
    Emergency: 0.75
}

export const normalizeClaimType = (claimType) => {
    const input = String(claimType || '').trim().toLowerCase()
    const mapping = {
        rain: 'Rain',
        heat: 'Heat',
        flood: 'Flood',
        aqi: 'AQI',
        curfew: 'Curfew',
        emergency: 'Emergency'
    }

    return mapping[input] || claimType || 'Emergency'
}

export const validateClaim = ({
    riskScore = 0,
    claimType,
    requestedPayout,
    maxPayout = 5000,
    exclusions = [],
    policy = null
}) => {
    const normalizedType = normalizeClaimType(claimType)
    const typeForCheck = String(claimType || normalizedType).toLowerCase()
    const activeExclusions = [...new Set([...EXCLUSIONS, ...exclusions.map((item) => String(item).toLowerCase())])]

    if (activeExclusions.some((entry) => typeForCheck.includes(entry))) {
        return {
            status: 'rejected',
            claimStatus: 'Rejected',
            reason: 'Claim falls under a policy exclusion.',
            payout: 0,
            exclusionsApplied: activeExclusions.filter((entry) => typeForCheck.includes(entry))
        }
    }

    if (policy && policy.status && policy.status !== 'Active') {
        return {
            status: 'rejected',
            claimStatus: 'Rejected',
            reason: 'Policy is not active.',
            payout: 0,
            exclusionsApplied: []
        }
    }

    if (riskScore >= 90) {
        return {
            status: 'flagged',
            claimStatus: 'Flagged',
            reason: 'Claim exceeds automated approval threshold and requires review.',
            payout: 0,
            exclusionsApplied: []
        }
    }

    const payoutCap = Number(policy?.max_payout ?? maxPayout ?? 5000)
    const basePayout = Math.round(payoutCap * (TRIGGER_PAYOUT_MULTIPLIER[normalizedType] || 0.4))
    const payout = Math.max(0, Math.min(Number(requestedPayout || basePayout), payoutCap))

    return {
        status: 'approved',
        claimStatus: 'Approved',
        reason: 'Claim satisfies automated coverage rules.',
        payout,
        exclusionsApplied: []
    }
}
