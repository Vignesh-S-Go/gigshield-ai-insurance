import cron from 'node-cron';
import { runClaimCycle } from '../services/claimProcessor.js';

let scheduledJob = null;

/**
 * @returns {cron.ScheduledTask}
 */
export const startCronJob = () => {
    const cities = (process.env.MONITORED_CITIES || 'Delhi,Mumbai,Chennai').split(',').map(c => c.trim());

    scheduledJob = cron.schedule('*/5 * * * *', async () => {
        console.log('[CRON]', `Triggering claim cycle at ${new Date().toISOString()}`);

        for (const city of cities) {
            try {
                console.log('[CRON]', `Starting cycle for ${city}...`);
                const summary = await runClaimCycle(city);
                console.log('[CRON]', `Done: ${city} - ${JSON.stringify(summary)}`);
            } catch (err) {
                console.error('[CRON]', `Error processing ${city}: ${err.message}`);
            }
        }
    });

    console.log('[CRON]', 'Scheduled job started - running every 5 minutes');
    return scheduledJob;
};

/**
 */
export const stopCronJob = () => {
    if (scheduledJob) {
        scheduledJob.stop();
        scheduledJob = null;
        console.log('[CRON]', 'Scheduled job stopped');
    }
};

/**
 * @returns {cron.ScheduledTask|null}
 */
export const getScheduledJob = () => scheduledJob;
