import axios from 'axios';

// Fallback mock responses if API key is not configured
const mockGeminiResponse = {
    claimExplanation: {
        reason: "Claim flagged due to catastrophic event clause parameters.",
        policyClause: "Standard Pandemic / War exclusions apply (Clause 4.2).",
        riskReasoning: "The event type inherently triggers exclusion protocol."
    },
    riskAssistant: "Heavy rain + night delivery detected in Mumbai → risk probability increased by 30%. Drive slower via eastern highway.",
    digitalTwin: "Digital Twin Projection: Fatigue markers detected. Risk likely to increase by 20% in next 3 days due to continued late-night deliveries.",
};

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export const aiService = {

    // 1(a). Explain Claim Decision
    explainClaim: async (claimData, rulesDecision) => {
        if (!GEMINI_API_KEY) {
            console.log("No Gemini API key, using mock.");
            return new Promise(resolve => setTimeout(() => resolve(mockGeminiResponse.claimExplanation), 1000));
        }

        try {
            const prompt = `Act as an expert insurance actuary AI. Explain this claim decision clearly and concisely in JSON format.
            Claim Data: ${JSON.stringify(claimData)}
            Decision Made: ${JSON.stringify(rulesDecision)}
            
            Return ONLY a valid JSON object strictly matching this structure:
            {
                "reason": "Clear explanation of approval or rejection",
                "policyClause": "Specific clause referenced",
                "riskReasoning": "Why the risk profile led to this automated conclusion"
            }`;

            const response = await axios.post(API_URL, {
                contents: [{ parts: [{ text: prompt }] }]
            });

            // Parse out markdown code blocks if any
            let jsonString = response.data.candidates[0].content.parts[0].text;
            jsonString = jsonString.replace(/```json/g, '').replace(/```/g, '');
            return JSON.parse(jsonString);

        } catch (error) {
            console.error("Gemini API Error:", error);
            return mockGeminiResponse.claimExplanation;
        }
    },

    // 1(b). Risk Assistant & Alerts
    generateRiskAlert: async (weatherContext, tripContext) => {
        if (!GEMINI_API_KEY) {
            return mockGeminiResponse.riskAssistant;
        }

        try {
            const prompt = `Act as a real-time safety AI for gig workers. Keep it super brief, strict and clear (max 2 sentences).
            Current Weather: ${JSON.stringify(weatherContext)}
            Trip Info: ${JSON.stringify(tripContext)}
            
            Generate a hyper-specific smart alert that quantifies risk increase.
            Example format: 'Heavy rain + night delivery -> risk increased by 30%'`;

            const response = await axios.post(API_URL, {
                contents: [{ parts: [{ text: prompt }] }]
            });
            return response.data.candidates[0].content.parts[0].text;
        } catch (error) {
            return mockGeminiResponse.riskAssistant;
        }
    },

    // 3. Digital Twin Simulation Prediction
    simulateDigitalTwin: async (workerHistory) => {
        if (!GEMINI_API_KEY) {
            return mockGeminiResponse.digitalTwin;
        }
        try {
            const prompt = `Act as a behavioral predictive twin model. Analyze this worker data and predict future 3-day risk in 3 concise sentences.
            History: ${JSON.stringify(workerHistory)}
            Output format: 'Risk likely to increase by 20% in next 3 days. Focus on avoiding late night shifts to maintain streak.'`;

            const response = await axios.post(API_URL, {
                contents: [{ parts: [{ text: prompt }] }]
            });
            return response.data.candidates[0].content.parts[0].text;
        } catch (error) {
            return mockGeminiResponse.digitalTwin;
        }
    }
};
