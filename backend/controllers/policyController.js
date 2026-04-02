import { supabase } from '../config/supabase.js';
import { calculateRiskAdjustedPremium } from '../utils/pricingModel.js';
import { getISTISODate, formatIST } from '../utils/timeUtils.js';

export const getPolicies = async (req, res, next) => {
    try {
        const { status, worker_id } = req.query;
        
        let query = supabase
            .from('policies')
            .select(`
                *,
                workers (id, name, city)
            `);
        
        if (status && status !== 'All') query = query.eq('status', status);
        if (worker_id) query = query.eq('worker_id', worker_id);
        
        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) throw error;
        
        const policiesFormatted = data.map(p => ({
            id: p.id,
            workerId: p.worker_id,
            workerName: p.workers?.name,
            workerCity: p.workers?.city,
            planType: p.plan_type,
            premium: parseFloat(p.premium),
            maxPayout: parseFloat(p.max_payout),
            status: p.status,
            startDate: p.start_date,
            renewalDate: p.renewal_date,
            autoRenew: p.auto_renew,
            city: p.city,
            createdAt: p.created_at
        }));
        
        res.json({ success: true, count: policiesFormatted.length, data: policiesFormatted });
    } catch (error) {
        next(error);
    }
};

export const getPolicyById = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const { data, error } = await supabase
            .from('policies')
            .select(`
                *,
                workers (id, name, city, risk_score)
            `)
            .eq('id', id)
            .single();
        
        if (error) throw error;
        
        const formattedPolicy = {
            id: data.id,
            workerId: data.worker_id,
            workerName: data.workers?.name,
            workerCity: data.workers?.city,
            planType: data.plan_type,
            premium: parseFloat(data.premium),
            maxPayout: parseFloat(data.max_payout),
            status: data.status,
            startDate: data.start_date,
            renewalDate: data.renewal_date,
            autoRenew: data.auto_renew,
            city: data.city,
            createdAt: data.created_at
        };
        
        res.json({ success: true, data: formattedPolicy });
    } catch (error) {
        next(error);
    }
};

export const createPolicy = async (req, res, next) => {
    try {
        const { worker_id, plan_type, city } = req.body;
        
        const planDetails = {
            Basic: { premium: 25, maxPayout: 500 },
            Standard: { premium: 49, maxPayout: 1200 },
            Pro: { premium: 79, maxPayout: 2000 }
        };
        
        const { data: worker } = await supabase
            .from('workers')
            .select('risk_score, city')
            .eq('id', worker_id)
            .single();
        
        const baseRate = planDetails[plan_type]?.premium || 49;
        const maxPayout = planDetails[plan_type]?.maxPayout || 1200;
        const riskScore = worker?.risk_score || 0.5;
        const workerCity = city || worker?.city || 'Other';
        
        const premium = calculateRiskAdjustedPremium(baseRate, riskScore, workerCity);
        
        const renewalDate = new Date();
        renewalDate.setDate(renewalDate.getDate() + 7);
        
        const { data: newPolicy, error } = await supabase
            .from('policies')
            .insert([{
                worker_id,
                plan_type,
                premium,
                max_payout: maxPayout,
                status: 'Active',
                start_date: getISTISODate(),
                renewal_date: renewalDate.toISOString(),
                auto_renew: true,
                city: workerCity
            }])
            .select()
            .single();
        
        if (error) throw error;
        
        console.log(`[POLICY: IST] ✅ New policy ${newPolicy.id} created at ${formatIST(new Date(), { dateStyle: 'medium', timeStyle: 'medium' })}`);
        res.status(201).json({ success: true, data: newPolicy });
    } catch (error) {
        next(error);
    }
};

export const updatePolicy = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        delete updates.id;
        delete updates.created_at;
        
        const { data, error } = await supabase
            .from('policies')
            .update({ ...updates, updated_at: getISTISODate() })
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

export const renewPolicy = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const { data: policy } = await supabase
            .from('policies')
            .select('*')
            .eq('id', id)
            .single();
        
        if (!policy) {
            return res.status(404).json({ success: false, message: 'Policy not found' });
        }
        
        const renewalDate = new Date(policy.renewal_date);
        renewalDate.setDate(renewalDate.getDate() + 7);
        
        const { data, error } = await supabase
            .from('policies')
            .update({
                status: 'Active',
                renewal_date: renewalDate.toISOString(),
                updated_at: getISTISODate()
            })
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        
        console.log(`[POLICY: IST] ✅ Policy ${id} renewed until ${formatIST(renewalDate, { dateStyle: 'medium' })}`);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

export const getPolicyStats = async (req, res, next) => {
    try {
        const { data: policies } = await supabase.from('policies').select('*');
        
        const stats = {
            total: policies?.length || 0,
            active: policies?.filter(p => p.status === 'Active').length || 0,
            expired: policies?.filter(p => p.status === 'Expired').length || 0,
            byPlan: {
                Basic: policies?.filter(p => p.plan_type === 'Basic').length || 0,
                Standard: policies?.filter(p => p.plan_type === 'Standard').length || 0,
                Pro: policies?.filter(p => p.plan_type === 'Pro').length || 0
            },
            totalPremium: policies?.reduce((sum, p) => sum + parseFloat(p.premium), 0) || 0
        };
        
        res.json({ success: true, data: stats });
    } catch (error) {
        next(error);
    }
};
