import { useState, useEffect } from 'react';
import { Activity, AlertTriangle, Bell, CheckCircle, Clock, DollarSign, Play, RefreshCw, Shield, TrendingUp, Users, XCircle, Zap } from 'lucide-react';
import Header from '../components/Header';
import Modal from '../components/Modal';
import api from '../services/api';

export default function ParametricEnginePage() {
  const [claims, setClaims] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [runningCheck, setRunningCheck] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [simulateForm, setSimulateForm] = useState({ city: 'Delhi', triggerType: 'AQI_HIGH', value: '' });
  const [simulateResult, setSimulateResult] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const fetchClaims = async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await api.fetchParametricClaims({ page: pageNum, limit });
      setClaims(res.data || []);
      setTotal(res.total || 0);
      setPage(pageNum);
    } catch (err) {
      console.error('Failed to fetch claims:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await api.getAdminAnalytics();
      setAnalytics(res);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    }
  };

  const fetchLiveData = async () => {
    try {
      const res = await api.getLiveData();
      setLiveData(res);
    } catch (err) {
      console.error('Failed to fetch live data:', err);
    }
  };

  useEffect(() => {
    fetchClaims();
    fetchAnalytics();
    fetchLiveData();
    const interval = setInterval(fetchLiveData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRunCheck = async (city) => {
    setRunningCheck(true);
    try {
      await api.runParametricClaimCheck(city);
      await fetchClaims();
      await fetchAnalytics();
      await fetchLiveData();
    } catch (err) {
      console.error('Failed to run check:', err);
    } finally {
      setRunningCheck(false);
    }
  };

  const handleSimulateTrigger = async (e) => {
    e.preventDefault();
    setSimulateResult(null);
    try {
      const res = await api.simulateTrigger(simulateForm.city, simulateForm.triggerType, parseFloat(simulateForm.value));
      if (res.success) {
        setSimulateResult(res);
        await fetchClaims();
        await fetchAnalytics();
        await fetchLiveData();
      } else {
        setSimulateResult({ error: res.error });
      }
    } catch (err) {
      setSimulateResult({ error: 'Failed to simulate trigger' });
    }
  };

  const cities = ['Delhi', 'Mumbai', 'Chennai', 'Bangalore', 'Hyderabad'];
  const triggerTypes = [
    { value: 'AQI_HIGH', label: 'AQI High', threshold: 300 },
    { value: 'HEAVY_RAIN', label: 'Heavy Rain', threshold: 150 },
    { value: 'FLOOD_ALERT', label: 'Flood Alert', threshold: 8 },
    { value: 'HEAT_WAVE', label: 'Heat Wave', threshold: 42 }
  ];

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString();
  };

  const getStatusBadge = (status) => {
    if (status === 'Paid') {
      return <span className="badge bg-success-50 text-success-700 dark:bg-success-600/20 dark:text-success-300">Paid</span>;
    }
    if (status === 'Approved') {
      return <span className="badge bg-primary-50 text-primary-700 dark:bg-primary-600/20 dark:text-primary-300">Approved</span>;
    }
    if (status === 'Rejected') {
      return <span className="badge bg-danger-50 text-danger-700 dark:bg-danger-600/20 dark:text-danger-300">Rejected</span>;
    }
    return <span className="badge bg-warning-50 text-warning-700 dark:bg-warning-600/20 dark:text-warning-300">{status}</span>;
  };

  const getSeverityBadge = (severity) => {
    if (severity === 'SEVERE') {
      return <span className="badge bg-danger-50 text-danger-700">SEVERE</span>;
    }
    if (severity === 'MEDIUM') {
      return <span className="badge bg-warning-50 text-warning-700">MEDIUM</span>;
    }
    if (severity === 'MILD') {
      return <span className="badge bg-primary-50 text-primary-700">MILD</span>;
    }
    return null;
  };

  return (
    <div className="animate-fade-in">
      <Header title="Parametric Insurance Engine" subtitle="Automated claims processing system" />

      {/* Trigger Controls */}
      <div className="glass-card rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary-100 dark:bg-primary-500/20">
              <Activity className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h3 className="font-bold text-dark-800 dark:text-dark-200">Trigger Controls</h3>
              <p className="text-sm text-dark-500">Force trigger detection or simulate custom events</p>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setShowSimulateModal(true)}
              className="btn-secondary flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Simulate Trigger
            </button>
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => handleRunCheck(city)}
                disabled={runningCheck}
                className="btn-primary flex items-center gap-2"
              >
                {runningCheck ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Run for {city}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live Data Section */}
      {liveData && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-success-100 dark:bg-success-500/20">
                <DollarSign className="w-4 h-4 text-success-600 dark:text-success-400" />
              </div>
              <span className="text-xs text-dark-500 uppercase">Payouts Today</span>
            </div>
            <p className="text-2xl font-bold text-dark-800 dark:text-dark-200">₹{liveData.totalPayoutsToday?.toLocaleString() || 0}</p>
          </div>

          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-500/20">
                <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <span className="text-xs text-dark-500 uppercase">Active Workers Today</span>
            </div>
            <p className="text-2xl font-bold text-dark-800 dark:text-dark-200">{liveData.activeUsersToday || 0}</p>
          </div>

          <div className="glass-card rounded-2xl p-4 col-span-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-warning-100 dark:bg-warning-500/20">
                <Bell className="w-4 h-4 text-warning-600 dark:text-warning-400" />
              </div>
              <span className="text-xs text-dark-500 uppercase">Recent Triggers</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {liveData.lastTriggers?.slice(0, 3).map((t, i) => (
                <span key={i} className="badge bg-warning-50 text-warning-700 dark:bg-warning-500/20 dark:text-warning-300">
                  {t.trigger_type}: {t.value}
                </span>
              )) || <span className="text-sm text-dark-500">No recent triggers</span>}
            </div>
          </div>
        </div>
      )}

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-6">
          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-500/20">
                <Shield className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              </div>
              <span className="text-xs text-dark-500 uppercase">Total Workers</span>
            </div>
            <p className="text-2xl font-bold text-dark-800 dark:text-dark-200">{analytics.totalWorkers}</p>
          </div>

          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-500/20">
                <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <span className="text-xs text-dark-500 uppercase">Total Policies</span>
            </div>
            <p className="text-2xl font-bold text-dark-800 dark:text-dark-200">{analytics.totalPolicies}</p>
          </div>

          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-success-100 dark:bg-success-500/20">
                <CheckCircle className="w-4 h-4 text-success-600 dark:text-success-400" />
              </div>
              <span className="text-xs text-dark-500 uppercase">Active Policies</span>
            </div>
            <p className="text-2xl font-bold text-dark-800 dark:text-dark-200">{analytics.activePolicies}</p>
          </div>

          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-warning-100 dark:bg-warning-500/20">
                <Clock className="w-4 h-4 text-warning-600 dark:text-warning-400" />
              </div>
              <span className="text-xs text-dark-500 uppercase">Total Claims</span>
            </div>
            <p className="text-2xl font-bold text-dark-800 dark:text-dark-200">{analytics.totalClaims}</p>
          </div>

          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-500/20">
                <DollarSign className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              </div>
              <span className="text-xs text-dark-500 uppercase">Total Payout</span>
            </div>
            <p className="text-2xl font-bold text-dark-800 dark:text-dark-200">₹{analytics.totalPayout?.toLocaleString()}</p>
          </div>

          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-success-100 dark:bg-success-500/20">
                <TrendingUp className="w-4 h-4 text-success-600 dark:text-success-400" />
              </div>
              <span className="text-xs text-dark-500 uppercase">Premium Collected</span>
            </div>
            <p className="text-2xl font-bold text-dark-800 dark:text-dark-200">₹{analytics.totalPremiumCollected?.toLocaleString()}</p>
          </div>

          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${analytics.lossRatio > 0.7 ? 'bg-danger-100 dark:bg-danger-500/20' : 'bg-warning-100 dark:bg-warning-500/20'}`}>
                <AlertTriangle className={`w-4 h-4 ${analytics.lossRatio > 0.7 ? 'text-danger-600 dark:text-danger-400' : 'text-warning-600 dark:text-warning-400'}`} />
              </div>
              <span className="text-xs text-dark-500 uppercase">Loss Ratio</span>
            </div>
            <p className="text-2xl font-bold text-dark-800 dark:text-dark-200">{(analytics.lossRatio * 100).toFixed(2)}%</p>
          </div>
        </div>
      )}

      {/* Claims Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-dark-100 dark:border-dark-700 flex items-center justify-between">
          <h3 className="font-bold text-dark-800 dark:text-dark-200">Processed Claims</h3>
          <button onClick={() => { fetchClaims(page); fetchLiveData(); }} className="btn-secondary py-2 px-4 flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary-500" />
            <p className="mt-2 text-dark-500">Loading claims...</p>
          </div>
        ) : claims.length === 0 ? (
          <div className="p-8 text-center">
            <Shield className="w-12 h-12 mx-auto text-dark-300 mb-3" />
            <p className="text-dark-500">No claims processed yet. Run a trigger check to start.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-100 dark:border-dark-700">
                    {['Claim ID', 'Worker ID', 'Trigger', 'Value', 'Severity', 'Payout', 'Fraud', 'Status', 'Date', ''].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-dark-400 uppercase tracking-wider px-5 py-3.5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-50 dark:divide-dark-800">
                  {claims.map((claim) => (
                    <tr key={claim.id} className="table-row">
                      <td className="px-5 py-3 text-sm font-mono text-dark-500">{claim.id}</td>
                      <td className="px-5 py-3 text-sm text-dark-500">{claim.worker_id}</td>
                      <td className="px-5 py-3 text-sm font-medium text-dark-800 dark:text-dark-200">{claim.trigger_type}</td>
                      <td className="px-5 py-3 text-sm text-dark-500">{claim.trigger_value || 'N/A'}</td>
                      <td className="px-5 py-3">{getSeverityBadge(claim.severity)}</td>
                      <td className="px-5 py-3 text-sm font-semibold text-dark-800 dark:text-dark-200">₹{claim.payout_amount}</td>
                      <td className="px-5 py-3 text-sm text-dark-500">{claim.fraud_score ?? 'N/A'}</td>
                      <td className="px-5 py-3">{getStatusBadge(claim.status)}</td>
                      <td className="px-5 py-3 text-sm text-dark-500">{formatDate(claim.created_at)}</td>
                      <td className="px-5 py-3">
                        <button onClick={() => setSelectedClaim(claim)} className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors text-dark-400 hover:text-primary-500">
                          <Activity className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-dark-100 dark:border-dark-700 flex items-center justify-between">
              <p className="text-sm text-dark-500">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} claims
              </p>
              <div className="flex gap-2">
                <button onClick={() => fetchClaims(page - 1)} disabled={page === 1} className="btn-secondary py-2 px-4 disabled:opacity-50">Previous</button>
                <button onClick={() => fetchClaims(page + 1)} disabled={page * limit >= total} className="btn-secondary py-2 px-4 disabled:opacity-50">Next</button>
              </div>
            </div>
          </>
        )}
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
                <p className="text-xs text-dark-400 uppercase tracking-wider mb-1">Worker ID</p>
                <p className="text-sm font-mono font-semibold text-dark-800 dark:text-dark-200">{selectedClaim.worker_id}</p>
              </div>
              <div className="p-4 rounded-xl bg-dark-50 dark:bg-dark-700/50">
                <p className="text-xs text-dark-400 uppercase tracking-wider mb-1">Status</p>
                <div className="mt-1">{getStatusBadge(selectedClaim.status)}</div>
              </div>
              <div className="p-4 rounded-xl bg-dark-50 dark:bg-dark-700/50">
                <p className="text-xs text-dark-400 uppercase tracking-wider mb-1">Severity</p>
                <div className="mt-1">{getSeverityBadge(selectedClaim.severity)}</div>
              </div>
              <div className="p-4 rounded-xl bg-dark-50 dark:bg-dark-700/50">
                <p className="text-xs text-dark-400 uppercase tracking-wider mb-1">Trigger Type</p>
                <p className="text-sm font-semibold text-dark-800 dark:text-dark-200">{selectedClaim.trigger_type}</p>
              </div>
              <div className="p-4 rounded-xl bg-dark-50 dark:bg-dark-700/50">
                <p className="text-xs text-dark-400 uppercase tracking-wider mb-1">Trigger Value</p>
                <p className="text-sm font-semibold text-dark-800 dark:text-dark-200">{selectedClaim.trigger_value || 'N/A'}</p>
              </div>
              <div className="p-4 rounded-xl bg-dark-50 dark:bg-dark-700/50">
                <p className="text-xs text-dark-400 uppercase tracking-wider mb-1">Fraud Score</p>
                <p className="text-sm font-semibold text-dark-800 dark:text-dark-200">{selectedClaim.fraud_score ?? 'N/A'}</p>
              </div>
              <div className="p-4 rounded-xl bg-dark-50 dark:bg-dark-700/50">
                <p className="text-xs text-dark-400 uppercase tracking-wider mb-1">Payout Amount</p>
                <p className="text-sm font-semibold text-dark-800 dark:text-dark-200">₹{selectedClaim.payout_amount}</p>
              </div>
            </div>

            {selectedClaim.ai_meta?.rejection_reason && (
              <div className="p-4 rounded-xl bg-danger-50 dark:bg-danger-500/10 border border-danger-200 dark:border-danger-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-5 h-5 text-danger-600" />
                  <p className="text-sm font-bold text-danger-700 dark:text-danger-300">Rejection Reason</p>
                </div>
                <p className="text-sm text-danger-700 dark:text-danger-400">{selectedClaim.ai_meta.rejection_reason}</p>
              </div>
            )}

            {selectedClaim.ai_meta?.ai_explanation && (
              <div className="p-5 rounded-xl border border-primary-200 dark:border-primary-500/30 bg-primary-50 dark:bg-primary-500/10">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  <p className="text-sm font-bold text-primary-700 dark:text-primary-300">AI Explanation</p>
                </div>
                <p className="text-sm text-primary-800 dark:text-primary-200 leading-relaxed">{selectedClaim.ai_meta.ai_explanation}</p>
              </div>
            )}

            <div className="p-4 rounded-xl bg-dark-50 dark:bg-dark-700/50">
              <p className="text-xs text-dark-400 uppercase tracking-wider mb-1">Created At</p>
              <p className="text-sm font-semibold text-dark-800 dark:text-dark-200">{formatDate(selectedClaim.created_at)}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Simulate Trigger Modal */}
      <Modal isOpen={showSimulateModal} onClose={() => { setShowSimulateModal(false); setSimulateResult(null); }} title="Simulate Trigger Event" size="md">
        <form onSubmit={handleSimulateTrigger} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">City</label>
            <select
              value={simulateForm.city}
              onChange={(e) => setSimulateForm({ ...simulateForm, city: e.target.value })}
              className="w-full input-field"
              required
            >
              {cities.map(city => <option key={city} value={city}>{city}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Trigger Type</label>
            <select
              value={simulateForm.triggerType}
              onChange={(e) => {
                const selected = triggerTypes.find(t => t.value === e.target.value);
                setSimulateForm({ ...simulateForm, triggerType: e.target.value, value: selected?.threshold || '' });
              }}
              className="w-full input-field"
              required
            >
              {triggerTypes.map(t => <option key={t.value} value={t.value}>{t.label} (threshold: {t.threshold})</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Value</label>
            <input
              type="number"
              value={simulateForm.value}
              onChange={(e) => setSimulateForm({ ...simulateForm, value: e.target.value })}
              className="w-full input-field"
              placeholder="Enter trigger value"
              required
              min="1"
            />
          </div>

          <button type="submit" className="w-full btn-primary py-3 flex items-center justify-center gap-2">
            <Zap className="w-4 h-4" />
            Simulate Trigger
          </button>
        </form>

        {simulateResult && (
          <div className={`mt-4 p-4 rounded-xl ${simulateResult.error ? 'bg-danger-50 dark:bg-danger-500/10 border border-danger-200' : 'bg-success-50 dark:bg-success-500/10 border border-success-200'}`}>
            {simulateResult.error ? (
              <p className="text-sm text-danger-700 dark:text-danger-300">{simulateResult.error}</p>
            ) : (
              <div>
                <p className="text-sm font-bold text-success-700 dark:text-success-300 mb-2">Trigger simulated successfully!</p>
                <div className="text-xs text-dark-600 dark:text-dark-400 space-y-1">
                  <p>Trigger: {simulateResult.trigger?.type} in {simulateResult.trigger?.city}</p>
                  <p>Value: {simulateResult.trigger?.value} (threshold: {simulateResult.trigger?.threshold})</p>
                  <p>Processed: {simulateResult.summary?.processed} | Rejected: {simulateResult.summary?.rejected}</p>
                  <p>Total Payout: ₹{simulateResult.summary?.totalPayout}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
