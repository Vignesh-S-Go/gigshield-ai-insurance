import { useState } from 'react';
import { Zap } from 'lucide-react';
import { authHttp } from '../../services/httpClient';

export default function SimulatePanel({ onTriggerFired, onPipelineStep }) {
    const [type, setType] = useState('HEAVY_RAIN');
    const [location, setLocation] = useState('Hyderabad');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const fire = async () => {
        setLoading(true);
        onPipelineStep(0);
        try {
            const res = await authHttp.post('/admin/simulate-trigger', { triggerType: type, city: location });
            const data = res.data;
            if (data.triggered) {
                const impactMsg = data.impactScore ? ` • Impact: ${data.impactScore}%` : '';
                setToast({ type: 'success', msg: `Trigger fired — ${data.payouts?.length || 0} payouts${impactMsg} in ${data.processingMs}ms` });
                onTriggerFired();
            } else {
                setToast({ type: 'warn', msg: data.reason || 'Below threshold' });
                onPipelineStep(-1);
            }
        } catch (e) {
            setToast({ type: 'error', msg: e.response?.data?.error || 'Request failed. Check backend.' });
            onPipelineStep(-1);
        } finally {
            setLoading(false);
            setTimeout(() => setToast(null), 4000);
        }
    };

    return (
        <div className="glass-card rounded-2xl p-5">
            <p className="text-sm font-semibold text-dark-800 dark:text-dark-200 mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-orange-500" />
                Simulate Trigger
            </p>

            <select 
                value={type} 
                onChange={e => setType(e.target.value)} 
                className="input-field w-full mb-3 text-sm"
            >
                <option value="AQI_HIGH">AQI High</option>
                <option value="HEAVY_RAIN">Heavy Rain</option>
                <option value="FLOOD_ALERT">Flood Alert</option>
                <option value="HEAT_WAVE">Heat Wave</option>
            </select>

            <input
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Location (e.g. Hyderabad)"
                className="input-field w-full mb-3 text-sm"
            />

            <button 
                onClick={fire} 
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-orange-500/25 transition-all disabled:opacity-50"
            >
                {loading ? 'Firing...' : 'Fire Trigger'}
            </button>

            {toast && (
                <div className={`mt-3 p-2 rounded-lg text-xs font-medium ${
                    toast.type === 'success' ? 'bg-success-500/10 text-success-500' :
                    toast.type === 'warn' ? 'bg-warning-500/10 text-warning-500' :
                    'bg-danger-500/10 text-danger-500'
                }`}>
                    {toast.msg}
                </div>
            )}
        </div>
    );
}
