import { supabase } from '../config/supabase.js';
import { getISTISODate, formatIST } from '../utils/timeUtils.js';

export const getPayouts = async (req, res, next) => {
    try {
        const { worker_id, status } = req.query;
        
        let query = supabase
            .from('payouts')
            .select(`
                *,
                workers (id, name, city),
                claims (id, trigger_type)
            `);
        
        if (worker_id) query = query.eq('worker_id', worker_id);
        if (status && status !== 'All') query = query.eq('status', status);
        
        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) throw error;
        
        const payoutsFormatted = data.map(p => ({
            id: p.id,
            claimId: p.claims?.id,
            workerId: p.worker_id,
            workerName: p.workers?.name,
            workerCity: p.workers?.city,
            triggerType: p.claims?.trigger_type,
            amount: parseFloat(p.amount),
            status: p.status,
            processedAt: p.processed_at,
            createdAt: p.created_at
        }));
        
        res.json({ success: true, count: payoutsFormatted.length, data: payoutsFormatted });
    } catch (error) {
        next(error);
    }
};

export const createPayout = async (req, res, next) => {
    try {
        const { claim_id, worker_id, amount } = req.body;
        
        const { data: newPayout, error } = await supabase
            .from('payouts')
            .insert([{
                claim_id,
                worker_id,
                amount,
                status: 'pending'
            }])
            .select()
            .single();
        
        if (error) throw error;
        
        await supabase
            .from('claims')
            .update({ status: 'Paid', updated_at: getISTISODate() })
            .eq('id', claim_id);
        
        console.log(`[PAYOUT: IST] ✅ Payout ${newPayout.id} created at ${formatIST(new Date(), { dateStyle: 'medium', timeStyle: 'medium' })}`);
        res.status(201).json({ success: true, data: newPayout });
    } catch (error) {
        next(error);
    }
};

export const processPayout = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const { data: payout, error: payoutError } = await supabase
            .from('payouts')
            .select('*')
            .eq('id', id)
            .single();
        
        if (payoutError) throw payoutError;
        
        const { data, error } = await supabase
            .from('payouts')
            .update({
                status: 'completed',
                processed_at: getISTISODate()
            })
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        
        await supabase
            .from('claims')
            .update({ status: 'Paid' })
            .eq('id', payout.claim_id);
        
        console.log(`[PAYOUT: IST] 💰 Payout ${id} completed at ${formatIST(new Date(), { dateStyle: 'medium', timeStyle: 'medium' })}`);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

export const getPayoutStats = async (req, res, next) => {
    try {
        const { data: payouts } = await supabase.from('payouts').select('*');
        
        const stats = {
            totalPayouts: payouts?.length || 0,
            totalAmount: payouts?.filter(p => p.status === 'completed').reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0,
            pending: payouts?.filter(p => p.status === 'pending').length || 0,
            processing: payouts?.filter(p => p.status === 'processing').length || 0,
            completed: payouts?.filter(p => p.status === 'completed').length || 0,
            failed: payouts?.filter(p => p.status === 'failed').length || 0
        };
        
        res.json({ success: true, data: stats });
    } catch (error) {
        next(error);
    }
};

export const getPayoutsByZone = async (req, res, next) => {
    try {
        const { data: payouts } = await supabase
            .from('payouts')
            .select(`
                amount,
                workers (city)
            `)
            .eq('status', 'completed');
        
        const zoneData = {};
        payouts?.forEach(p => {
            const city = p.workers?.city || 'Other';
            if (!zoneData[city]) {
                zoneData[city] = { zone: city, payouts: 0, claims: 0 };
            }
            zoneData[city].payouts += parseFloat(p.amount);
            zoneData[city].claims += 1;
        });
        
        res.json({ success: true, data: Object.values(zoneData) });
    } catch (error) {
        next(error);
    }
};
