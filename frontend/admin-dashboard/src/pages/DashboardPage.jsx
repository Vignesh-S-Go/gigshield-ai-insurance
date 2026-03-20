import { Users, FileText, Zap, Wallet, AlertTriangle } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import Header from '../components/Header';
import MetricCard from '../components/MetricCard';
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
  const { metrics, claimsOverTime, payoutsByZone, triggerDistribution } = useStore();

  const metricCards = [
    { icon: Users, label: 'Active Workers', value: formatNumber(metrics.activeWorkers), trend: 'up', trendValue: '+12%', color: 'primary' },
    { icon: FileText, label: 'Active Policies', value: formatNumber(metrics.activePolicies), trend: 'up', trendValue: '+8%', color: 'success' },
    { icon: Zap, label: 'Claims Today', value: metrics.todayClaims.toString(), trend: 'up', trendValue: '+3', color: 'warning' },
    { icon: Wallet, label: 'Total Payouts', value: formatCurrency(metrics.totalPayout), trend: 'down', trendValue: '-5%', color: 'purple' },
    { icon: AlertTriangle, label: 'Fraud Alerts', value: metrics.fraudAlerts.toString(), trend: 'up', trendValue: '+2', color: 'danger' },
  ];

  return (
    <div className="animate-fade-in">
      <Header title="Dashboard" subtitle="Welcome back! Here's your overview." />

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
        </div>
      </div>

      {/* Trigger Distribution + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-base font-semibold text-dark-800 dark:text-dark-200 mb-4">Trigger Types Distribution</h3>
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
        </div>

        {/* Quick Stats */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-5">
          <h3 className="text-base font-semibold text-dark-800 dark:text-dark-200 mb-4">Real-Time Activity Feed</h3>
          <div className="space-y-3">
            {[
              { icon: '🌧️', text: 'Heavy rain detected in Mumbai — 12 claims pending', time: '2 min ago', type: 'warning' },
              { icon: '✅', text: '₹8,500 payout processed for Delhi zone workers', time: '5 min ago', type: 'success' },
              { icon: '🚨', text: 'Fraud alert: Duplicate claim from worker GS-K9M2P', time: '12 min ago', type: 'danger' },
              { icon: '📊', text: 'AI model updated risk scores for Bangalore zone', time: '18 min ago', type: 'info' },
              { icon: '🌡️', text: 'Heat wave alert triggered for Jaipur — 45°C expected', time: '25 min ago', type: 'warning' },
              { icon: '💰', text: '15 new Pro plan subscriptions from Chennai', time: '32 min ago', type: 'success' },
              { icon: '🔄', text: 'Auto-renewal processed for 42 Standard policies', time: '45 min ago', type: 'info' },
            ].map((item, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 p-3 rounded-xl transition-colors hover:bg-dark-50 dark:hover:bg-dark-700/30`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-dark-700 dark:text-dark-300">{item.text}</p>
                  <p className="text-xs text-dark-400 dark:text-dark-500 mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
