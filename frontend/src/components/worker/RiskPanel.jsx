import { CloudRain, Wind, Thermometer, AlertTriangle, RefreshCw } from 'lucide-react';

function getRiskBadge(riskLevel) {
    const levels = {
        LOW: { bg: 'bg-success-500/10', text: 'text-success-500', label: 'Low Risk' },
        MEDIUM: { bg: 'bg-warning-500/10', text: 'text-warning-500', label: 'Medium' },
        HIGH: { bg: 'bg-orange-500/10', text: 'text-orange-500', label: 'High Risk' },
        SEVERE: { bg: 'bg-danger-500/10', text: 'text-danger-500', label: 'Severe' },
    };
    return levels[riskLevel] || levels.LOW;
}

export default function RiskPanel({ riskData, loading, onRefresh }) {
    if (!riskData) {
        return (
            <div className="bg-dark-800 border border-dark-700 rounded-2xl p-4">
                <div className="text-center text-dark-400 text-sm">
                    Loading risk data...
                </div>
            </div>
        );
    }

    const { current, forecast } = riskData;
    const riskBadge = getRiskBadge(current?.risk_level);

    return (
        <div className="bg-dark-800 border border-dark-700 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-warning-500" />
                    Real-Time Risk
                </h3>
                <button 
                    onClick={onRefresh}
                    disabled={loading}
                    className="p-1.5 hover:bg-dark-700 rounded-lg transition-colors"
                >
                    <RefreshCw className={`w-4 h-4 text-dark-400 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-2 bg-dark-700/50 rounded-xl">
                    <Wind className="w-4 h-4 text-dark-400 mx-auto mb-1" />
                    <span className="text-xs text-dark-500">AQI</span>
                    <p className="text-sm font-bold text-white">{current?.aqi || '--'}</p>
                </div>
                <div className="text-center p-2 bg-dark-700/50 rounded-xl">
                    <CloudRain className="w-4 h-4 text-dark-400 mx-auto mb-1" />
                    <span className="text-xs text-dark-500">Rain</span>
                    <p className="text-sm font-bold text-white">{current?.rain_probability || '--'}%</p>
                </div>
                <div className="text-center p-2 bg-dark-700/50 rounded-xl">
                    <Thermometer className="w-4 h-4 text-dark-400 mx-auto mb-1" />
                    <span className="text-xs text-dark-500">Temp</span>
                    <p className="text-sm font-bold text-white">{current?.temperature || '--'}°C</p>
                </div>
            </div>

            <div className={`flex items-center justify-between p-2 ${riskBadge.bg} rounded-xl mb-3`}>
                <span className={`text-xs font-bold ${riskBadge.text}`}>{riskBadge.label}</span>
                <span className="text-xs text-dark-400">{current?.risk_label || 'Checking...'}</span>
            </div>

            {forecast?.message && (
                <p className="text-xs text-dark-400 leading-relaxed">
                    {forecast.message}
                </p>
            )}
        </div>
    );
}