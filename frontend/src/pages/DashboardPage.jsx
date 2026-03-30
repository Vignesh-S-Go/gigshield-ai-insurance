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
  const { metrics, claimsOverTime, payoutsByZone, triggerDistribution, workers, policies } = useStore();

  const avgRiskScore = (workers.reduce((sum, w) => sum + (w.riskScore || 0), 0) / (workers.length || 1)).toFixed(2);
  const activePol = policies.filter(p => p.status === 'Active').length;
  const expiredPol = policies.filter(p => p.status === 'Expired').length;

  const metricCards = [
    { icon: Users, label: 'Risk-Adjusted Workers', value: formatNumber(metrics.activeWorkers), trend: 'up', trendValue: '+12%', color: 'primary' },
    { icon: AlertTriangle, label: 'Avg Risk Score', value: avgRiskScore, trend: 'down', trendValue: '-0.02', color: 'danger' },
    { icon: ShieldAlert, label: 'High-Risk Zones', value: '4', trend: 'up', trendValue: '+1', color: 'warning' },
    { icon: Zap, label: 'Claim Frequency', value: '14.2%', trend: 'down', trendValue: '-1.5%', color: 'purple' },
    { icon: ShieldAlert, label: 'Exclusions Triggered', value: '3', trend: 'up', trendValue: '+3', color: 'danger' },
  ];

  return (
    <div className="animate-fade-in">
      <Header title="Dashboard" subtitle="Welcome back! Here's your overview." />

      {/* Simulation Engine */}
      <TestEngine />

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
              <p className="text-lg font-bold text-dark-800 dark:text-dark-200">{policies.length}</p>
            </div>
            <div className="p-3 bg-dark-50 dark:bg-dark-700/50 rounded-xl">
              <p className="text-xs text-dark-400 font-bold uppercase tracking-wider mb-1">Avg Deductible</p>
              <p className="text-lg font-bold text-dark-800 dark:text-dark-200">₹2,500</p>
            </div>
            <div className="p-3 bg-dark-50 dark:bg-dark-700/50 rounded-xl">
              <p className="text-xs text-dark-400 font-bold uppercase tracking-wider mb-1">Active vs Expired</p>
              <p className="text-sm font-bold text-success-500">{activePol} Active <span className="text-danger-500">/ {expiredPol} Expired</span></p>
            </div>
            <div className="p-3 bg-dark-50 dark:bg-dark-700/50 rounded-xl">
              <p className="text-xs text-dark-400 font-bold uppercase tracking-wider mb-1">Coverage Top Type</p>
              <p className="text-sm font-bold text-primary-500">Standard (45%)</p>
            </div>
          </div>
        </div>

        {/* Exclusion Tracker */}
        <div className="glass-card rounded-2xl p-5 border-l-4 border-danger-500">
          <h3 className="text-base font-semibold text-dark-800 dark:text-dark-200 mb-4 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-danger-500" /> Exclusion Tracker Widget
          </h3>
          <p className="text-xs text-dark-500 mb-3 block">Exclusions Triggered Today: <strong className="text-white">52 Total</strong></p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-dark-600 dark:text-dark-300 flex items-center gap-2">☣️ Pandemic Clause 4.2</span>
              <span className="text-sm font-bold text-danger-500">45 Rejected</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-dark-600 dark:text-dark-300 flex items-center gap-2">💣 Terrorism Act Exclusion</span>
              <span className="text-sm font-bold text-danger-500">2 Rejected</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-dark-600 dark:text-dark-300 flex items-center gap-2">⛈️ Extreme Uninsurable Weather</span>
              <span className="text-sm font-bold text-warning-500">5 Rejected</span>
            </div>
          </div>
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
          <h3 className="text-base font-semibold text-dark-800 dark:text-dark-200 mb-4">Live Event & Alert Feed</h3>
          <div className="space-y-3">
            {[
              { icon: '🚨', text: 'Claim #102 rejected (Pandemic Exclusion Clause 4.2)', time: '2 min ago', type: 'danger' },
              { icon: '💰', text: 'Worker GS-2B4A premium increased by 15% due to high risk behavior', time: '5 min ago', type: 'warning' },
              { icon: '☔', text: 'Weather conditions increasing risk in Mumbai zone by 32%', time: '12 min ago', type: 'warning' },
              { icon: '✅', text: 'Claim GS-9A2X approved (Parametric Rainfall Threshold Met)', time: '18 min ago', type: 'success' },
              { icon: '🛡️', text: 'High fraud risk detected in Delhi zone (Suspicious Location Clustering)', time: '25 min ago', type: 'danger' },
              { icon: '🌙', text: 'Night deliveries consistently increasing claim probability by 23%', time: '32 min ago', type: 'info' },
              { icon: '📈', text: 'Auto-renewal processed for 42 Standard policies in Bangalore', time: '45 min ago', type: 'info' },
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
