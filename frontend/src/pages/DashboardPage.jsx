import { AlertTriangle, FileText, ShieldAlert, Users, Zap } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis, YAxis,
} from 'recharts';
import Header from '../components/Header';
import MetricCard from '../components/MetricCard';
import TestEngine from '../components/TestEngine';
import useStore from '../store/useStore';
import { formatCurrency, formatNumber } from '../utils/helpers';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-dark-800 p-3 rounded-xl shadow-xl border border-dark-100 dark:border-dark-700 text-sm">
        <p className="font-semibold text-dark-800 dark:text-dark-200 mb-1">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} className="text-dark-500 dark:text-dark-400">
            <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: entry.color }} />
            {entry.name}: {typeof entry.value === 'number' && entry.value > 1000 ? formatCurrency(entry.value) : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const { 
    metrics, 
    claimStats, 
    policyStats, 
    zoneStats,
    claimsOverTime, 
    payoutsByZone, 
    triggerDistribution, 
    workers, 
    policies, 
    notifications,
    aiInsights,
    user 
  } = useStore();

  const avgRiskScore = metrics.avgRiskScore || 
    (workers.length ? (workers.reduce((sum, w) => sum + (w.riskScore || 0), 0) / workers.length).toFixed(2) : '0.00');
  
  const claimFrequency = workers.length 
    ? ((claimStats.total / workers.length) * 100).toFixed(1) 
    : '0.0';

  const metricCards = [
    { icon: Users, label: 'Active Workers', value: formatNumber(metrics.activeWorkers || 0), trend: 'up', trendValue: '+12%', color: 'primary' },
    { icon: AlertTriangle, label: 'Avg Risk Score', value: avgRiskScore, trend: 'down', trendValue: '-0.02', color: 'danger' },
    { icon: ShieldAlert, label: 'High-Risk Zones', value: zoneStats.highRiskZones || '0', trend: 'up', trendValue: '+1', color: 'warning' },
    { icon: Zap, label: 'Claim Frequency', value: `${claimFrequency}%`, trend: 'down', trendValue: '-1.5%', color: 'purple' },
    { icon: FileText, label: 'Flagged Claims', value: claimStats.flagged || '0', trend: 'up', trendValue: '+3', color: 'danger' },
  ];

  const highRiskWorkers = workers.filter(w => w.riskScore > 0.7).slice(0, 48);

  return (
    <div className="animate-fade-in">
      <Header 
        title="Dashboard" 
        subtitle={user?.name ? `Welcome back, ${user.name}!` : "Welcome back! Here's your overview."} 
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {metricCards.map((card, i) => (
          <div key={i} style={{ animationDelay: `${i * 80}ms` }} className="animate-fade-in">
            <MetricCard {...card} />
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Claims Over Time */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-base font-semibold text-dark-800 dark:text-dark-200 mb-4">Claims Over Time</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={claimsOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} />
              <Line type="monotone" dataKey="claims" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 6 }} name="Claims" />
              <Line type="monotone" dataKey="payouts" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} name="Payouts (₹)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Payouts by Zone */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-base font-semibold text-dark-800 dark:text-dark-200 mb-4">Payouts by Zone</h3>
          {payoutsByZone.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={payoutsByZone}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                <XAxis dataKey="zone" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="payouts" fill="url(#barGradient)" radius={[6, 6, 0, 0]} name="Payouts (₹)" />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-dark-400">
              No payout data available
            </div>
          )}
        </div>
      </div>

      {/* Intelligence Panels Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Policy Intelligence */}
        <div className="glass-card rounded-2xl p-5 border-l-4 border-success-500">
          <h3 className="text-base font-semibold text-dark-800 dark:text-dark-200 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-success-500" /> Policy Intelligence Panel
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-dark-50 dark:bg-dark-700/50 rounded-xl">
              <p className="text-xs text-dark-400 font-bold uppercase tracking-wider mb-1">Total Policies</p>
              <p className="text-lg font-bold text-dark-800 dark:text-dark-200">{policyStats.total || policies.length}</p>
            </div>
            <div className="p-3 bg-dark-50 dark:bg-dark-700/50 rounded-xl">
              <p className="text-xs text-dark-400 font-bold uppercase tracking-wider mb-1">Total Premium</p>
              <p className="text-lg font-bold text-dark-800 dark:text-dark-200">{formatCurrency(policyStats.totalPremium || 0)}</p>
            </div>
            <div className="p-3 bg-dark-50 dark:bg-dark-700/50 rounded-xl">
              <p className="text-xs text-dark-400 font-bold uppercase tracking-wider mb-1">Active vs Expired</p>
              <p className="text-sm font-bold text-success-500">{policyStats.active || 0} Active <span className="text-danger-500">/ {policyStats.expired || 0} Expired</span></p>
            </div>
            <div className="p-3 bg-dark-50 dark:bg-dark-700/50 rounded-xl">
              <p className="text-xs text-dark-400 font-bold uppercase tracking-wider mb-1">Coverage Top Type</p>
              <p className="text-sm font-bold text-primary-500">Standard (45%)</p>
            </div>
          </div>
        </div>

        {/* Claim Stats */}
        <div className="glass-card rounded-2xl p-5 border-l-4 border-primary-500">
          <h3 className="text-base font-semibold text-dark-800 dark:text-dark-200 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary-500" /> Claims Overview
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-dark-50 dark:bg-dark-700/50 rounded-xl">
              <p className="text-xs text-dark-400 font-bold uppercase tracking-wider mb-1">Total Claims</p>
              <p className="text-lg font-bold text-dark-800 dark:text-dark-200">{claimStats.total || 0}</p>
            </div>
            <div className="p-3 bg-dark-50 dark:bg-dark-700/50 rounded-xl">
              <p className="text-xs text-dark-400 font-bold uppercase tracking-wider mb-1">Total Payout</p>
              <p className="text-lg font-bold text-dark-800 dark:text-dark-200">{formatCurrency(claimStats.totalPayout || 0)}</p>
            </div>
            <div className="p-3 bg-dark-50 dark:bg-dark-700/50 rounded-xl">
              <p className="text-xs text-dark-400 font-bold uppercase tracking-wider mb-1">Pending</p>
              <p className="text-sm font-bold text-warning-500">{claimStats.pending || 0}</p>
            </div>
            <div className="p-3 bg-dark-50 dark:bg-dark-700/50 rounded-xl">
              <p className="text-xs text-dark-400 font-bold uppercase tracking-wider mb-1">Flagged</p>
              <p className="text-sm font-bold text-danger-500">{claimStats.flagged || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Analysis Heatmap */}
      <div className="glass-card rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-bold text-dark-800 dark:text-dark-200 uppercase tracking-widest">
            AI Fleet Risk Heatmap
          </h3>
          <div className="flex gap-2">
            <span className="text-[10px] text-dark-400">Low Risk</span>
            <div className="flex gap-1">
              <div className="w-4 h-4 bg-success-500/20 rounded"></div>
              <div className="w-4 h-4 bg-warning-500/40 rounded"></div>
              <div className="w-4 h-4 bg-danger-500/60 rounded"></div>
            </div>
            <span className="text-[10px] text-dark-400">High Risk</span>
          </div>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2">
          {workers.slice(0, 48).map((worker, i) => {
            const risk = worker.riskScore || 0;
            const color = risk > 0.8 ? 'bg-danger-500/60 border-danger-500' : risk > 0.5 ? 'bg-warning-500/40 border-warning-500' : 'bg-success-500/20 border-success-500';
            return (
              <div key={worker.id || i} className={`h-8 rounded-lg border flex items-center justify-center group relative cursor-pointer ${color}`}>
                <div className="absolute bottom-full mb-2 hidden group-hover:block bg-dark-800 text-[8px] p-2 rounded whitespace-nowrap z-50">
                  {worker.name}: Risk {(risk * 100).toFixed(0)}%
                </div>
              </div>
            );
          })}
          {workers.length === 0 && (
            <div className="col-span-12 text-center py-8 text-dark-400">
              No workers data available
            </div>
          )}
        </div>
      </div>

      {/* Trigger Distribution + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-base font-semibold text-dark-800 dark:text-dark-200 mb-4">Trigger Types Distribution</h3>
          {triggerDistribution.some(t => t.value > 0) ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={triggerDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {triggerDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} formatter={(val) => <span className="text-sm text-dark-500 dark:text-dark-400">{val}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-dark-400">
              No trigger data available
            </div>
          )}
        </div>

        {/* Quick Stats / Notifications */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-5">
          <h3 className="text-base font-semibold text-dark-800 dark:text-dark-200 mb-4">Recent Notifications</h3>
          <div className="space-y-3">
            {notifications.slice(0, 7).map((item, i) => {
              const iconMap = { danger: '🚨', warning: '⚠️', success: '✅', info: 'ℹ️' };
              const icon = item.icon || iconMap[item.type] || '🔔';
              return (
                <div
                  key={item.id || i}
                  className={`flex items-start gap-3 p-3 rounded-xl transition-colors hover:bg-dark-50 dark:hover:bg-dark-700/30`}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <span className="text-lg flex-shrink-0">{icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-dark-700 dark:text-dark-300"><strong>{item.title}</strong>: {item.message}</p>
                    <p className="text-xs text-dark-400 dark:text-dark-500 mt-0.5">{item.time}</p>
                  </div>
                </div>
              );
            })}
            {notifications.length === 0 && (
              <div className="text-center py-8 text-dark-400">
                No notifications available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
