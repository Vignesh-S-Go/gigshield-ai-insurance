import { useState, useEffect, useCallback } from 'react';
import { authHttp } from '../../services/httpClient';

export function useLiveData(refreshSignal) {
    const [data, setData] = useState({ 
        last_triggers: [], 
        last_payouts: [], 
        total_payout_today: 0, 
        active_workers: 0, 
        avg_processing_ms: null,
        avg_impact_score: 0,
        high_risk_workers_count: 0,
        latest_warning: null
    });
    const [loading, setLoading] = useState(true);

    const fetch = useCallback(async () => {
        try {
            const res = await authHttp.get('/admin/live');
            setData(res.data);
        } catch (e) {
            console.error('useLiveData fetch failed:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { 
        fetch(); 
    }, [fetch, refreshSignal]);

    useEffect(() => {
        const interval = setInterval(fetch, 5000);
        return () => clearInterval(interval);
    }, [fetch]);

    return { data, loading, refresh: fetch };
}
