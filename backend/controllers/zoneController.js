import { supabase } from '../config/supabase.js';

export const getZones = async (req, res, next) => {
    try {
        const { city } = req.query;
        
        let query = supabase.from('zones').select('*').order('risk_score', { ascending: false });
        
        if (city) query = query.eq('city', city);
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        const zonesFormatted = data.map(z => ({
            zone: z.zone_name,
            city: z.city,
            riskScore: parseFloat(z.risk_score),
            activePolicies: z.active_policies,
            recentClaims: z.recent_claims,
            primaryThreat: z.primary_threat,
            coordinates: {
                lat: parseFloat(z.latitude),
                lng: parseFloat(z.longitude)
            }
        }));
        
        res.json({ success: true, count: zonesFormatted.length, data: zonesFormatted });
    } catch (error) {
        next(error);
    }
};

export const getZoneById = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const { data, error } = await supabase
            .from('zones')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

export const createZone = async (req, res, next) => {
    try {
        const { zone_name, city, risk_score, primary_threat, latitude, longitude } = req.body;
        
        const { data: existing } = await supabase
            .from('zones')
            .select('id')
            .eq('zone_name', zone_name)
            .eq('city', city)
            .single();
        
        if (existing) {
            return res.status(400).json({ success: false, message: 'Zone already exists in this city' });
        }
        
        const { data: newZone, error } = await supabase
            .from('zones')
            .insert([{
                zone_name,
                city,
                risk_score: risk_score || 0.50,
                primary_threat: primary_threat || 'Rain',
                latitude,
                longitude,
                active_policies: 0,
                recent_claims: 0
            }])
            .select()
            .single();
        
        if (error) throw error;
        
        res.status(201).json({ success: true, data: newZone });
    } catch (error) {
        next(error);
    }
};

export const updateZoneRisk = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { risk_score, recent_claims } = req.body;
        
        const { data, error } = await supabase
            .from('zones')
            .update({ risk_score, recent_claims, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

export const getZoneStats = async (req, res, next) => {
    try {
        const { data: zones } = await supabase.from('zones').select('*');
        
        const stats = {
            totalZones: zones?.length || 0,
            highRiskZones: zones?.filter(z => parseFloat(z.risk_score) >= 0.8).length || 0,
            avgRiskScore: zones?.length ? (zones.reduce((s, z) => s + parseFloat(z.risk_score), 0) / zones.length).toFixed(2) : 0,
            totalPolicies: zones?.reduce((s, z) => s + z.active_policies, 0) || 0,
            totalClaims: zones?.reduce((s, z) => s + z.recent_claims, 0) || 0
        };
        
        res.json({ success: true, data: stats });
    } catch (error) {
        next(error);
    }
};

export const getHighRiskZones = async (req, res, next) => {
    try {
        const { data: zones } = await supabase
            .from('zones')
            .select('*')
            .order('risk_score', { ascending: false })
            .limit(5);
        
        const predictions = ['Heavy flooding expected in 3 days', 'AQI levels expected to cross 400', 'Cyclone alert — severe rainfall'];
        
        const highRiskZones = zones?.map((z, i) => ({
            zone: z.zone_name,
            riskLevel: parseFloat(z.risk_score),
            trigger: z.primary_threat,
            prediction: predictions[i % predictions.length]
        }));
        
        res.json({ success: true, data: highRiskZones });
    } catch (error) {
        next(error);
    }
};
