import { Calculator, TrendingUp, Droplets, Wind } from 'lucide-react';

const triggerIcons = {
    HEAVY_RAIN: Droplets,
    AQI_HIGH: Wind,
    FLOOD_ALERT: TrendingUp,
    HEAT_WAVE: TrendingUp,
    default: Calculator
};

function getSeverityColor(severity) {
    const s = severity?.toUpperCase();
    if (s === 'SEVERE') return { bg: 'bg-danger-500/10', text: 'text-danger-500', border: 'border-danger-500/30' };
    if (s === 'MEDIUM') return { bg: 'bg-warning-500/10', text: 'text-warning-500', border: 'border-warning-500/30' };
    return { bg: 'bg-success-500/10', text: 'text-success-500', border: 'border-success-500/30' };
}

function getImpactColor(score) {
    if (score >= 75) return 'text-success-500';
    if (score >= 40) return 'text-warning-500';
    return 'text-danger-500';
}

export default function PayoutExplanationCard({ payout }) {
    if (!payout) return null;

    const triggerType = payout.trigger_type || 'HEAVY_RAIN';
    const IconComponent = triggerIcons[triggerType] || triggerIcons.default;
    const severityStyle = getSeverityColor(payout.severity);
    const impactScore = payout.impact_score || 50;
    const impactColor = getImpactColor(impactScore);

    return (
        <div className="bg-dark-800/50 border border-dark-700 rounded-2xl p-4 mt-3">
            <div className="flex items-center gap-2 mb-4">
                <IconComponent className="w-4 h-4 text-primary-400" />
                <span className="text-xs font-bold text-dark-400 uppercase">Payout Breakdown</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-2 bg-dark-700/30 rounded-xl">
                    <span className="text-[10px] text-dark-500 uppercase block">Trigger</span>
                    <span className="text-sm font-bold text-white">{triggerType.replace(/_/g, ' ')}</span>
                </div>
                <div className={`p-2 ${severityStyle.bg} rounded-xl border ${severityStyle.border}`}>
                    <span className={`text-[10px] ${severityStyle.text} uppercase block`}>Severity</span>
                    <span className={`text-sm font-bold ${severityStyle.text}`}>{payout.severity || 'MEDIUM'}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-2 bg-dark-700/30 rounded-xl">
                    <span className="text-[10px] text-dark-500 uppercase block">Threshold vs Actual</span>
                    <span className="text-sm font-bold text-white">
                        {payout.threshold || 75}mm vs {payout.trigger_value || 82}mm
                    </span>
                </div>
                <div className="p-2 bg-dark-700/30 rounded-xl">
                    <span className="text-[10px] text-dark-500 uppercase block">Impact Score</span>
                    <span className={`text-sm font-bold ${impactColor}`}>{impactScore}%</span>
                </div>
            </div>

            <div className="p-3 bg-dark-700/30 rounded-xl mb-3">
                <span className="text-[10px] text-dark-500 uppercase block mb-1">Formula</span>
                <p className="text-xs text-dark-300 font-mono">
                    ₹{payout.coverage_amount || 5000} × {payout.severity === 'severe' ? '50%' : payout.severity === 'medium' ? '30%' : '20%'} × {impactScore}/100
                </p>
            </div>

            <div className="flex items-center justify-between p-3 bg-success-500/10 border border-success-500/20 rounded-xl">
                <span className="text-sm font-bold text-white">Final Payout</span>
                <span className="text-xl font-black text-success-500">₹{Number(payout.amount || 0).toLocaleString()}</span>
            </div>
        </div>
    );
}