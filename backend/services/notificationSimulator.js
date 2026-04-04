import { supabase } from '../config/supabase.js';

/**
 * @param {{ userId: string, claimId: string, payoutAmount: number, city: string, triggerType: string, status: string }} params
 * @returns {Promise<{ success: boolean, channel: string, message: string }>}
 */
export const sendNotification = async ({ userId, claimId, payoutAmount, city, triggerType, status }) => {
    try {
        const channels = ['SMS', 'PUSH'];
        const channel = channels[Math.floor(Math.random() * channels.length)];

        let message;

        if (status === 'processed') {
            if (channel === 'SMS') {
                message = `INSURE: Your claim for ${triggerType} in ${city} is approved. ₹${payoutAmount} will be credited within 2 hours. Ref: ${claimId}`;
            } else {
                message = `Claim Approved ✓ — ₹${payoutAmount} payout for ${triggerType} event in ${city}. Tap to view details.`;
            }
        } else {
            if (channel === 'SMS') {
                message = `INSURE: Your claim for ${triggerType} in ${city} could not be processed. Contact support for details.`;
            } else {
                message = `Claim Update — Your ${city} ${triggerType} claim was not approved. Tap to learn more.`;
            }
        }

        const successRate = 0.98;
        const willSucceed = Math.random() < successRate;

        const { error } = await supabase
            .from('notifications')
            .insert([{
                user_id: userId,
                claim_id: claimId,
                channel,
                message,
                status: willSucceed ? 'sent' : 'failed'
            }]);

        if (error) {
            console.error('[notificationSimulator]', `Failed to insert notification: ${error.message}`);
        }

        return {
            success: willSucceed,
            channel,
            message
        };
    } catch (err) {
        console.error('[notificationSimulator]', err);
        return {
            success: false,
            channel: 'UNKNOWN',
            message: 'Notification failed to send'
        };
    }
};
