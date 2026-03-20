import { MapPin, AlertTriangle, FileText, Zap } from 'lucide-react';
import Header from '../components/Header';
import useStore from '../store/useStore';

export default function ZoneRiskPage() {
  const { zoneRiskData } = useStore();

  const threatColors = {
    Flood: { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-700 dark:text-blue-400', icon: '🌊' },
    AQI: { bg: 'bg-purple-50 dark:bg-purple-500/10', text: 'text-purple-700 dark:text-purple-400', icon: '💨' },
    Rain: { bg: 'bg-cyan-50 dark:bg-cyan-500/10', text: 'text-cyan-700 dark:text-cyan-400', icon: '🌧️' },
    Heat: { bg: 'bg-orange-50 dark:bg-orange-500/10', text: 'text-orange-700 dark:text-orange-400', icon: '🌡️' },
  };

  const sorted = [...zoneRiskData].sort((a, b) => b.riskScore - a.riskScore);

  return (
    <div className="animate-fade-in">
      <Header title="Zone Risk Visualization" subtitle="Monitor risk levels across delivery zones" />

      {/* Risk Overview Bar */}
      <div className="glass-card rounded-2xl p-5 mb-6">
        <h3 className="text-sm font-semibold text-dark-800 dark:text-dark-200 mb-4">Risk Heatmap Overview</h3>
        <div className="flex gap-1 h-10 rounded-xl overflow-hidden">
          {sorted.map((zone, i) => (
            <div
              key={i}
              title={`${zone.zone}: ${(zone.riskScore * 100).toFixed(0)}%`}
              className={`flex-1 transition-all hover:opacity-80 cursor-pointer ${zone.riskScore >= 0.8 ? 'bg-danger-500' : zone.riskScore >= 0.7 ? 'bg-warning-400' : zone.riskScore >= 0.6 ? 'bg-warning-300' : 'bg-success-400'}`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs text-dark-400">Highest Risk</span>
          <span className="text-xs text-dark-400">Lowest Risk</span>
        </div>
      </div>

      {/* Zone Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sorted.map((zone, i) => {
          const threat = threatColors[zone.primaryThreat] || threatColors.Rain;
          const riskPercent = (zone.riskScore * 100).toFixed(0);
          return (
            <div key={i} className="glass-card rounded-2xl p-5 hover:shadow-lg transition-all" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl ${threat.bg}`}>
                    <span className="text-xl">{threat.icon}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-dark-800 dark:text-dark-200">{zone.zone}</h4>
                    <p className="text-xs text-dark-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {zone.city}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${zone.riskScore >= 0.8 ? 'text-danger-500' : zone.riskScore >= 0.7 ? 'text-warning-500' : 'text-success-500'}`}>
                    {riskPercent}%
                  </p>
                  <p className="text-[10px] text-dark-400 uppercase tracking-wider">Risk Score</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-dark-100 dark:bg-dark-700 overflow-hidden mb-4">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${zone.riskScore >= 0.8 ? 'bg-danger-500' : zone.riskScore >= 0.7 ? 'bg-warning-400' : 'bg-success-500'}`}
                  style={{ width: `${riskPercent}%` }}
                />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-2 rounded-lg bg-dark-50 dark:bg-dark-700/50">
                  <Zap className="w-4 h-4 mx-auto text-dark-400 mb-1" />
                  <p className="text-sm font-bold text-dark-800 dark:text-dark-200">{zone.recentClaims}</p>
                  <p className="text-[10px] text-dark-400">Claims</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-dark-50 dark:bg-dark-700/50">
                  <FileText className="w-4 h-4 mx-auto text-dark-400 mb-1" />
                  <p className="text-sm font-bold text-dark-800 dark:text-dark-200">{zone.activePolicies}</p>
                  <p className="text-[10px] text-dark-400">Policies</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-dark-50 dark:bg-dark-700/50">
                  <AlertTriangle className="w-4 h-4 mx-auto text-dark-400 mb-1" />
                  <p className={`text-sm font-bold ${threat.text}`}>{zone.primaryThreat}</p>
                  <p className="text-[10px] text-dark-400">Threat</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
