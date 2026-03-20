import { TrendingUp, TrendingDown } from 'lucide-react';

export default function MetricCard({ icon: Icon, label, value, trend, trendValue, color = 'primary' }) {
  const colorClasses = {
    primary: 'from-primary-500 to-primary-600',
    success: 'from-success-500 to-success-600',
    danger: 'from-danger-500 to-danger-600',
    warning: 'from-warning-400 to-warning-500',
    purple: 'from-purple-500 to-purple-600',
  };

  const iconBgClasses = {
    primary: 'bg-primary-50 dark:bg-primary-500/15',
    success: 'bg-success-50 dark:bg-success-600/15',
    danger: 'bg-danger-50 dark:bg-danger-600/15',
    warning: 'bg-warning-50 dark:bg-warning-500/15',
    purple: 'bg-purple-50 dark:bg-purple-500/15',
  };

  const iconColorClasses = {
    primary: 'text-primary-600 dark:text-primary-400',
    success: 'text-success-600 dark:text-success-400',
    danger: 'text-danger-600 dark:text-danger-400',
    warning: 'text-warning-500 dark:text-warning-400',
    purple: 'text-purple-600 dark:text-purple-400',
  };

  return (
    <div className="glass-card metric-card rounded-2xl p-5 relative overflow-hidden">
      {/* Gradient accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colorClasses[color]}`} />

      <div className="flex items-start justify-between">
        <div className={`p-2.5 rounded-xl ${iconBgClasses[color]}`}>
          <Icon className={`w-5 h-5 ${iconColorClasses[color]}`} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${trend === 'up' ? 'text-success-500' : 'text-danger-500'}`}>
            {trend === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {trendValue}
          </div>
        )}
      </div>

      <div className="mt-4">
        <p className="text-2xl font-bold text-dark-900 dark:text-white tracking-tight">{value}</p>
        <p className="text-sm text-dark-400 dark:text-dark-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}
