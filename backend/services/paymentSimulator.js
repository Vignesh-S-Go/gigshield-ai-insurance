/**
 * @param {{userId: string, amount: number}} params
 * @returns {Promise<{success: boolean, referenceId: string, method: string, amount: number, processedAt: string}>}
 */
export const simulatePayment = async ({ userId, amount }) => {
    const successRate = 0.95;
    const success = Math.random() < successRate;
    const timestamp = Date.now();
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const methods = ['UPI', 'IMPS'];
    const method = methods[Math.floor(Math.random() * methods.length)];

    const referenceId = `UPI-${timestamp}-${randomDigits}`;

    if (!success) {
        throw new Error(`Payment simulation failed for user ${userId}`);
    }

    return {
        success: true,
        referenceId,
        method,
        amount,
        processedAt: new Date().toISOString()
    };
};
