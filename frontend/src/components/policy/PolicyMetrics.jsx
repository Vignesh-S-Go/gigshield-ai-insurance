import { useState, useEffect } from 'react';
import { Wallet, Zap, Target, ShieldAlert } from 'lucide-react';
import { authHttp } from '../../services/httpClient';

const STATIC_DATA = {
    totalPayoutToday: 12500,
    triggersToday: 8,
    avgImpactScore: 76,
    fraudAlerts: 2
};

export default function PolicyMetrics() {
    const [data, setData] = useState(STATIC_DATA);
    const [loading, setLoading] = useState(true);
    const [isLive, setIsLive] = useState(false);

    useEffect(() => {
        const fetchLiveData = async () => {
            try {
                const res = await authHttp.get('/admin/live');
                const liveData = res.data;
                
                setData({
                    totalPayoutToday: liveData.total_payout_today || 0,
                    triggersToday: (liveData.last_triggers || []).length,
                    avgImpactScore: liveData.avg_impact_score || 0,
                    fraudAlerts: liveData.high_risk_workers_count || 0
                });
                setIsLive(true);
            } catch (err) {
                console.log('Using static fallback for PolicyMetrics');
                setIsLive(false);
            } finally {
                setLoading(false);
            }
        };

        fetchLiveData();
        const interval = setInterval(fetchLiveData, 10000);
        return () => clearInterval(interval);
    }, []);

    const metrics = [
        { icon: Wallet, label: 'Payouts Today', value: `₹${data.totalPayoutToday.toLocaleString()}`, color: 'text-success-500', bg: 'bg-success-500/10' },
        { icon: Zap, label: 'Triggers', value: data.triggersToday, color: 'text-primary-400', bg: 'bg-primary-500/10' },
        { icon: Target, label: 'Avg Impact', value: `${data.avgImpactScore}%`, color: 'text-warning-500', bg: 'bg-warning-500/10' },
        { icon: ShieldAlert, label: 'Fraud Alerts', value: data.fraudAlerts, color: 'text-danger-500', bg: 'bg-danger-500/10' },
    ];

    return (
        <div className="bg-dark-900 border border-dark-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-black uppercase text-dark-500 tracking-[0.2em]">Live Policy Metrics</h2>
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-success-500' : 'bg-dark-500'} animate-pulse`}></span>
                    <span className={`text-xs uppercase font-bold ${isLive ? 'text-success-500' : 'text-dark-500'}`}>
                        {isLive ? 'Live' : 'Demo'}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {metrics.map((metric, idx) => (
                    <div key={idx} className="p-4 bg-dark-800/30 rounded-2xl border border-dark-700 hover:border-dark-600 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                            <div className={`p-1.5 ${metric.bg} rounded-lg`}>
                                <metric.icon className={`w-4 h-4 ${metric.color}`} />
                            </div>
                            <span className="text-xs text-dark-400">{metric.label}</span>
                        </div>
                        <span className="text-xl font-black text-white">{metric.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}