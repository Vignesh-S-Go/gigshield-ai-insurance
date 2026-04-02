import api from './api'

export const aiService = {
    getAIExplanation: async (claimData) => {
        try {
            const res = await api.getExplanation(claimData)
            return res.explanation
        } catch (error) {
            console.error('[AI Service] Error:', error)
            return 'Unable to generate explanation at this time.'
        }
    },

    analyzeClaim: async (description) => {
        const res = await api.analyzeClaimDescription(description)
        return res.analysis
    },

    generateRiskAlert: async () => {
        await new Promise(resolve => setTimeout(resolve, 500))
        return 'High traffic density detected on your current route. Risk multiplier adjusted.'
    },

    simulateDigitalTwin: async () => {
        await new Promise(resolve => setTimeout(resolve, 800))
        return 'Digital Twin Prediction: Maintaining current speed and rest intervals will increase your Safety Score by 4% over the next 2 hours.'
    }
}
