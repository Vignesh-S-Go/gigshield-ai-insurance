import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

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

  // Parsing value logic
  const stringValue = String(value);
  const isPercent = stringValue.includes('%');
  const numericMatch = stringValue.replace(/,/g, '').match(/[\d.]+/);
  const numericTarget = numericMatch ? parseFloat(numericMatch[0]) : null;

  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    if (numericTarget === null) return stringValue;
    const isDecimal = stringValue.includes('.') && numericTarget % 1 !== 0;
    const formatted = isDecimal ? latest.toFixed(2) : Math.round(latest).toLocaleString();
    return stringValue.replace(/[\d.,]+/, formatted);
  });

  const [displayValue, setDisplayValue] = useState(stringValue);

  useEffect(() => {
    if (numericTarget !== null) {
      const controls = animate(count, numericTarget, { duration: 1.5, ease: "easeOut" });
      return controls.stop;
    } else {
      setDisplayValue(stringValue);
    }
  }, [numericTarget, count, stringValue]);

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="glass-card metric-card rounded-2xl p-5 relative overflow-hidden"
    >
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
        <motion.p className="text-2xl font-bold text-dark-900 dark:text-white tracking-tight">
          {numericTarget !== null ? <motion.span>{rounded}</motion.span> : displayValue}
        </motion.p>
        <p className="text-sm text-dark-400 dark:text-dark-500 mt-0.5">{label}</p>
      </div>
    </motion.div>
  );
}
