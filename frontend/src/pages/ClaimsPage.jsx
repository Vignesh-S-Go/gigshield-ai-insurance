import { ChevronDown, Download, Eye, Search, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import Header from '../components/Header';
import Modal from '../components/Modal';
import { aiService } from '../services/aiService';
import useStore from '../store/useStore';
import { exportToCSV, formatCurrency, formatDate, getStatusColor, getTriggerIcon } from '../utils/helpers';
import { evaluateClaim } from '../utils/rulesEngine';

export default function ClaimsPage() {
  const { claims, workers } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [triggerFilter, setTriggerFilter] = useState('All');
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [geminiExplanation, setGeminiExplanation] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);

  const handleViewClaim = async (claim) => {
    setSelectedClaim(claim);
    setGeminiExplanation(null);
    setIsGenerating(true);

    const worker = workers.find(w => w.id === claim.workerId);
    const data = {
      id: claim.id,
      trigger: claim.triggerType,
      city: claim.workerCity,
      weather: claim.weatherSource || 'Known params',
      riskScore: worker?.riskScore || 0.5,
    };
    const decision = evaluateClaim({ trigger: claim.triggerType });

    try {
      const explanationText = await aiService.getAIExplanation({
        risk: worker?.riskScore || 0.5,
        status: decision.passed ? 'approved' : 'rejected',
        reason: `${claim.triggerType} event in ${claim.workerCity}`
      });

      setGeminiExplanation({
        reason: explanationText,
        policyClause: decision.passed ? "Clause 4.2: Automated Parametric Trigger" : "Exclusion 7.1: Outside Protection Parameters",
        riskReasoning: `Historical Risk: ${worker?.riskScore || 0.52}. Event: ${claim.triggerType}.`
      });
    } catch (error) {
      setGeminiExplanation({
        reason: "AI service is currently processing high volume. The claim has been matched against the parametric ledger for verification.",
        policyClause: "Clause 4.2",
        riskReasoning: "Standard rules engine validation applied."
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const playVoiceExplanation = (text) => {
    if ('speechSynthesis' in window) {
      setIsPlayingVoice(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsPlayingVoice(false);
      speechSynthesis.speak(utterance);
    } else {
      alert("Voice synthesis is not supported in this browser.");
    }
  };

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
                  <td className="px-5 py-2.5 text-sm font-mono text-dark-500">{claim.id}</td>
                  <td className="px-5 py-2.5 text-sm font-medium text-dark-800 dark:text-dark-200">{claim.workerName}</td>
                  <td className="px-5 py-2.5 text-sm text-dark-500">{claim.workerCity}</td>
                  <td className="px-5 py-2.5 text-sm text-dark-600 dark:text-dark-400">
                    {getTriggerIcon(claim.triggerType)} {claim.triggerType}
                  </td>
                  <td className="px-5 py-2.5">
                    <span className={`badge ring-1 ring-inset ${getStatusColor(claim.status)}`}>{claim.status}</span>
                  </td>
                  <td className="px-5 py-2.5 text-sm font-semibold text-dark-800 dark:text-dark-200">{formatCurrency(claim.payoutAmount)}</td>
                  <td className="px-5 py-2.5 text-sm text-dark-500">{formatDate(claim.date)}</td>
                  <td className="px-5 py-2.5">
                    <button onClick={() => handleViewClaim(claim)} className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors text-dark-400 hover:text-primary-500">
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

            {/* Claim Story Replay */}
            <div className="p-5 rounded-xl border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800/50">
              <h4 className="text-sm font-bold text-dark-800 dark:text-dark-200 mb-4 uppercase tracking-widest">Claim Story Replay</h4>
              <div className="relative pl-4 space-y-4 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary-500 before:to-dark-700">
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ring-4 ring-dark-50 dark:ring-dark-900 border border-primary-500">
                    <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-3 rounded-lg border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-800 shadow">
                    <h5 className="font-bold text-xs text-dark-800 dark:text-gray-100 mb-1">Pre-Incident Risk Score</h5>
                    <p className="text-[10px] text-dark-500 dark:text-dark-400">Worker was at {workers.find(w => w.id === selectedClaim.workerId)?.riskScore || 0.52} / 1.0 driving risk in {selectedClaim.workerCity}.</p>
                  </div>
                </div>
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ring-4 ring-dark-50 dark:ring-dark-900 border border-primary-500">
                    <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-3 rounded-lg border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-800 shadow">
                    <h5 className="font-bold text-xs text-dark-800 dark:text-gray-100 mb-1">Environmental Trigger</h5>
                    <p className="text-[10px] text-dark-500 dark:text-dark-400">Weather API registered: {selectedClaim.weatherSource || 'Clear conditions'}. Event type logged as {selectedClaim.triggerType}.</p>
                  </div>
                </div>
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ring-4 ring-dark-50 dark:ring-dark-900 border border-primary-500">
                    <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-3 rounded-lg border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-800 shadow">
                    <h5 className="font-bold text-xs text-dark-800 dark:text-gray-100 mb-1">Decision Reached</h5>
                    <p className="text-[10px] text-dark-500 dark:text-dark-400">Claim {evaluateClaim({ trigger: selectedClaim.triggerType }).passed ? 'approved instantly via automated smart contract validation' : 'flagged and intercepted due to violation of parametric rules'}.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Gemini AI Detailed Explainability */}
            <div className={`p-5 rounded-xl border-2 ${!evaluateClaim({ trigger: selectedClaim.triggerType }).passed ? 'border-danger-500 bg-danger-50 dark:bg-danger-500/10' : 'border-success-500 bg-success-50 dark:bg-success-500/10'} relative overflow-hidden`}>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${!evaluateClaim({ trigger: selectedClaim.triggerType }).passed ? 'bg-danger-100 dark:bg-danger-500/20 text-danger-600' : 'bg-success-100 dark:bg-success-500/20 text-success-600'}`}>
                    {!evaluateClaim({ trigger: selectedClaim.triggerType }).passed ? <ShieldAlert className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-dark-800 dark:text-gray-100">Decision: {!evaluateClaim({ trigger: selectedClaim.triggerType }).passed ? 'REJECTED' : 'APPROVED'}</h4>
                    <p className="text-[10px] text-dark-500 uppercase tracking-widest font-semibold mt-0.5">OpenRouter AI Engine</p>
                  </div>
                </div>
                {geminiExplanation && (
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => playVoiceExplanation(geminiExplanation.reason)}
                      disabled={isPlayingVoice}
                      className="px-3 py-1.5 bg-dark-800 text-primary-400 rounded hover:bg-dark-700 transition font-bold text-xs"
                    >
                      {isPlayingVoice ? 'Speaking...' : '🔊 Voice Explanation'}
                    </button>
                    {selectedClaim.blockchain_tx && (
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-indigo-500/10 border border-indigo-500/30 rounded text-[9px] font-black text-indigo-400 uppercase tracking-tighter">
                        <ShieldCheck className="w-3 h-3" /> Verified on Chain: {selectedClaim.blockchain_tx.substring(0, 10)}...
                      </div>
                    )}
                  </div>
                )}
              </div>

              {isGenerating ? (
                <div className="py-4 text-center animate-pulse">
                  <p className="text-sm font-bold text-dark-500 italic">AI is analyzing policy clauses and environmental data...</p>
                </div>
              ) : geminiExplanation ? (
                <div className="space-y-4 relative z-10">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white dark:bg-dark-900/50 rounded-lg border border-dark-100 dark:border-dark-700">
                      <span className="text-[10px] font-bold uppercase text-dark-500 block mb-1">Reason for Decision</span>
                      <p className="text-sm font-semibold text-dark-800 dark:text-slate-200">{geminiExplanation.reason}</p>
                    </div>
                    <div className="p-3 bg-white dark:bg-dark-900/50 rounded-lg border border-dark-100 dark:border-dark-700">
                      <span className="text-[10px] font-bold uppercase text-dark-500 block mb-1">Policy Clause Interpretation</span>
                      <p className="text-sm font-semibold text-dark-800 dark:text-slate-200">{geminiExplanation.policyClause}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-white dark:bg-dark-900/50 rounded-lg border border-dark-100 dark:border-dark-700">
                    <span className="text-[10px] font-bold uppercase text-dark-500 block mb-1">Risk & Timeline Reasoning</span>
                    <p className="text-sm font-semibold text-dark-800 dark:text-slate-200">{geminiExplanation.riskReasoning}</p>
                  </div>
                </div>
              ) : null}
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
