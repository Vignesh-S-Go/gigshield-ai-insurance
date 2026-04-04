import { DollarSign, Calculator, Info } from 'lucide-react';

const severityMultipliers = [
    { level: 'Mild', multiplier: '20%', color: 'text-success-500', bg: 'bg-success-500/10' },
    { level: 'Medium', multiplier: '30%', color: 'text-warning-500', bg: 'bg-warning-500/10' },
    { level: 'Severe', multiplier: '50%', color: 'text-danger-500', bg: 'bg-danger-500/10' },
];

export default function PayoutLogicCard() {
    const coverage = 5000;
    const severityRate = 0.50;
    const impactScore = 82;
    const finalPayout = Math.round(coverage * severityRate * (impactScore / 100));

    return (
        <div className="bg-dark-900 border border-dark-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-black uppercase text-dark-500 tracking-[0.2em]">Payout Logic Explainer</h2>
                <DollarSign className="w-5 h-5 text-success-500" />
            </div>

            <div className="mb-6">
                <div className="flex items-center justify-between p-4 bg-dark-800/30 rounded-2xl border border-dark-700 mb-4">
                    <span className="text-sm text-dark-400">Coverage Amount</span>
                    <span className="text-xl font-black text-white">₹{coverage.toLocaleString()}</span>
                </div>

                <div className="space-y-2 mb-4">
                    <p className="text-xs text-dark-500 uppercase mb-2">Severity Multipliers</p>
                    {severityMultipliers.map((sev, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-dark-800/30 rounded-xl border border-dark-700">
                            <span className={`text-xs font-bold ${sev.color}`}>{sev.level}</span>
                            <span className="text-sm font-bold text-white">{sev.multiplier}</span>
                        </div>
                    ))}
                </div>

                <div className="p-2 bg-dark-800/30 rounded-xl border border-dark-700 mb-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-dark-400">Impact Score Multiplier</span>
                        <span className="text-sm font-bold text-primary-400">{impactScore}%</span>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-dark-800/50 rounded-2xl border border-dark-700 mb-4">
                <div className="flex items-center gap-2 mb-3">
                    <Calculator className="w-4 h-4 text-dark-400" />
                    <span className="text-xs text-dark-500 uppercase">Final Formula</span>
                </div>
                <p className="text-sm text-dark-300 font-mono mb-3">
                    Payout = Coverage × Severity × Impact Score
                </p>
                <p className="text-xs text-dark-400 font-mono">
                    ₹{coverage} × {severityRate} × {impactScore}/100 = <span className="text-success-400 font-bold">₹{finalPayout.toLocaleString()}</span>
                </p>
            </div>

            <div className="p-4 bg-success-500/10 border border-success-500/20 rounded-2xl">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">Final Payout</span>
                    <span className="text-2xl font-black text-success-500">₹{finalPayout.toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
}