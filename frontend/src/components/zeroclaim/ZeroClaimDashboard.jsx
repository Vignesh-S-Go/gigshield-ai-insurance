import { useState } from 'react';
import { useLiveData } from './useLiveData';
import SimulatePanel from './SimulatePanel';
import PipelineVisualizer from './PipelineVisualizer';
import LiveEventFeed from './LiveEventFeed';
import PayoutStream from './PayoutStream';
import FraudInsights from './FraudInsights';
import Header from '../Header';

export default function ZeroClaimDashboard() {
    const [refreshSignal, setRefreshSignal] = useState(0);
    const [pipelineStep, setPipelineStep] = useState(-1);
    const { data, loading } = useLiveData(refreshSignal);

    const handleTriggerFired = () => setRefreshSignal(s => s + 1);
    const [bannerDismissed, setBannerDismissed] = useState(false);

    const showBanner = data.latest_warning && !bannerDismissed;

    return (
        <div className="animate-fade-in">
            <Header 
                title="ZeroClaim Dashboard" 
                subtitle="Insurance that pays before you ask." 
            />

            {showBanner && (
                <div className="mb-4 p-4 bg-warning-500/10 border border-warning-500/30 rounded-2xl flex items-start justify-between">
                    <div>
                        <p className="text-sm font-semibold text-warning-500 mb-1">Safety Alert</p>
                        <p className="text-sm text-dark-800 dark:text-dark-200">{data.latest_warning.message}</p>
                    </div>
                    <button 
                        onClick={() => setBannerDismissed(true)}
                        className="text-dark-400 hover:text-dark-600 text-lg leading-none"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Stats row */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-6">
                {[
                    { label: 'Total paid today', value: `₹${(data.total_payout_today || 0).toLocaleString('en-IN')}` },
                    { label: 'Active workers', value: data.active_workers || 0 },
                    { label: 'Avg impact score', value: data.avg_impact_score ? `${data.avg_impact_score}%` : '—' },
                    { label: 'System confidence', value: data.system_confidence ? `${data.system_confidence}%` : '100%' },
                    { label: 'Avg processing time', value: data.avg_processing_ms ? `${data.avg_processing_ms}ms` : '—' },
                ].map(s => (
                    <div key={s.label} className="glass-card rounded-2xl p-4">
                        <p className="text-xs text-dark-400 font-bold uppercase tracking-wider mb-1">{s.label}</p>
                        <p className="text-xl font-bold text-dark-800 dark:text-dark-200">{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Pipeline */}
            <div className="mb-6">
                <PipelineVisualizer activeStep={pipelineStep} />
            </div>

            {/* Main 2-col layout */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Left - Live Events */}
                <div className="lg:col-span-3">
                    <LiveEventFeed triggers={data.last_triggers || []} />
                </div>

                {/* Right */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    <SimulatePanel onTriggerFired={handleTriggerFired} onPipelineStep={setPipelineStep} />
                    <PayoutStream payouts={data.last_payouts || []} totalToday={data.total_payout_today} />
                    <FraudInsights payouts={data.last_payouts || []} />
                </div>
            </div>
        </div>
    );
}
