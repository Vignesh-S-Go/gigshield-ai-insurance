import { calculateRisk, calculateRiskScore } from '../services/riskService.js'

export const calculateRiskFromLocation = async (req, res, next) => {
    try {
        const { lat, lon, isWorking } = req.body

        if (lat === undefined || lon === undefined) {
            return res.status(400).json({ success: false, message: 'Latitude and longitude are required' })
        }

        const result = await calculateRisk({ lat, lon, isWorking: Boolean(isWorking) })

        res.json({
            success: true,
            data: result
        })
    } catch (error) {
        next(error)
    }
}

export const getCalculatedRisk = async (req, res, next) => {
    try {
        const { user, activeGig, weather } = req.body

        if (!user) {
            return res.status(400).json({ success: false, message: 'User data required' })
        }

        const result = calculateRiskScore(user, activeGig, weather)

        res.json({
            success: true,
            data: result
        })
    } catch (error) {
        next(error)
    }
}
