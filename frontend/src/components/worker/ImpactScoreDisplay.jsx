import { Target, Info } from 'lucide-react';

function getImpactColor(score) {
    if (score >= 75) return 'text-success-500';
    if (score >= 40) return 'text-warning-500';
    return 'text-danger-500';
}

function getImpactBg(score) {
    if (score >= 75) return 'bg-success-500';
    if (score >= 40) return 'bg-warning-500';
    return 'bg-danger-500';
}

export default function ImpactScoreDisplay({ score = 82, compact = false }) {
    const impactScore = score || 0;
    const colorClass = getImpactColor(impactScore);
    const bgClass = getImpactBg(impactScore);

    if (compact) {
        return (
            <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                    <div className={`h-full ${bgClass} rounded-full transition-all`} style={{ width: `${impactScore}%` }} />
                </div>
                <span className={`text-xs font-bold ${colorClass}`}>{impactScore}%</span>
            </div>
        );
    }

    return (
        <div className="bg-dark-800 border border-dark-700 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary-400" />
                    <span className="text-sm font-bold text-white">Impact Score</span>
                </div>
                <span className={`text-xl font-black ${colorClass}`}>{impactScore}%</span>
            </div>
            
            <div className="h-2 bg-dark-700 rounded-full overflow-hidden mb-3">
                <div 
                    className={`h-full ${bgClass} rounded-full transition-all duration-500`}
                    style={{ width: `${impactScore}%` }}
                />
            </div>
            
            <div className="flex items-start gap-2">
                <Info className="w-3 h-3 text-dark-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-dark-400">
                    Based on your work activity and dependency. Higher scores = higher payouts.
                </p>
            </div>
        </div>
    );
}