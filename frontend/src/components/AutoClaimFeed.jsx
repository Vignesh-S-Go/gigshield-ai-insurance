import { useState, useEffect } from 'react';
import { CloudRain, Wind, Waves, Thermometer, CheckCircle, Clock, DollarSign, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { authHttp } from '../services/httpClient';

const triggerIcons = {
    AQI_HIGH: Wind,
    HEAVY_RAIN: CloudRain,
    FLOOD_ALERT: Waves,
    HEAT_WAVE: Thermometer,
};

const triggerColors = {
    AQI_HIGH: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
    HEAVY_RAIN: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
    FLOOD_ALERT: 'text-red-400 bg-red-400/10 border-red-400/30',
    HEAT_WAVE: 'text-red-500 bg-red-500/10 border-red-500/30',
};

const severityColors = {
    mild: 'text-success-400 bg-success-500/10 border-success-500/30',
    medium: 'text-warning-400 bg-warning-500/10 border-warning-500/30',
    severe: 'text-danger-400 bg-danger-500/10 border-danger-500/30',
};

export default function AutoClaimFeed() {
    const [triggers, setTriggers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTriggers = async () => {
        try {
            const res = await authHttp.get('/admin/live');
            setTriggers(res.data.last_triggers || []);
        } catch (e) {
            console.error('AutoClaimFeed fetch failed:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTriggers();
        const interval = setInterval(fetchTriggers, 5000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleTimeString('en-IN', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    if (loading) {
        return (
            <div className="p-4 bg-dark-800 border border-dark-700 rounded-2xl">
                <div className="animate-pulse space-y-2">
                    {[1,2,3].map(i => (
                        <div key={i} className="h-12 bg-dark-700 rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-dark-800 border border-dark-700 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-dark-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary-400 animate-pulse" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Auto-Filed Claims</h3>
                </div>
                <span className="text-xs text-dark-400">AI automatically files claims when triggers fire</span>
            </div>

            {triggers.length === 0 ? (
                <div className="p-6 text-center">
                    <CloudRain className="w-8 h-8 mx-auto mb-2 text-dark-500 opacity-30" />
                    <p className="text-sm text-dark-400">No triggers detected yet</p>
                    <p className="text-xs text-dark-500 mt-1">Claims will auto-generate when extreme weather is detected</p>
                </div>
            ) : (
                <div className="divide-y divide-dark-700">
                    <AnimatePresence>
                        {triggers.map((trigger, i) => {
                            const Icon = triggerIcons[trigger.trigger_type] || CloudRain;
                            const colorClass = triggerColors[trigger.trigger_type] || 'text-gray-400';
                            const severityClass = severityColors[trigger.severity] || severityColors.mild;
                            
                            return (
                                <motion.div
                                    key={trigger.id || i}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 hover:bg-dark-700/50 transition-colors"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-lg border ${colorClass}`}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-semibold text-white">
                                                    {trigger.trigger_type?.replace(/_/g, ' ')}
                                                </span>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${severityClass}`}>
                                                    {trigger.severity?.toUpperCase()}
                                                </span>
                                            </div>
                                            
                                            <div className="flex items-center gap-3 text-xs text-dark-400">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {formatTime(trigger.fired_at)}
                                                </span>
                                                <span>{trigger.city}</span>
                                                <span>Value: {trigger.value}</span>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="flex items-center gap-1 text-success-400">
                                                <CheckCircle className="w-4 h-4" />
                                                <span className="text-xs font-medium">Claim Filed</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-dark-400 mt-1">
                                                <DollarSign className="w-3 h-3" />
                                                <span className="text-xs">Auto-calculated</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
