import OpenAI from 'openai';

/**
 * @param {{ trigger: object, payout: number, status: string, reason?: string, city: string }} params
 * @returns {Promise<string>}
 */
export const generateExplanation = async ({ trigger, payout, status, reason, city }) => {
    const aiEnabled = process.env.AI_ENABLED === 'true';
    const apiKey = process.env.OPENAI_API_KEY;

    if (aiEnabled && apiKey) {
        try {
            const openai = new OpenAI({ apiKey });

            let prompt;
            if (status === 'processed') {
                prompt = `Write a 2-sentence plain-English explanation for an insurance payout. Trigger type: ${trigger.type}, City: ${city}, Measured value: ${trigger.value}, Threshold: ${trigger.threshold}, Payout amount: ₹${payout}. Keep it simple and professional.`;
            } else {
                prompt = `Write a 2-sentence plain-English explanation for an insurance claim rejection. City: ${city}, Reason: ${reason}. Keep it simple and professional.`;
            }

            const completion = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 120,
                temperature: 0.7
            });

            return completion.choices[0]?.message?.content?.trim() || generateFallback({ trigger, payout, status, reason, city });
        } catch (err) {
            console.error('[aiExplainer]', `OpenAI API error: ${err.message}`);
            return generateFallback({ trigger, payout, status, reason, city });
        }
    }

    return generateFallback({ trigger, payout, status, reason, city });
};

/**
 * @param {{ trigger: object, payout: number, status: string, reason?: string, city: string }} params
 * @returns {string}
 */
const generateFallback = ({ trigger, payout, status, reason, city }) => {
    if (status === 'processed') {
        return `Payout of ₹${payout} approved for ${trigger.type} event in ${city}. Measured value ${trigger.value} exceeded threshold of ${trigger.threshold}.`;
    }
    return `Claim rejected for ${city}. Reason: ${reason}.`;
};
