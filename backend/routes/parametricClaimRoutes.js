import express from 'express';
import { runClaimCycle } from '../services/claimProcessor.js';
import { supabase } from '../config/supabase.js';

const router = express.Router();

router.post('/run-check', async (req, res) => {
    try {
        const { city } = req.body;

        if (!city || typeof city !== 'string') {
            return res.status(400).json({ success: false, error: 'City is required' });
        }

        const summary = await runClaimCycle(city.trim());
        return res.json({ success: true, summary });
    } catch (err) {
        console.error('[parametricClaimRoutes]', `Run check error: ${err.message}`);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const { data: claims, error, count } = await supabase
            .from('claims')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            console.error('[parametricClaimRoutes]', `Fetch claims error: ${error.message}`);
            return res.status(500).json({ success: false, error: 'Failed to fetch claims' });
        }

        return res.json({
            success: true,
            data: claims || [],
            total: count || 0,
            page,
            limit
        });
    } catch (err) {
        console.error('[parametricClaimRoutes]', err);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

export default router;
