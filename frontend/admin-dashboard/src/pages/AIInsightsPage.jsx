import { AlertTriangle, TrendingUp, ShieldAlert, Brain, MapPin } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area,
} from 'recharts';
import Header from '../components/Header';
import useStore from '../store/useStore';

export default function AIInsightsPage() {
  const { aiInsights } = useStore();

  const severityColors = {
    high: 'bg-danger-50 text-danger-700 border-danger-200 dark:bg-danger-600/10 dark:text-danger-400 dark:border-danger-600/30',
    medium: 'bg-warning-50 text-warning-700 border-warning-200 dark:bg-warning-500/10 dark:text-warning-400 dark:border-warning-500/30',
    low: 'bg-success-50 text-success-700 border-success-200 dark:bg-success-600/10 dark:text-success-400 dark:border-success-600/30',
  };

  const threatIcons = {
    Flood: '🌊',
    AQI: '💨',
    Rain: '🌧️',
    Heat: '🌡️',
    Curfew: '🚫',
  };

  return (
    <div className="animate-fade-in">
      <Header title="AI Insights" subtitle="Powered by GigShield AI Engine v2.3" />

      {/* AI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="glass-card rounded-2xl p-5 border-l-4 border-primary-500">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-primary-500" />
            <div>
              <p className="text-2xl font-bold text-dark-800 dark:text-dark-200">{aiInsights.highRiskZones.length}</p>
              <p className="text-sm text-dark-400">High-Risk Zones</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-5 border-l-4 border-warning-400">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-warning-500" />
            <div>
              <p className="text-2xl font-bold text-dark-800 dark:text-dark-200">
                {aiInsights.predictions.reduce((s, p) => s + p.disruptions, 0)}
              </p>
              <p className="text-sm text-dark-400">Predicted Disruptions (7d)</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-5 border-l-4 border-danger-500">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-danger-500" />
            <div>
              <p className="text-2xl font-bold text-dark-800 dark:text-dark-200">{aiInsights.fraudAlerts.length}</p>
              <p className="text-sm text-dark-400">Active Fraud Alerts</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* High-Risk Zones */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-base font-semibold text-dark-800 dark:text-dark-200 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-danger-500" /> High-Risk Zones
          </h3>
          <div className="space-y-3">
            {aiInsights.highRiskZones.map((zone, i) => (
              <div key={i} className="p-4 rounded-xl bg-dark-50 dark:bg-dark-700/30 hover:bg-dark-100 dark:hover:bg-dark-700/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{threatIcons[zone.trigger]}</span>
                    <div>
                      <p className="text-sm font-semibold text-dark-800 dark:text-dark-200">{zone.zone}</p>
                      <p className="text-xs text-dark-400">{zone.trigger} threat</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${zone.riskLevel >= 0.8 ? 'text-danger-500' : zone.riskLevel >= 0.7 ? 'text-warning-500' : 'text-dark-500'}`}>
                      {(zone.riskLevel * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
                <div className="w-full h-1.5 rounded-full bg-dark-200 dark:bg-dark-600 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${zone.riskLevel >= 0.8 ? 'bg-danger-500' : zone.riskLevel >= 0.7 ? 'bg-warning-400' : 'bg-success-500'}`}
                    style={{ width: `${zone.riskLevel * 100}%` }}
                  />
                </div>
                <p className="text-xs text-dark-400 mt-2">{zone.prediction}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Predicted Disruptions */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-base font-semibold text-dark-800 dark:text-dark-200 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-500" /> Predicted Disruptions — Next 7 Days
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={aiInsights.predictions}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }} />
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="disruptions" stroke="#6366f1" fill="url(#areaGrad)" strokeWidth={2.5} name="Disruptions" />
            </AreaChart>
          </ResponsiveContainer>

          {/* Confidence */}
          <div className="mt-4">
            <h4 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-2">Model Confidence by Day</h4>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={aiInsights.predictions}>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis domain={[60, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip formatter={(v) => `${v}%`} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="confidence" fill="#10b981" radius={[4, 4, 0, 0]} name="Confidence" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Fraud Alerts */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="text-base font-semibold text-dark-800 dark:text-dark-200 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-danger-500" /> Fraud Alerts
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {aiInsights.fraudAlerts.map((alert, i) => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border ${severityColors[alert.severity]} transition-all hover:shadow-md`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm font-semibold">{alert.workerName}</p>
                <span className={`badge text-[10px] ${alert.severity === 'high' ? 'bg-danger-100 text-danger-700 dark:bg-danger-600/20 dark:text-danger-400' : alert.severity === 'medium' ? 'bg-warning-100 text-warning-700 dark:bg-warning-500/20 dark:text-warning-400' : 'bg-success-100 text-success-700 dark:bg-success-600/20 dark:text-success-400'}`}>
                  {alert.severity}
                </span>
              </div>
              <p className="text-xs opacity-80">{alert.description}</p>
              <p className="text-[10px] opacity-60 mt-2">{alert.timestamp}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
