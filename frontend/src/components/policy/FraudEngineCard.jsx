import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';

const fraudFactors = [
    { label: 'Claim Frequency', value: 85, desc: 'Low repeat claims' },
    { label: 'Account Age', value: 92, desc: 'Established user' },
    { label: 'Behavior Pattern', value: 78, desc: 'Normal activity' },
];

function ProgressBar({ value, color }) {
    const getColor = () => {
        if (value <= 40) return 'bg-success-500';
        if (value <= 70) return 'bg-warning-500';
        return 'bg-danger-500';
    };
    return (
        <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
            <div className={`h-full ${getColor()} rounded-full transition-all duration-500`} style={{ width: `${value}%` }}></div>
        </div>
    );
}

export default function FraudEngineCard() {
    const exampleScore = 42;

    return (
        <div className="bg-dark-900 border border-dark-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary-400" />
                    <h2 className="text-sm font-black uppercase text-dark-500 tracking-[0.2em]">Fraud Engine</h2>
                </div>
            </div>

            <div className="mb-6">
                <p className="text-xs text-dark-400 mb-4">Scoring Factors</p>
                <div className="space-y-3">
                    {fraudFactors.map((factor, idx) => (
                        <div key={idx}>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-dark-400">{factor.label}</span>
                                <span className="text-dark-300">{factor.value}/100</span>
                            </div>
                            <ProgressBar value={factor.value} />
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-4 bg-dark-800/50 rounded-2xl border border-dark-700 mb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-dark-500 uppercase">Example Fraud Score</span>
                    <span className="text-xl font-black text-success-500">{exampleScore}</span>
                </div>
                <ProgressBar value={exampleScore} />
            </div>

            <div className="flex items-center justify-between p-3 bg-dark-800/30 rounded-xl border border-dark-700">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-danger-500" />
                    <span className="text-xs text-dark-400">Threshold</span>
                </div>
                <span className="text-sm font-bold text-white">Score &gt; 70 → Blocked</span>
            </div>

            <div className="mt-4 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success-500" />
                <span className="text-xs text-dark-400">Score {exampleScore} = Eligible for payout</span>
            </div>
        </div>
    );
}