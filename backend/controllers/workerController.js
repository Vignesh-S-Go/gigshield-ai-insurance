import { supabase } from '../config/supabase.js';

export const getWorkers = async (req, res, next) => {
    try {
        const { city, status, plan, search } = req.query;
        
        let query = supabase.from('workers').select('*');
        
        if (city && city !== 'All') query = query.eq('city', city);
        if (status && status !== 'All') query = query.eq('status', status);
        if (plan && plan !== 'All') query = query.eq('plan', plan);
        if (search) {
            query = query.or(`name.ilike.%${search}%,id.ilike.%${search}%`);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) throw error;
        
        const { data: policies } = await supabase.from('policies').select('worker_id, plan_type');
        
        const workersFormatted = data.map(worker => {
            const workerPolicy = policies?.find(p => p.worker_id === worker.id);
            return formatWorker(worker, workerPolicy);
        });
        
        res.json({ success: true, count: workersFormatted.length, data: workersFormatted });
    } catch (error) {
        next(error);
    }
};

export const getWorkerById = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const { data: worker, error } = await supabase
            .from('workers')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        
        const { data: policies } = await supabase
            .from('policies')
            .select('*')
            .eq('worker_id', id);
        
        const { data: claims } = await supabase
            .from('claims')
            .select('*')
            .eq('worker_id', id)
            .order('created_at', { ascending: false });
        
        const formattedWorker = formatWorker(worker, policies?.[0]);
        formattedWorker.policies = policies?.map(p => ({
            id: p.id,
            planType: p.plan_type,
            premium: parseFloat(p.premium),
            maxPayout: parseFloat(p.max_payout),
            status: p.status,
            renewalDate: p.renewal_date
        })) || [];
        
        formattedWorker.claimsHistory = claims?.map(c => ({
            id: c.id,
            date: c.created_at,
            trigger: c.trigger_type,
            amount: parseFloat(c.payout_amount),
            status: c.status
        })) || [];
        
        formattedWorker.earningsHistory = worker.earnings_history || generateEarningsHistory();
        formattedWorker.riskBreakdown = worker.risk_breakdown || {
            weatherExposure: Math.random() * 0.4 + 0.3,
            claimFrequency: Math.random() * 0.5 + 0.2,
            earningsVolatility: Math.random() * 0.3 + 0.2,
            zoneRisk: parseFloat(worker.risk_score) * 0.8,
            fraudIndicator: Math.random() * 0.2
        };
        
        res.json({ success: true, data: formattedWorker });
    } catch (error) {
        next(error);
    }
};

function formatWorker(worker, workerPolicy) {
    return {
        id: worker.id,
        name: worker.name,
        phone: worker.phone,
        city: worker.city,
        plan: workerPolicy?.plan_type || worker.plan,
        weeklyEarnings: parseFloat(worker.weekly_earnings),
        totalEarnings: parseFloat(worker.total_earnings),
        riskScore: parseFloat(worker.risk_score),
        status: worker.status,
        deliveryPlatform: worker.delivery_platform,
        totalDeliveries: worker.total_deliveries,
        avgRating: parseFloat(worker.avg_rating),
        joinedDate: worker.joined_date,
        createdAt: worker.created_at
    };
}

function generateEarningsHistory() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(month => ({
        month,
        earnings: Math.floor(Math.random() * 11000) + 15000,
        deliveries: Math.floor(Math.random() * 170) + 80
    }));
}

export const createWorker = async (req, res, next) => {
    try {
        const { name, phone, city, deliveryPlatform, weeklyEarnings } = req.body;
        
        const { data: existing } = await supabase
            .from('workers')
            .select('id')
            .eq('phone', phone)
            .single();
        
        if (existing) {
            return res.status(400).json({ success: false, message: 'Worker with this phone already exists' });
        }
        
        const { data: newWorker, error } = await supabase
            .from('workers')
            .insert([{
                name,
                phone,
                city,
                delivery_platform: deliveryPlatform || 'Zomato',
                weekly_earnings: weeklyEarnings || 0,
                risk_score: 0.50,
                status: 'active'
            }])
            .select()
            .single();
        
        if (error) throw error;
        
        res.status(201).json({ success: true, data: newWorker });
    } catch (error) {
        next(error);
    }
};

export const updateWorker = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        delete updates.id;
        delete updates.created_at;
        
        const { data, error } = await supabase
            .from('workers')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

export const syncWorkerStats = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { 
            weeklyEarnings, 
            totalEarnings, 
            totalDeliveries, 
            avgRating,
            deliveryPlatform,
            earningsHistory
        } = req.body;
        
        const updates = {};
        if (weeklyEarnings !== undefined) updates.weekly_earnings = weeklyEarnings;
        if (totalEarnings !== undefined) updates.total_earnings = totalEarnings;
        if (totalDeliveries !== undefined) updates.total_deliveries = totalDeliveries;
        if (avgRating !== undefined) updates.avg_rating = avgRating;
        if (deliveryPlatform !== undefined) updates.delivery_platform = deliveryPlatform;
        if (earningsHistory !== undefined) updates.earnings_history = earningsHistory;
        
        updates.updated_at = new Date().toISOString();
        
        const { data, error } = await supabase
            .from('workers')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

export const getWorkerMetrics = async (req, res, next) => {
    try {
        const { data: workers } = await supabase.from('workers').select('*');
        const { data: claims } = await supabase.from('claims').select('*');
        
        const activeWorkers = workers?.filter(w => w.status === 'active').length || 0;
        const totalPayout = claims?.filter(c => c.status === 'Paid').reduce((sum, c) => sum + parseFloat(c.payout_amount), 0) || 0;
        const fraudAlerts = claims?.filter(c => c.status === 'Flagged').length || 0;
        
        res.json({
            success: true,
            data: {
                activeWorkers,
                totalWorkers: workers?.length || 0,
                totalPayout,
                fraudAlerts,
                avgRiskScore: workers?.length ? (workers.reduce((s, w) => s + parseFloat(w.risk_score), 0) / workers.length).toFixed(2) : 0
            }
        });
    } catch (error) {
        next(error);
    }
};
