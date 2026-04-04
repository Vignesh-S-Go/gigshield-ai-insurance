import { AlertTriangle, CloudRain, Wind, Clock } from 'lucide-react';

const predictions = [
    { icon: Wind, title: 'AQI rising in Delhi', detail: '3 hrs', color: 'text-warning-500', bg: 'bg-warning-500/10' },
    { icon: CloudRain, title: 'Heavy rainfall in Mumbai', detail: '5 hrs', color: 'text-danger-500', bg: 'bg-danger-500/10' },
];

export default function PredictionPanel() {
    return (
        <div className="bg-dark-900 border border-warning-500/30 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-warning-500" />
                    <h2 className="text-sm font-black uppercase text-warning-500 tracking-[0.2em]">Prediction & Prevention</h2>
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-dark-400" />
                    <span className="text-xs text-dark-400">Real-time</span>
                </div>
            </div>

            <div className="space-y-3 mb-6">
                {predictions.map((pred, idx) => (
                    <div key={idx} className={`flex items-center justify-between p-4 ${pred.bg} rounded-2xl border border-dark-700`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 ${pred.bg} rounded-xl`}>
                                <pred.icon className={`w-5 h-5 ${pred.color}`} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white">{pred.title}</h4>
                                <p className="text-xs text-dark-400">Expected: {pred.detail}</p>
                            </div>
                        </div>
                        <span className={`text-xs font-bold ${pred.color}`}>Pending</span>
                    </div>
                ))}
            </div>

            <div className="p-3 bg-warning-500/5 border border-warning-500/20 rounded-xl">
                <p className="text-xs text-dark-400">
                    <span className="text-warning-500 font-bold">System will auto-trigger</span> payouts if thresholds are crossed.
                </p>
            </div>
        </div>
    );
}