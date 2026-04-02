import { getAIExplanation, generateFallbackExplanation } from '../services/aiService.js'

export const getExplanation = async (req, res, next) => {
    try {
        const risk = req.body.risk ?? req.body.riskScore
        const status = req.body.status ?? req.body.claimStatus
        const reason = req.body.reason ?? req.body.message

        if (risk === undefined || !status) {
            return res.status(400).json({ success: false, message: 'Missing risk or status' })
        }

        const explanation = await getAIExplanation({ risk, status, reason })

        res.json({
            success: true,
            explanation,
            fallback: explanation === generateFallbackExplanation({ risk, status, reason })
        })
    } catch (error) {
        next(error)
    }
}
