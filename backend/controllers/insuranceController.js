import { calculateRisk } from '../services/riskService.js'
import { calculatePremium } from '../services/premiumService.js'
import { validateClaim } from '../services/claimService.js'

export const calculateInsurance = async (req, res, next) => {
    try {
        const {
            lat,
            lon,
            isWorking,
            claimType,
            planType,
            maxPayout,
            requestedPayout,
            exclusions = []
        } = req.body

        if (lat === undefined || lon === undefined) {
            return res.status(400).json({ success: false, message: 'Latitude and longitude required' })
        }

        const riskResult = await calculateRisk({ lat, lon, isWorking: Boolean(isWorking) })
        const premiumResult = calculatePremium(riskResult.riskScore, planType)
        const claimResult = validateClaim({
            riskScore: riskResult.riskScore,
            claimType,
            requestedPayout,
            maxPayout,
            exclusions
        })

        res.json({
            success: true,
            data: {
                riskScore: riskResult.riskScore,
                premium: premiumResult.premium,
                claimStatus: claimResult.claimStatus,
                payout: claimResult.payout,
                reason: claimResult.reason || null,
                exclusionsApplied: claimResult.exclusionsApplied,
                weather: riskResult.weather,
                factors: riskResult.factors
            }
        })
    } catch (error) {
        next(error)
    }
}
