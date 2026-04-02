import axios from 'axios'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const model = 'gemini-3.1-flash-lite-preview'
const cache = new Map()
const CACHE_TTL = 1000 * 60 * 15

const getCacheKey = (data) => JSON.stringify(data)

const getCached = (key) => {
    const entry = cache.get(key)
    if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
        return entry.value
    }

    cache.delete(key)
    return null
}

const setCache = (key, value) => {
    cache.set(key, { value, timestamp: Date.now() })
}

const extractText = (response) => response?.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()

export const generateFallbackExplanation = ({ risk, status, reason }) => {
    const normalizedStatus = String(status || '').toLowerCase()

    if (normalizedStatus === 'rejected') {
        return reason || 'Claim rejected because it did not satisfy policy coverage rules.'
    }

    if (normalizedStatus === 'flagged') {
        return reason || 'Claim needs manual review because the automated engine detected elevated risk.'
    }

    if (Number(risk) > 70) {
        return reason || 'High operational risk was detected based on working conditions and weather exposure.'
    }

    if (normalizedStatus === 'approved') {
        return reason || 'Claim approved because it satisfies the active policy rules.'
    }

    return reason || 'Unable to generate explanation at this time.'
}

export const getAIExplanation = async (data) => {
    const cacheKey = getCacheKey(data)
    const cached = getCached(cacheKey)
    if (cached) return cached

    if (!GEMINI_API_KEY) {
        return generateFallbackExplanation(data)
    }

    const prompt = `You are an insurance claims adjuster for GigShield.
Risk Score: ${data.risk}
Status: ${data.status}
Reason: ${data.reason || 'Not provided'}

Explain the decision in 2 short sentences using clear, customer-safe language.`

    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
            {
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.4,
                    maxOutputTokens: 150
                }
            },
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000
            }
        )

        const explanation = extractText(response)
        if (!explanation) {
            return generateFallbackExplanation(data)
        }

        setCache(cacheKey, explanation)
        return explanation
    } catch (error) {
        console.error('[AI Service] Gemini Explanation error:', error.response?.data || error.message)
        return generateFallbackExplanation(data)
    }
}

export const explainClaim = async (claimData, decisionStatus) => {
    if (!GEMINI_API_KEY) {
        return {
            summary: 'Claim evaluated using fallback decision logic.',
            reason: 'Risk and policy rules were checked using deterministic fallback rules because AI output was unavailable.'
        }
    }

    try {
        const prompt = `Act as an insurance claims adjuster. Explain why this claim was ${decisionStatus}: ${JSON.stringify(claimData)}. Keep it professional and under 3 sentences.`
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
            { contents: [{ parts: [{ text: prompt }] }] },
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000
            }
        )

        const reason = extractText(response)
        return {
            summary: `AI insight generated for ${decisionStatus}.`,
            reason: reason || 'Explanation could not be generated.'
        }
    } catch (error) {
        console.error('[AI Service] Gemini Claim explanation error:', error.message)
        return {
            summary: 'Claim evaluated using fallback logic.',
            reason: 'Error connecting to Gemini AI.'
        }
    }
}

export const analyzeClaim = async (description) => {
    if (!GEMINI_API_KEY) {
        return {
            incident_type: 'OTHER',
            severity: 'MEDIUM',
            assets_damaged: [],
            confidence_score: 0.76,
            brief_summary: 'Fallback extraction used because AI analysis was unavailable.'
        }
    }

    try {
        const prompt = `Analyze this incident description and return raw JSON only. Do not include markdown formatting.
"${description}"

Fields:
- incident_type (VEHICLE, INJURY, THEFT, OTHER)
- severity (LOW, MEDIUM, HIGH)
- assets_damaged (array)
- confidence_score (0-1)
- brief_summary`

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
            { contents: [{ parts: [{ text: prompt }] }] },
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000
            }
        )

        let content = extractText(response)
        if (content) {
            // Clean markdown if present
            content = content.replace(/```json/g, '').replace(/```/g, '').trim()
            return JSON.parse(content)
        }
        throw new Error('Empty AI response')
    } catch (error) {
        console.error('[AI Service] Gemini Claim analysis error:', error.message)
        return {
            incident_type: 'OTHER',
            severity: 'MEDIUM',
            assets_damaged: [],
            confidence_score: 0.76,
            brief_summary: 'Error occurred during AI analysis.'
        }
    }
}
