const SEVERITY_COLOR = {
    mild: { bg: 'bg-success-500/10', text: 'text-success-500', border: 'border-success-500/30' },
    medium: { bg: 'bg-warning-500/10', text: 'text-warning-500', border: 'border-warning-500/30' },
    severe: { bg: 'bg-danger-500/10', text: 'text-danger-500', border: 'border-danger-500/30' },
};

export default function LiveEventFeed({ triggers }) {
    return (
        <div className="glass-card rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-dark-200 dark:border-dark-700">
                <p className="text-sm font-semibold text-dark-800 dark:text-dark-200">Live Event Feed</p>
            </div>
            {(!triggers || triggers.length === 0) && (
                <div className="p-6 text-center text-dark-400 text-sm">
                    No triggers yet. Fire a simulation to begin.
                </div>
            )}
            {triggers?.map((t, i) => {
                const c = SEVERITY_COLOR[t.severity] || SEVERITY_COLOR.mild;
                return (
                    <div 
                        key={t.id} 
                        className={`p-3 border-b border-dark-100 dark:border-dark-700 flex items-center gap-3 ${i === 0 ? 'animate-fade-in' : ''}`}
                    >
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${c.bg} ${c.text} border ${c.border}`}>
                            {t.severity}
                        </span>
                        <span className="text-sm font-medium text-dark-800 dark:text-dark-200">{t.trigger_type?.replace(/_/g, ' ')}</span>
                        <span className="text-xs text-dark-400">{t.city}</span>
                        <span className="text-xs text-dark-400 ml-auto">
                            {t.fired_at ? new Date(t.fired_at).toLocaleTimeString() : ''}
                        </span>
                        {t.processing_ms && (
                            <span className="text-xs text-dark-400">{t.processing_ms}ms</span>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
