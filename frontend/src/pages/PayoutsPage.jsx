import { useState, useEffect, useMemo } from 'react';
import { Wallet, CheckCircle, Loader2, ArrowRight, Shield, AlertTriangle, RefreshCw, Eye, Ban, Zap, TrendingUp, Sparkles, X, Search } from 'lucide-react';
import Header from '../components/Header';
import RiskMeter from '../components/RiskMeter';
import AiInsightPanel from '../components/AiInsightPanel';
import useStore from '../store/useStore';
import api from '../services/api';
import { formatCurrency } from '../utils/helpers';

const AnimatedNumber = ({ value, duration = 1000 }) => {
  const [display, setDisplay] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const end = parseInt(value);
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplay(end);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{formatCurrency(display)}</span>;
};

const FraudBadge = ({ level }) => {
  const config = {
    low: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', label: 'LOW', glow: 'shadow-emerald-500/20' },
    medium: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', label: 'MEDIUM', glow: 'shadow-amber-500/20' },
    high: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', label: 'HIGH', glow: 'shadow-red-500/20' },
  };
  const c = config[level] || config.low;
  
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${c.bg} border ${c.border} ${c.glow} shadow-lg`}>
      <div className={`w-2 h-2 rounded-full ${level === 'low' ? 'bg-emerald-400' : level === 'medium' ? 'bg-amber-400 animate-pulse' : 'bg-red-400 animate-pulse'}`} />
      <span className={`text-xs font-black uppercase tracking-widest ${c.text}`}>Fraud Risk: {c.label}</span>
    </div>
  );
};

export default function PayoutsPage() {
  const { claims, workers, payoutStatus, triggerPayout } = useStore();
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [selectedAmount, setSelectedAmount] = useState(15000);
  const [isCalculating, setIsCalculating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [smartPayoutData, setSmartPayoutData] = useState(null);
  const [payoutQueue, setPayoutQueue] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  const paidClaims = claims.filter(c => c.status === 'Paid');
  const totalPaid = paidClaims.reduce((s, c) => s + c.payoutAmount, 0);
  const pendingClaims = claims.filter(c => c.status === 'Approved' || c.status === 'Pending');
  const pendingAmount = pendingClaims.reduce((s, c) => s + c.payoutAmount, 0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [queueRes] = await Promise.all([
        api.getPayoutQueue().catch(() => ({ data: { data: [] } }))
      ]);
      setPayoutQueue(queueRes.data?.data || []);
    } catch (error) {
      console.error('[PAYOUT] Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedWorker || selectedClaim) {
      loadSmartPayoutData();
    }
  }, [selectedWorker, selectedClaim, selectedAmount]);

  const loadSmartPayoutData = async () => {
    setIsCalculating(true);
    try {
      const workerId = selectedWorker?.id || workers?.[0]?.id;
      const claimId = selectedClaim?.id;
      
      const res = await api.getSmartPayoutData({ worker_id: workerId, claim_id: claimId });
      if (res.success && res.data) {
        setSmartPayoutData(res.data);
      }
    } catch (error) {
      console.error('[PAYOUT] Error loading smart payout data:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleAction = async (action) => {
    if (!smartPayoutData?.claim_id || !smartPayoutData?.worker_id) {
      console.warn('[PAYOUT] Missing claim or worker ID');
      return;
    }

    setActionLoading(true);
    try {
      switch (action) {
        case 'approve':
          await api.processSmartPayout({
            claim_id: smartPayoutData.claim_id,
            worker_id: smartPayoutData.worker_id,
            amount: smartPayoutData.calculated_amount,
            ai_decision: smartPayoutData.ai_decision
          });
          triggerPayout();
          break;
        case 'reject':
          await api.rejectPayout({
            claim_id: smartPayoutData.claim_id,
            reason: 'Rejected via Smart Payout Engine'
          });
          break;
        case 'review':
          await api.markPayoutForReview({
            claim_id: smartPayoutData.claim_id,
            notes: 'Marked for manual review'
          });
          break;
      }
      await loadData();
    } catch (error) {
      console.error('[PAYOUT] Action error:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const riskScore = smartPayoutData?.risk_score || 50;
  const fraudLevel = smartPayoutData?.fraud_risk_level || 'low';
  const calculatedPayout = smartPayoutData?.calculated_amount || 0;
  const approvalChance = smartPayoutData?.approval_chance || 50;
  const claimSeverity = smartPayoutData?.claim_severity || 'Moderate';
  const aiStatus = smartPayoutData?.ai_decision?.status || 'approved';

  const approvalRate = useMemo(() => {
    if (paidClaims.length === 0) return 75;
    return Math.round((paidClaims.length / claims.length) * 100) || 75;
  }, [paidClaims, claims]);

  return (
    <div className="animate-fade-in">
      <Header title="Smart Payout Engine" subtitle="AI-powered intelligent payout decision system" />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Paid Out', value: totalPaid, sub: `${paidClaims.length} claims`, icon: CheckCircle, color: 'emerald', gradient: 'from-emerald-500/20 to-teal-500/20' },
          { label: 'Pending Payouts', value: pendingAmount, sub: `${pendingClaims.length} claims`, icon: Wallet, color: 'amber', gradient: 'from-amber-500/20 to-orange-500/20' },
          { label: 'Approval Rate', value: approvalRate, sub: 'Historical %', icon: TrendingUp, color: 'violet', gradient: 'from-violet-500/20 to-purple-500/20', isPercent: true },
          { label: 'Risk Score', value: riskScore, sub: 'Current worker', icon: AlertTriangle, color: riskScore >= 70 ? 'red' : riskScore >= 40 ? 'amber' : 'emerald', gradient: riskScore >= 70 ? 'from-red-500/20 to-orange-500/20' : riskScore >= 40 ? 'from-amber-500/20 to-orange-500/20' : 'from-emerald-500/20 to-teal-500/20', isScore: true },
        ].map((s, i) => (
          <div key={i} className={`rounded-2xl p-5 bg-gradient-to-br ${s.gradient} backdrop-blur-xl border border-white/5 hover:border-white/10 transition-all hover:scale-[1.02] cursor-pointer group`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-xl ${s.color === 'emerald' ? 'bg-emerald-500/15' : s.color === 'amber' ? 'bg-amber-500/15' : s.color === 'red' ? 'bg-red-500/15' : 'bg-violet-500/15'}`}>
                <s.icon className={`w-5 h-5 ${s.color === 'emerald' ? 'text-emerald-400' : s.color === 'amber' ? 'text-amber-400' : s.color === 'red' ? 'text-red-400' : 'text-violet-400'}`} />
              </div>
              <p className="text-sm text-slate-400">{s.label}</p>
            </div>
            <p className="text-2xl font-black text-white">
              {s.isPercent ? `${s.value}%` : s.isScore ? s.value : formatCurrency(s.value)}
            </p>
            <p className="text-xs text-slate-500 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl bg-gradient-to-br from-slate-800/80 via-slate-900/80 to-slate-800/80 backdrop-blur-2xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-violet-500/10 animate-pulse" />
              <div className="relative p-6 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/30">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-violet-400" />
                        Smart Payout Calculator
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">Dynamic payout based on risk analysis</p>
                    </div>
                  </div>
                  <FraudBadge level={fraudLevel} />
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">Select Worker</label>
                  <select
                    value={selectedWorker?.id || ''}
                    onChange={(e) => {
                      const worker = workers.find(w => w.id === e.target.value);
                      setSelectedWorker(worker);
                    }}
                    className="w-full p-3 rounded-xl bg-slate-700/50 border border-slate-600/30 text-slate-200 text-sm focus:outline-none focus:border-violet-500/50"
                  >
                    <option value="">Select Worker</option>
                    {workers.map(w => (
                      <option key={w.id} value={w.id}>{w.name} - {w.city}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">Select Claim</label>
                  <select
                    value={selectedClaim?.id || ''}
                    onChange={(e) => {
                      const claim = claims.find(c => c.id === e.target.value);
                      setSelectedClaim(claim);
                      if (claim?.payoutAmount) setSelectedAmount(claim.payoutAmount);
                    }}
                    className="w-full p-3 rounded-xl bg-slate-700/50 border border-slate-600/30 text-slate-200 text-sm focus:outline-none focus:border-violet-500/50"
                  >
                    <option value="">Select Claim</option>
                    {claims.map(c => (
                      <option key={c.id} value={c.id}>{c.id} - {c.triggerType} (₹{c.payoutAmount})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">Select Amount</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[5000, 10000, 15000, 25000, 50000, 100000].map(a => (
                      <button
                        key={a}
                        onClick={() => setSelectedAmount(a)}
                        className={`p-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                          selectedAmount === a
                            ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30 scale-105'
                            : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border border-slate-600/30'
                        }`}
                      >
                        {formatCurrency(a)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/30">
                  {loading ? (
                    <Loader2 className="w-10 h-10 text-violet-400 animate-spin" />
                  ) : (
                    <RiskMeter score={riskScore} size="md" />
                  )}
                </div>
              </div>

              <div className="rounded-2xl bg-gradient-to-r from-slate-800/80 to-slate-900/80 border border-slate-700/30 p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-slate-400">Calculated Payout</span>
                  <div className="flex items-center gap-2">
                    {isCalculating ? (
                      <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 text-slate-500" />
                    )}
                    <span className="text-xs text-slate-500">AI Calculated</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-4xl font-black tabular-nums ${isCalculating ? 'text-slate-500' : 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400'}`}>
                    {isCalculating ? '---' : formatCurrency(calculatedPayout)}
                  </span>
                  {!isCalculating && (
                    <span className="text-sm text-slate-500">
                      ({calculatedPayout > 0 && selectedAmount > 0 ? (calculatedPayout / selectedAmount * 100).toFixed(0) : 0}% of selected)
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                  <span className="px-2 py-1 rounded bg-slate-700/50">{claimSeverity} Severity</span>
                  <span>×</span>
                  <span className="px-2 py-1 rounded bg-slate-700/50">{approvalChance}% Approval</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleAction('approve')}
                  disabled={actionLoading || !smartPayoutData?.claim_id}
                  className="group relative p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white font-bold overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
                  <div className="relative flex flex-col items-center gap-2">
                    <CheckCircle className="w-6 h-6" />
                    <span className="text-xs uppercase tracking-wider">Approve Payout</span>
                  </div>
                </button>

                <button
                  onClick={() => handleAction('reject')}
                  disabled={actionLoading || !smartPayoutData?.claim_id}
                  className="group relative p-4 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 text-white font-bold overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
                  <div className="relative flex flex-col items-center gap-2">
                    <Ban className="w-6 h-6" />
                    <span className="text-xs uppercase tracking-wider">Reject Claim</span>
                  </div>
                </button>

                <button
                  onClick={() => handleAction('review')}
                  disabled={actionLoading || !smartPayoutData?.claim_id}
                  className="group relative p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white font-bold overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
                  <div className="relative flex flex-col items-center gap-2">
                    <Eye className="w-6 h-6" />
                    <span className="text-xs uppercase tracking-wider">Mark Review</span>
                  </div>
                </button>
              </div>

              {payoutStatus === 'processing' && (
                <div className="flex flex-col items-center py-8 animate-fade-in">
                  <Loader2 className="w-16 h-16 text-violet-500 animate-spin" />
                  <p className="text-sm font-semibold text-slate-300 mt-4">Processing Payout via Blockchain...</p>
                </div>
              )}

              {payoutStatus === 'success' && (
                <div className="flex flex-col items-center py-6 animate-scale-in">
                  <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30">
                    <CheckCircle className="w-10 h-10 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Payout Successful!</h3>
                  <p className="text-3xl font-bold text-emerald-400 mt-2">{formatCurrency(calculatedPayout)}</p>
                  <div className="mt-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/30 w-full space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Txn ID</span>
                      <span className="font-mono text-slate-300">0x{Date.now().toString(16).toUpperCase().slice(-8)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Status</span>
                      <span className="text-emerald-400 font-semibold">✓ Settled via UPI</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Block</span>
                      <span className="font-mono text-slate-300">#{Math.floor(Math.random() * 10000000)}</span>
                    </div>
                  </div>
                </div>
              )}

              {payoutStatus === null && !smartPayoutData?.claim_id && (
                <div className="flex flex-col items-center py-4 text-center">
                  <Search className="w-8 h-8 text-slate-600 mb-2" />
                  <p className="text-sm text-slate-500">Select a worker and claim to calculate payout</p>
                </div>
              )}
            </div>
          </div>

          {smartPayoutData && (
            <AiInsightPanel
              riskScore={smartPayoutData.risk_score}
              claimSeverity={smartPayoutData.claim_severity}
              policyCoverage={smartPayoutData.policy?.plan_type || 'Standard'}
              status={aiStatus}
            />
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-white/10 p-5">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-violet-400" />
              Payout Queue
            </h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {payoutQueue.length > 0 ? payoutQueue.map((payout, i) => (
                <div
                  key={i}
                  onClick={() => {
                    const worker = workers.find(w => w.id === payout.worker_id);
                    const claim = claims.find(c => c.id === payout.claim_id);
                    setSelectedWorker(worker);
                    setSelectedClaim(claim);
                  }}
                  className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                    selectedClaim?.id === payout.claim_id
                      ? 'bg-violet-500/20 border border-violet-500/30'
                      : 'bg-slate-700/30 border border-slate-600/20 hover:bg-slate-700/50 hover:border-slate-500/30'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-slate-400">{payout.worker_name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      payout.fraud_risk_level === 'low' ? 'bg-emerald-500/20 text-emerald-400' :
                      payout.fraud_risk_level === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {payout.fraud_risk_level}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-white">{payout.trigger_type} Claim</p>
                  <p className="text-lg font-black text-violet-400 mt-1">{formatCurrency(payout.calculated_amount || payout.amount)}</p>
                </div>
              )) : (
                <div className="text-center py-8 text-slate-500">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No pending payouts</p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-white/10 p-5">
            <h3 className="font-bold text-white mb-4">Payout Distribution</h3>
            <div className="space-y-3">
              {['Rain', 'Heat', 'Flood', 'AQI', 'Curfew'].map((type, i) => {
                const count = claims.filter(c => c.triggerType === type && c.status === 'Paid').length;
                const totalPaidCount = paidClaims.length;
                const percentage = totalPaidCount > 0 ? (count / totalPaidCount * 100).toFixed(0) : 0;
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">{type}</span>
                      <span className="text-slate-300">{count} ({percentage}%)</span>
                    </div>
                    <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
