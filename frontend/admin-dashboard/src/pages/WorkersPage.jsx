import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Download, Eye, ChevronDown } from 'lucide-react';
import Header from '../components/Header';
import useStore from '../store/useStore';
import { formatCurrency, getStatusColor, getPlanColor, getRiskColor, exportToCSV } from '../utils/helpers';

export default function WorkersPage() {
  const { workers } = useStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('All');
  const [planFilter, setPlanFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  const cities = ['All', ...new Set(workers.map(w => w.city))];
  const plans = ['All', 'Basic', 'Standard', 'Pro'];

  const filtered = workers
    .filter(w => {
      const matchSearch = w.name.toLowerCase().includes(search.toLowerCase()) || w.id.toLowerCase().includes(search.toLowerCase());
      const matchCity = cityFilter === 'All' || w.city === cityFilter;
      const matchPlan = planFilter === 'All' || w.plan === planFilter;
      return matchSearch && matchCity && matchPlan;
    })
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortBy === 'name') return a.name.localeCompare(b.name) * dir;
      if (sortBy === 'earnings') return (a.weeklyEarnings - b.weeklyEarnings) * dir;
      if (sortBy === 'risk') return (a.riskScore - b.riskScore) * dir;
      return 0;
    });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
  };

  const handleExport = () => {
    const data = filtered.map(w => ({
      ID: w.id, Name: w.name, City: w.city, Plan: w.plan,
      WeeklyEarnings: w.weeklyEarnings, RiskScore: w.riskScore,
      Status: w.status, Platform: w.deliveryPlatform,
    }));
    exportToCSV(data, 'workers_report');
  };

  return (
    <div className="animate-fade-in">
      <Header title="Worker Management" subtitle={`${workers.length} registered workers`} />

      {/* Filters */}
      <div className="glass-card rounded-2xl p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10 py-2.5 text-sm"
            />
          </div>

          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none" />
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="input-field pl-10 pr-10 py-2.5 text-sm appearance-none cursor-pointer"
            >
              {cities.map(c => <option key={c} value={c}>{c === 'All' ? 'All Cities' : c}</option>)}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="input-field pr-10 py-2.5 text-sm appearance-none cursor-pointer"
            >
              {plans.map(p => <option key={p} value={p}>{p === 'All' ? 'All Plans' : p}</option>)}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none" />
          </div>

          <button onClick={handleExport} className="btn-secondary py-2.5">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-100 dark:border-dark-700">
                {[
                  { label: 'Worker', field: 'name' },
                  { label: 'City', field: null },
                  { label: 'Platform', field: null },
                  { label: 'Weekly Earnings', field: 'earnings' },
                  { label: 'Plan', field: null },
                  { label: 'Risk Score', field: 'risk' },
                  { label: 'Status', field: null },
                  { label: '', field: null },
                ].map(({ label, field }, i) => (
                  <th
                    key={i}
                    onClick={() => field && handleSort(field)}
                    className={`text-left text-xs font-semibold text-dark-400 dark:text-dark-500 uppercase tracking-wider px-5 py-3.5 ${field ? 'cursor-pointer hover:text-dark-600 dark:hover:text-dark-300 select-none' : ''}`}
                  >
                    <span className="flex items-center gap-1">
                      {label}
                      {field && sortBy === field && (
                        <span className="text-primary-500">{sortDir === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-50 dark:divide-dark-800">
              {filtered.slice(0, 20).map((worker) => {
                const risk = getRiskColor(worker.riskScore);
                return (
                  <tr key={worker.id} className="table-row">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {worker.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-dark-800 dark:text-dark-200">{worker.name}</p>
                          <p className="text-xs text-dark-400">{worker.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-dark-600 dark:text-dark-400">{worker.city}</td>
                    <td className="px-5 py-4 text-sm text-dark-600 dark:text-dark-400">{worker.deliveryPlatform}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-dark-800 dark:text-dark-200">{formatCurrency(worker.weeklyEarnings)}</td>
                    <td className="px-5 py-4">
                      <span className={`badge ${getPlanColor(worker.plan)}`}>{worker.plan}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`badge ${risk.bg} ${risk.text} ${risk.dark}`}>
                        {(worker.riskScore * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`badge ${getStatusColor(worker.status)}`}>
                        {worker.status === 'active' ? '● Active' : '○ Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => navigate(`/workers/${worker.id}`)}
                        className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors text-dark-400 hover:text-primary-500"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-dark-100 dark:border-dark-700 text-sm text-dark-400">
          Showing {Math.min(20, filtered.length)} of {filtered.length} workers
        </div>
      </div>
    </div>
  );
}
