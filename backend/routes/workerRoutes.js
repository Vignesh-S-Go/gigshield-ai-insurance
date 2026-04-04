import express from 'express';
import { getWorkers, getWorkerById, createWorker, updateWorker, getWorkerMetrics, syncWorkerStats } from '../controllers/workerController.js';
import { getRiskForecast } from '../services/riskForecastEngine.js';
import { supabase } from '../config/supabase.js';

const router = express.Router();

const PLAN_DETAILS = {
    Basic: { premium: 45, maxPayout: 3000 },
    Standard: { premium: 49, maxPayout: 5000 },
    Pro: { premium: 71, maxPayout: 7500 }
};

router.get('/', getWorkers);
router.get('/metrics', getWorkerMetrics);
router.get('/plans', (req, res) => {
    res.json({
        plans: Object.keys(PLAN_DETAILS).map(plan => ({
            name: plan,
            premium: PLAN_DETAILS[plan].premium,
            maxPayout: PLAN_DETAILS[plan].maxPayout
        }))
    });
});
router.get('/:id', getWorkerById);
router.post('/', createWorker);
router.put('/:id', updateWorker);
router.put('/:id/plan', async (req, res) => {
    try {
        const { id } = req.params;
        const { planType } = req.body;
        
        console.log('[workerRoutes] Plan change request:', { id, planType });
        
        if (!planType || !PLAN_DETAILS[planType]) {
            return res.status(400).json({ error: 'Invalid plan type. Must be Basic, Standard, or Pro.' });
        }

        // Skip worker existence check - just proceed
        console.log('[workerRoutes] Proceeding to check/create policy...');

        const { data: existingPolicy, error: fetchErr } = await supabase
            .from('policies')
            .select('id')
            .eq('worker_id', id)
            .eq('status', 'Active')
            .single();

        console.log('[workerRoutes] Existing policy check:', { existingPolicy, fetchErrCode: fetchErr?.code });

        const planDetails = PLAN_DETAILS[planType];
        const hasExistingPolicy = !fetchErr && existingPolicy && existingPolicy.id;

        console.log('[workerRoutes] Decision - hasExistingPolicy:', hasExistingPolicy);

        if (hasExistingPolicy) {
            console.log('[workerRoutes] Updating existing policy:', existingPolicy.id);
            const { error: updateErr } = await supabase
                .from('policies')
                .update({
                    plan_type: planType,
                    premium: planDetails.premium,
                    max_payout: planDetails.maxPayout
                })
                .eq('id', existingPolicy.id);

            if (updateErr) {
                console.error('[workerRoutes] Update error:', updateErr);
                return res.status(500).json({ error: 'Failed to update policy: ' + updateErr.message });
            }
            console.log('[workerRoutes] Policy updated successfully');
        } else {
            console.log('[workerRoutes] Creating new policy for worker:', id);
            const { error: insertErr } = await supabase
                .from('policies')
                .insert({
                    worker_id: id,
                    city: 'Hyderabad',
                    plan_type: planType,
                    status: 'Active',
                    premium: planDetails.premium,
                    max_payout: planDetails.maxPayout
                });

            if (insertErr) {
                console.error('[workerRoutes] Insert error:', insertErr);
                return res.status(500).json({ error: 'Failed to create policy: ' + insertErr.message });
            }
            console.log('[workerRoutes] Policy created successfully');
        }

        res.json({ success: true, planType, premium: planDetails.premium, maxPayout: planDetails.maxPayout });
    } catch (err) {
        console.error('[workerRoutes] Error:', err.message);
        res.status(500).json({ error: 'Plan change failed: ' + err.message });
    }
});
router.put('/:id/sync-stats', syncWorkerStats);
router.get('/risk', async (req, res) => {
    try {
        const { city } = req.query;
        const forecast = await getRiskForecast(city || 'Hyderabad');
        res.json(forecast);
    } catch (err) {
        console.error('[workerRoutes]', err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
