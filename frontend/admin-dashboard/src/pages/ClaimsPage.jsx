import { useState } from 'react';
import { Search, Filter, Download, Eye, ChevronDown } from 'lucide-react';
import Header from '../components/Header';
import Modal from '../components/Modal';
import useStore from '../store/useStore';
import { formatCurrency, getStatusColor, formatDate, getTriggerIcon, exportToCSV } from '../utils/helpers';

export default function ClaimsPage() {
  const { claims } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [triggerFilter, setTriggerFilter] = useState('All');
  const [selectedClaim, setSelectedClaim] = useState(null);

  const statuses = ['All', 'Approved', 'Pending', 'Paid', 'Flagged'];
  const triggers = ['All', 'Rain', 'Heat', 'Flood', 'AQI', 'Curfew'];

  const filtered = claims.filter(c => {
    const matchSearch = c.workerName.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchTrigger = triggerFilter === 'All' || c.triggerType === triggerFilter;
    return matchSearch && matchStatus && matchTrigger;
  });

  const statusCounts = {
    Approved: claims.filter(c => c.status === 'Approved').length,
    Pending: claims.filter(c => c.status === 'Pending').length,
    Paid: claims.filter(c => c.status === 'Paid').length,
    Flagged: claims.filter(c => c.status === 'Flagged').length,
  };

  return (
    <div className="animate-fade-in">
      <Header title="Claims Dashboard" subtitle={`${claims.length} total claims processed`} />

      {/* Status Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Object.entries(statusCounts).map(([status, count]) => (
          <div
            key={status}
            onClick={() => setStatusFilter(statusFilter === status ? 'All' : status)}
            className={`glass-card rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.02] ${statusFilter === status ? 'ring-2 ring-primary-500' : ''}`}
          >
            <div className="flex items-center justify-between">
              <span className={`badge ${getStatusColor(status)}`}>{status}</span>
              <p className="text-2xl font-bold text-dark-800 dark:text-dark-200">{count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass-card rounded-2xl p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
            <input type="text" placeholder="Search claims..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10 py-2.5 text-sm" />
          </div>
          <div className="relative">
            <select value={triggerFilter} onChange={(e) => setTriggerFilter(e.target.value)} className="input-field pr-10 py-2.5 text-sm appearance-none cursor-pointer">
              {triggers.map(t => <option key={t} value={t}>{t === 'All' ? 'All Triggers' : `${getTriggerIcon(t)} ${t}`}</option>)}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none" />
          </div>
          <button
            onClick={() => exportToCSV(filtered.map(c => ({ ID: c.id, Worker: c.workerName, Trigger: c.triggerType, Status: c.status, Payout: c.payoutAmount, Date: c.date })), 'claims_report')}
            className="btn-secondary py-2.5"
          >
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
                {['Claim ID', 'Worker', 'City', 'Trigger', 'Status', 'Payout', 'Date', ''].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-dark-400 uppercase tracking-wider px-5 py-3.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-50 dark:divide-dark-800">
              {filtered.slice(0, 20).map(claim => (
                <tr key={claim.id} className="table-row">
                  <td className="px-5 py-4 text-sm font-mono text-dark-500">{claim.id}</td>
                  <td className="px-5 py-4 text-sm font-medium text-dark-800 dark:text-dark-200">{claim.workerName}</td>
                  <td className="px-5 py-4 text-sm text-dark-500">{claim.workerCity}</td>
                  <td className="px-5 py-4 text-sm text-dark-600 dark:text-dark-400">
                    {getTriggerIcon(claim.triggerType)} {claim.triggerType}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`badge ${getStatusColor(claim.status)}`}>{claim.status}</span>
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-dark-800 dark:text-dark-200">{formatCurrency(claim.payoutAmount)}</td>
                  <td className="px-5 py-4 text-sm text-dark-500">{formatDate(claim.date)}</td>
                  <td className="px-5 py-4">
                    <button onClick={() => setSelectedClaim(claim)} className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors text-dark-400 hover:text-primary-500">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-dark-100 dark:border-dark-700 text-sm text-dark-400">
          Showing {Math.min(20, filtered.length)} of {filtered.length} claims
        </div>
      </div>

      {/* Claim Detail Modal */}
      <Modal isOpen={!!selectedClaim} onClose={() => setSelectedClaim(null)} title="Claim Details" size="lg">
        {selectedClaim && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-dark-50 dark:bg-dark-700/50">
                <p className="text-xs text-dark-400 uppercase tracking-wider mb-1">Claim ID</p>
                <p className="text-sm font-mono font-semibold text-dark-800 dark:text-dark-200">{selectedClaim.id}</p>
              </div>
              <div className="p-4 rounded-xl bg-dark-50 dark:bg-dark-700/50">
                <p className="text-xs text-dark-400 uppercase tracking-wider mb-1">Worker</p>
                <p className="text-sm font-semibold text-dark-800 dark:text-dark-200">{selectedClaim.workerName}</p>
              </div>
              <div className="p-4 rounded-xl bg-dark-50 dark:bg-dark-700/50">
                <p className="text-xs text-dark-400 uppercase tracking-wider mb-1">Trigger Type</p>
                <p className="text-sm font-semibold text-dark-800 dark:text-dark-200">{getTriggerIcon(selectedClaim.triggerType)} {selectedClaim.triggerType}</p>
              </div>
              <div className="p-4 rounded-xl bg-dark-50 dark:bg-dark-700/50">
                <p className="text-xs text-dark-400 uppercase tracking-wider mb-1">Payout Amount</p>
                <p className="text-sm font-semibold text-dark-800 dark:text-dark-200">{formatCurrency(selectedClaim.payoutAmount)}</p>
              </div>
            </div>

            {/* Trigger Data */}
            <div>
              <h4 className="text-sm font-semibold text-dark-800 dark:text-dark-200 mb-3">Trigger Data</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(selectedClaim.triggerData).filter(([, v]) => v !== null).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-dark-50 dark:bg-dark-700/50">
                    <span className="text-xs text-dark-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="text-sm font-semibold text-dark-700 dark:text-dark-300">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Validation */}
            <div>
              <h4 className="text-sm font-semibold text-dark-800 dark:text-dark-200 mb-3">Validation Checks</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-lg bg-dark-50 dark:bg-dark-700/50">
                  <span className="text-sm text-dark-500">Validation Status</span>
                  <span className={`badge ${selectedClaim.validationStatus === 'Passed' ? 'bg-success-50 text-success-700 dark:bg-success-600/20 dark:text-success-300' : 'bg-danger-50 text-danger-700 dark:bg-danger-600/20 dark:text-danger-300'}`}>
                    {selectedClaim.validationStatus === 'Passed' ? '✓ Passed' : '✗ Failed'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-dark-50 dark:bg-dark-700/50">
                  <span className="text-sm text-dark-500">GPS Verification</span>
                  <span className={`badge ${selectedClaim.gpsVerified ? 'bg-success-50 text-success-700 dark:bg-success-600/20 dark:text-success-300' : 'bg-danger-50 text-danger-700 dark:bg-danger-600/20 dark:text-danger-300'}`}>
                    {selectedClaim.gpsVerified ? '✓ Verified' : '✗ Unverified'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-dark-50 dark:bg-dark-700/50">
                  <span className="text-sm text-dark-500">Processing Time</span>
                  <span className="text-sm font-medium text-dark-700 dark:text-dark-300">{selectedClaim.processingTime}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-dark-50 dark:bg-dark-700/50">
                  <span className="text-sm text-dark-500">Weather Source</span>
                  <span className="text-sm font-medium text-dark-700 dark:text-dark-300">{selectedClaim.weatherSource}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
