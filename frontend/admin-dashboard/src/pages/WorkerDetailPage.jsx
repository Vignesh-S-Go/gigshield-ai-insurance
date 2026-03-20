import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, MapPin, Star, Truck, TrendingUp } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar,
} from 'recharts';
import useStore from '../store/useStore';
import { formatCurrency, formatDate, getStatusColor, getRiskColor, getTriggerIcon } from '../utils/helpers';

export default function WorkerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getWorkerById } = useStore();
  const worker = getWorkerById(id);

  if (!worker) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-lg font-semibold text-dark-500">Worker not found</p>
        <button onClick={() => navigate('/workers')} className="btn-primary mt-4">
          <ArrowLeft className="w-4 h-4" /> Back to Workers
        </button>
      </div>
    );
  }

  const riskData = [
    { subject: 'Weather', value: parseFloat(worker.riskBreakdown.weatherExposure) * 100 },
    { subject: 'Claims', value: parseFloat(worker.riskBreakdown.claimFrequency) * 100 },
    { subject: 'Earnings', value: parseFloat(worker.riskBreakdown.earningsVolatility) * 100 },
    { subject: 'Zone', value: parseFloat(worker.riskBreakdown.zoneRisk) * 100 },
    { subject: 'Fraud', value: parseFloat(worker.riskBreakdown.fraudIndicator) * 100 },
  ];

  const risk = getRiskColor(worker.riskScore);

  return (
    <div className="animate-fade-in">
      {/* Back button */}
      <button
        onClick={() => navigate('/workers')}
        className="flex items-center gap-2 text-sm text-dark-400 hover:text-primary-500 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Workers
      </button>

      {/* Worker Profile Card */}
      <div className="glass-card rounded-2xl p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 shadow-xl shadow-primary-500/20">
            {worker.name.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-dark-900 dark:text-white">{worker.name}</h2>
                <p className="text-sm text-dark-400 mt-0.5">{worker.id}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`badge text-sm ${getStatusColor(worker.status)}`}>
                  {worker.status === 'active' ? '● Active' : '○ Inactive'}
                </span>
                <span className={`badge text-sm ${risk.bg} ${risk.text} ${risk.dark}`}>
                  Risk: {(worker.riskScore * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm text-dark-500 dark:text-dark-400">
                <MapPin className="w-4 h-4" /> {worker.city}
              </div>
              <div className="flex items-center gap-2 text-sm text-dark-500 dark:text-dark-400">
                <Phone className="w-4 h-4" /> {worker.phone}
              </div>
              <div className="flex items-center gap-2 text-sm text-dark-500 dark:text-dark-400">
                <Truck className="w-4 h-4" /> {worker.deliveryPlatform}
              </div>
              <div className="flex items-center gap-2 text-sm text-dark-500 dark:text-dark-400">
                <Star className="w-4 h-4 text-warning-400" /> {worker.avgRating} rating
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Weekly Earnings', value: formatCurrency(worker.weeklyEarnings), icon: '💰' },
          { label: 'Total Earnings', value: formatCurrency(worker.totalEarnings), icon: '📈' },
          { label: 'Total Deliveries', value: worker.totalDeliveries.toLocaleString(), icon: '🛵' },
          { label: 'Active Since', value: formatDate(worker.joinedDate), icon: '📅' },
        ].map((stat, i) => (
          <div key={i} className="glass-card rounded-2xl p-4">
            <span className="text-xl">{stat.icon}</span>
            <p className="text-lg font-bold text-dark-800 dark:text-dark-200 mt-2">{stat.value}</p>
            <p className="text-xs text-dark-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Earnings History */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-base font-semibold text-dark-800 dark:text-dark-200 mb-4">Monthly Earnings History</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={worker.earningsHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="earnings" fill="url(#earnGrad)" radius={[6, 6, 0, 0]} name="Earnings" />
              <defs>
                <linearGradient id="earnGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Breakdown Radar */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-base font-semibold text-dark-800 dark:text-dark-200 mb-4">Risk Score Breakdown</h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={riskData}>
              <PolarGrid stroke="rgba(148,163,184,0.2)" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Radar name="Risk" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Claims History */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-dark-100 dark:border-dark-700">
          <h3 className="text-base font-semibold text-dark-800 dark:text-dark-200">Claims History</h3>
        </div>
        {worker.claimsHistory.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-100 dark:border-dark-700">
                <th className="text-left text-xs font-semibold text-dark-400 uppercase tracking-wider px-5 py-3">Claim ID</th>
                <th className="text-left text-xs font-semibold text-dark-400 uppercase tracking-wider px-5 py-3">Date</th>
                <th className="text-left text-xs font-semibold text-dark-400 uppercase tracking-wider px-5 py-3">Trigger</th>
                <th className="text-left text-xs font-semibold text-dark-400 uppercase tracking-wider px-5 py-3">Amount</th>
                <th className="text-left text-xs font-semibold text-dark-400 uppercase tracking-wider px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-50 dark:divide-dark-800">
              {worker.claimsHistory.map((claim) => (
                <tr key={claim.id} className="table-row">
                  <td className="px-5 py-3 text-sm font-mono text-dark-600 dark:text-dark-400">{claim.id}</td>
                  <td className="px-5 py-3 text-sm text-dark-600 dark:text-dark-400">{formatDate(claim.date)}</td>
                  <td className="px-5 py-3 text-sm text-dark-600 dark:text-dark-400">
                    {getTriggerIcon(claim.trigger)} {claim.trigger}
                  </td>
                  <td className="px-5 py-3 text-sm font-semibold text-dark-800 dark:text-dark-200">{formatCurrency(claim.amount)}</td>
                  <td className="px-5 py-3">
                    <span className={`badge ${getStatusColor(claim.status)}`}>{claim.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-sm text-dark-400">No claims history found</div>
        )}
      </div>
    </div>
  );
}
