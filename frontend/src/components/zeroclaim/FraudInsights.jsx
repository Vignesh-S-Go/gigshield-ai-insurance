function barColor(score) {
    if (score <= 40) return 'bg-success-500';
    if (score <= 70) return 'bg-warning-500';
    return 'bg-danger-500';
}

function impactBarColor(score) {
    if (score < 40) return 'bg-danger-500';
    if (score < 75) return 'bg-warning-500';
    return 'bg-success-500';
}

export default function FraudInsights({ payouts }) {
    return (
        <div className="glass-card rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-dark-200 dark:border-dark-700">
                <p className="text-sm font-semibold text-dark-800 dark:text-dark-200">Risk & Impact Insights</p>
            </div>
            {(!payouts || payouts.length === 0) && (
                <div className="p-6 text-center text-dark-400 text-sm">No data yet.</div>
            )}
            {payouts?.map(p => (
                <div key={p.id} className="p-3 border-b border-dark-100 dark:border-dark-700">
                    <div className="flex justify-between text-xs mb-2">
                        <span className="font-medium text-dark-800 dark:text-dark-200">{p.user_name || 'Unknown'}</span>
                        <span className="text-dark-400">Fraud: {p.fraud_score}/100</span>
                    </div>
                    <div className="h-1.5 bg-dark-200 dark:bg-dark-700 rounded-full overflow-hidden mb-2">
                        <div 
                            className={`h-full ${barColor(p.fraud_score)} rounded-full transition-all duration-500`}
                            style={{ width: `${p.fraud_score}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-dark-400">Impact Score</span>
                        <span className="font-medium text-dark-800 dark:text-dark-200">{p.impact_score || 0}/100</span>
                    </div>
                    <div className="h-1.5 bg-dark-200 dark:bg-dark-700 rounded-full overflow-hidden">
                        <div 
                            className={`h-full ${impactBarColor(p.impact_score || 0)} rounded-full transition-all duration-500`}
                            style={{ width: `${p.impact_score || 0}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}
