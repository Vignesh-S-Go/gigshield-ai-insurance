import { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { authHttp } from '../../services/httpClient';

function initials(name = '') {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function getSeverityColor(severity) {
    const s = severity?.toLowerCase();
    if (s === 'severe') return 'text-danger-500';
    if (s === 'medium') return 'text-warning-500';
    return 'text-success-500';
}

export default function PayoutStream({ payouts, totalToday }) {
    const [selectedPayout, setSelectedPayout] = useState(null);
    const [explanation, setExplanation] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleExplain = async (payout) => {
        setSelectedPayout(payout);
        setLoading(true);
        try {
            const res = await authHttp.get(`/admin/explain/${payout.id}`);
            setExplanation(res.data);
        } catch (err) {
            console.error('Explain fetch failed:', err);
            setExplanation({ error: 'Failed to load explanation' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="glass-card rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-dark-200 dark:border-dark-700 flex justify-between items-center">
                    <p className="text-sm font-semibold text-dark-800 dark:text-dark-200">Payout Stream</p>
                    <span className="text-xs font-medium text-success-500">₹{totalToday?.toLocaleString('en-IN') || 0} today</span>
                </div>
                {(!payouts || payouts.length === 0) && (
                    <div className="p-6 text-center text-dark-400 text-sm">No payouts yet.</div>
                )}
                {payouts?.map((p, i) => (
                    <div 
                        key={p.id} 
                        className={`p-3 border-b border-dark-100 dark:border-dark-700 flex items-center gap-2 ${i === 0 ? 'animate-fade-in' : ''}`}
                    >
                        <div className="w-8 h-8 rounded-full bg-primary-500/10 text-primary-500 flex items-center justify-center text-xs font-bold shrink-0">
                            {initials(p.user_name)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-dark-800 dark:text-dark-200 truncate">{p.user_name || 'Unknown'}</p>
                            <p className={`text-xs ${getSeverityColor(p.severity)}`}>{p.severity} · Impact: {p.impact_score || 0}%</p>
                        </div>
                        <button 
                            onClick={() => handleExplain(p)}
                            className="p-1.5 hover:bg-dark-700 rounded-lg transition-colors shrink-0"
                            title="Explain Payout"
                        >
                            <HelpCircle className="w-4 h-4 text-dark-400" />
                        </button>
                        <span className="text-sm font-bold text-success-500 shrink-0">₹{Number(p.amount).toLocaleString('en-IN')}</span>
                    </div>
                ))}
            </div>

            {/* Explanation Modal */}
            {selectedPayout && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-dark-900 border border-dark-700 rounded-3xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white">Payout Explanation</h3>
                            <button 
                                onClick={() => { setSelectedPayout(null); setExplanation(null); }}
                                className="p-1 hover:bg-dark-700 rounded-lg"
                            >
                                <X className="w-5 h-5 text-dark-400" />
                            </button>
                        </div>

                        {loading ? (
                            <div className="text-center py-8 text-dark-400">Loading explanation...</div>
                        ) : explanation?.error ? (
                            <div className="text-center py-8 text-danger-400">{explanation.error}</div>
                        ) : explanation && (
                            <div className="space-y-4">
                                <div className="p-3 bg-dark-800 rounded-xl">
                                    <p className="text-xs text-dark-500 uppercase mb-1">Trigger</p>
                                    <p className="text-sm font-bold text-white">{explanation.trigger?.type}</p>
                                    <p className="text-xs text-dark-400">{explanation.trigger?.value}mm vs {explanation.trigger?.threshold}mm threshold</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-dark-800 rounded-xl">
                                        <p className="text-xs text-dark-500 uppercase">Severity</p>
                                        <p className={`text-sm font-bold ${getSeverityColor(explanation.trigger?.severity)}`}>{explanation.trigger?.severity}</p>
                                    </div>
                                    <div className="p-3 bg-dark-800 rounded-xl">
                                        <p className="text-xs text-dark-500 uppercase">Impact Score</p>
                                        <p className="text-sm font-bold text-primary-400">{explanation.calculation?.impact_score}%</p>
                                    </div>
                                </div>

                                <div className="p-3 bg-dark-800 rounded-xl">
                                    <p className="text-xs text-dark-500 uppercase mb-1">Formula</p>
                                    <p className="text-xs text-dark-300 font-mono">{explanation.calculation?.formula}</p>
                                </div>

                                <div className="p-4 bg-success-500/10 border border-success-500/20 rounded-xl">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-white">Final Payout</span>
                                        <span className="text-xl font-black text-success-500">₹{explanation.final_payout}</span>
                                    </div>
                                </div>

                                <p className="text-xs text-dark-400 leading-relaxed">{explanation.reason}</p>

                                <div className="flex gap-2 flex-wrap">
                                    <span className="text-xs px-2 py-1 bg-success-500/10 text-success-500 rounded-full">✓ {explanation.verification?.fraud_check}</span>
                                    <span className="text-xs px-2 py-1 bg-primary-500/10 text-primary-400 rounded-full">✓ {explanation.verification?.policy_verified}</span>
                                    <span className="text-xs px-2 py-1 bg-warning-500/10 text-warning-500 rounded-full">✓ {explanation.verification?.instant_settlement}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}