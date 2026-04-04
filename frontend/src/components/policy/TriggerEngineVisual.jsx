import { Cloud, FileCheck, Shield, DollarSign, ArrowRight, Activity } from 'lucide-react';

const stages = [
    { icon: Activity, label: 'Sensor Data', desc: 'Weather API' },
    { icon: Cloud, label: 'Threshold Check', desc: 'Rule Engine' },
    { icon: FileCheck, label: 'Policy Match', desc: 'Find Workers' },
    { icon: Shield, label: 'Fraud Check', desc: 'Risk Analysis' },
    { icon: DollarSign, label: 'Payout', desc: 'UPI Transfer' },
];

export default function TriggerEngineVisual() {
    return (
        <div className="bg-dark-900 border border-dark-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-black uppercase text-dark-500 tracking-[0.2em]">Trigger Engine Pipeline</h2>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-success-500 animate-pulse"></span>
                    <span className="text-xs text-success-500 uppercase font-bold">Live</span>
                </div>
            </div>

            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-4">
                {stages.map((stage, idx) => (
                    <div key={idx} className="flex items-center flex-1 min-w-fit">
                        <div className="flex flex-col items-center p-4 bg-dark-800/50 rounded-2xl border border-dark-700 hover:border-primary-500/30 transition-colors">
                            <div className="p-3 bg-primary-500/10 rounded-xl mb-2">
                                <stage.icon className="w-6 h-6 text-primary-400" />
                            </div>
                            <span className="text-sm font-bold text-white">{stage.label}</span>
                            <span className="text-[10px] text-dark-400">{stage.desc}</span>
                        </div>
                        {idx < stages.length - 1 && (
                            <ArrowRight className="w-5 h-5 text-dark-600 mx-2 flex-shrink-0" />
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-dark-800/30 rounded-xl border border-dark-700">
                    <span className="text-xs text-dark-400 uppercase">AQI &gt; 150</span>
                    <p className="text-sm font-bold text-white">→ Mild Trigger</p>
                </div>
                <div className="p-3 bg-dark-800/30 rounded-xl border border-dark-700">
                    <span className="text-xs text-dark-400 uppercase">Rainfall &gt; 75mm</span>
                    <p className="text-sm font-bold text-white">→ Medium Trigger</p>
                </div>
                <div className="p-3 bg-dark-800/30 rounded-xl border border-dark-700">
                    <span className="text-xs text-dark-400 uppercase">Flood Alert</span>
                    <p className="text-sm font-bold text-white">→ Severe Trigger</p>
                </div>
            </div>
        </div>
    );
}