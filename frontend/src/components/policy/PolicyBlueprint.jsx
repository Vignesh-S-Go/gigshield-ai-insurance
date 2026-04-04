import { Shield, Droplets, Briefcase, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';

const coverageList = [
    { title: 'Income Loss', desc: 'Daily payout for downtime', icon: Briefcase },
    { title: 'Weather Risk', desc: 'Rain & Heat triggers', icon: Droplets },
    { title: 'Accident Protection', desc: 'Up to ₹50,000 cover', icon: Shield },
];

export default function PolicyBlueprint() {
    const [enabled, setEnabled] = useState(true);

    return (
        <div className="bg-dark-900 border border-dark-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-black uppercase text-dark-500 tracking-[0.2em]">Policy Blueprint</h2>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-dark-400">{enabled ? 'Enabled' : 'Disabled'}</span>
                    <button
                        onClick={() => setEnabled(!enabled)}
                        className={`relative w-12 h-6 rounded-full transition-colors ${enabled ? 'bg-success-500' : 'bg-dark-700'}`}
                    >
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${enabled ? 'left-7' : 'left-1'}`} />
                    </button>
                </div>
            </div>

            <div className="mb-6">
                <h3 className="text-xl font-black text-white">ZeroClaim Pro Plan</h3>
                <p className="text-sm text-dark-400 mt-1">Comprehensive parametric coverage</p>
            </div>

            <div className="space-y-3 mb-6">
                {coverageList.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-dark-800/50 rounded-2xl border border-dark-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary-500/10 rounded-xl">
                                <item.icon className="w-5 h-5 text-primary-400" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white">{item.title}</h4>
                                <p className="text-[10px] text-dark-400">{item.desc}</p>
                            </div>
                        </div>
                        <CheckCircle className="w-5 h-5 text-success-500" />
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-between p-4 bg-dark-800/50 rounded-2xl border border-dark-700">
                <div>
                    <span className="text-xs text-dark-400 uppercase">Weekly Premium</span>
                    <p className="text-2xl font-black text-white">₹71.00</p>
                </div>
                <div className="text-right">
                    <span className="text-[10px] text-dark-500 bg-dark-800 px-2 py-1 rounded">AUTO-DEBIT</span>
                </div>
            </div>
        </div>
    );
}