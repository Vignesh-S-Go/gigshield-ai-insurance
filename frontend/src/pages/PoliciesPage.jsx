import { AlertTriangle, ChevronDown, Download, Info, Loader2, Plus, Search, Shield } from 'lucide-react';
import { useState } from 'react';
import Header from '../components/Header';
import Modal from '../components/Modal';
import api from '../services/api';
import useStore from '../store/useStore';
import { exportToCSV, formatCurrency, formatDate, getPlanColor, getStatusColor } from '../utils/helpers';
import { planDetails } from '../utils/mockData';

export default function PoliciesPage() {
  const { policies, workers, addPolicy } = useStore();
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [formData, setFormData] = useState({ workerId: '', plan: 'Basic', city: '' });
  const [premiumCalc, setPremiumCalc] = useState(null);
  const [calculating, setCalculating] = useState(false);

  const filtered = policies.filter(p =>
    p.workerName.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleCalculatePremium = async () => {
    setCalculating(true);
    const result = await api.calculatePremium({
      plan: formData.plan,
      city: formData.city || 'Mumbai',
      riskScore: 0.5,
      weeklyEarnings: 5000,
    });
    setPremiumCalc(result);
    setCalculating(false);
  };

  const handleAddPolicy = () => {
    const newPolicy = {
      id: 'GS-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
      workerId: formData.workerId || 'GS-NEW',
      workerName: 'New Worker',
      planType: formData.plan,
      premium: premiumCalc?.premium || planDetails[formData.plan].premium,
      maxPayout: planDetails[formData.plan].maxPayout,
      status: 'Active',
      startDate: new Date().toISOString(),
      renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      autoRenew: true,
      city: formData.city || 'Mumbai',
    };
    addPolicy(newPolicy);
    setShowAddModal(false);
    setFormData({ workerId: '', plan: 'Basic', city: '' });
    setPremiumCalc(null);
  };

  return (
    <div className="animate-fade-in">
      <Header title="Policy Management" subtitle={`${policies.length} total policies`} />

      {/* Actions */}
      <div className="glass-card rounded-2xl p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
            <input
              type="text"
              placeholder="Search policies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10 py-2.5 text-sm"
            />
          </div>
          <button onClick={() => setShowAddModal(true)} className="btn-primary py-2.5">
            <Plus className="w-4 h-4" /> Add Policy
          </button>
          <button onClick={() => setShowTermsModal(true)} className="btn-secondary py-2.5">
            <Shield className="w-4 h-4" /> Policy Handbook
          </button>
          <button
            onClick={() => exportToCSV(filtered.map(p => ({ ID: p.id, Worker: p.workerName, Plan: p.planType, Premium: p.premium, MaxPayout: p.maxPayout, Status: p.status })), 'policies_report')}
            className="btn-secondary py-2.5"
          >
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-6">
        {['Basic', 'Standard', 'Pro'].map(plan => {
          const count = policies.filter(p => p.planType === plan && p.status === 'Active').length;
          return (
            <div key={plan} className="glass-card rounded-2xl p-3.5 border border-dark-100 dark:border-dark-700/50 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">{plan} Enrolled</p>
                  <p className="text-xl font-black text-dark-800 dark:text-white mt-0.5">{count}</p>
                </div>
                <div className={`px-2 py-1 rounded-lg text-[10px] font-black ring-1 ring-inset ${getPlanColor(plan)} ring-dark-200/50`}>
                  ₹{planDetails[plan].premium}/wk
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-100 dark:border-dark-700">
                {['Policy ID', 'Worker Name', 'Plan Type', 'Premium', 'Max Payout', 'Status', 'Renewal Date'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-dark-400 uppercase tracking-wider px-5 py-3.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-50 dark:divide-dark-800">
              {filtered.slice(0, 20).map(policy => (
                <tr key={policy.id} className="table-row group">
                  <td className="px-5 py-3 text-sm font-mono text-dark-400 group-hover:text-primary-500 transition-colors uppercase">{policy.id}</td>
                  <td className="px-5 py-3 text-sm font-bold text-dark-800 dark:text-slate-200">{policy.workerName}</td>
                  <td className="px-5 py-3">
                    <span className={`badge ring-1 ring-inset ${getPlanColor(policy.planType)}`}>{policy.planType}</span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-dark-800 dark:text-white">₹{policy.premium} <span className="text-[10px] text-dark-400 font-normal">/wk</span></span>
                      <span className="text-[10px] text-primary-500 font-bold uppercase tracking-widest">Risk Adjusted</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-dark-600 dark:text-dark-400">{formatCurrency(policy.maxPayout)}</td>
                  <td className="px-5 py-3">
                    <span className={`badge ring-1 ring-inset ${getStatusColor(policy.status)}`}>{policy.status}</span>
                  </td>
                  <td className="px-5 py-3 text-sm text-dark-500 font-medium">{formatDate(policy.renewalDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-dark-100 dark:border-dark-700 text-sm text-dark-400">
          Showing {Math.min(20, filtered.length)} of {filtered.length} policies
        </div>
      </div>

      {/* Add Policy Modal */}
      <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); setPremiumCalc(null); }} title="Add New Policy" size="md">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider mb-1.5 block">Worker</label>
            <div className="relative">
              <select
                value={formData.workerId}
                onChange={(e) => setFormData({ ...formData, workerId: e.target.value })}
                className="input-field appearance-none pr-10"
              >
                <option value="">Select Worker</option>
                {workers.filter(w => w.status === 'active').slice(0, 20).map(w => (
                  <option key={w.id} value={w.id}>{w.name} — {w.city}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider mb-1.5 block">Plan Type</label>
            <div className="grid grid-cols-3 gap-2">
              {['Basic', 'Standard', 'Pro'].map(plan => (
                <button
                  key={plan}
                  onClick={() => setFormData({ ...formData, plan })}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${formData.plan === plan
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
                    : 'border-dark-200 dark:border-dark-600 hover:border-dark-300'
                    }`}
                >
                  <p className="font-semibold text-sm text-dark-800 dark:text-dark-200">{plan}</p>
                  <p className="text-xs text-dark-400 mt-0.5">₹{planDetails[plan].premium}/wk</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider mb-1.5 block">City</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="e.g. Mumbai"
              className="input-field"
            />
          </div>

          <button
            onClick={handleCalculatePremium}
            disabled={calculating}
            className="btn-secondary w-full justify-center py-3"
          >
            {calculating ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Calculating with AI...</>
            ) : (
              '🧠 Calculate AI Premium'
            )}
          </button>

          {premiumCalc && (
            <div className="p-4 rounded-xl bg-primary-50 dark:bg-primary-500/10 border border-primary-200 dark:border-primary-500/20 animate-fade-in">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-dark-800 dark:text-dark-200">AI-Calculated Premium</p>
                <span className="text-xs text-primary-600 dark:text-primary-400 font-medium">Confidence: {premiumCalc.aiConfidence}</span>
              </div>
              <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{formatCurrency(premiumCalc.premium)}<span className="text-sm font-normal text-dark-400">/week</span></p>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="text-xs text-dark-500">Base: ₹{premiumCalc.breakdown.basePremium}</div>
                <div className="text-xs text-dark-500">City adj: {premiumCalc.breakdown.cityAdjustment}</div>
                <div className="text-xs text-dark-500">Risk adj: {premiumCalc.breakdown.riskAdjustment}</div>
                <div className="text-xs text-dark-500">Earnings adj: {premiumCalc.breakdown.earningsAdjustment}</div>
              </div>
            </div>
          )}

          <button onClick={handleAddPolicy} className="btn-primary w-full justify-center py-3">
            <Plus className="w-4 h-4" /> Create Policy
          </button>
        </div>
      </Modal>

      {/* Terms & Exclusions Modal */}
      <Modal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} title="GigShield Policy Handbook" size="lg">
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-primary-50 dark:bg-primary-500/10 border border-primary-200 dark:border-primary-500/20">
            <div className="flex gap-4">
              <Info className="w-6 h-6 text-primary-600 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-dark-800 dark:text-dark-200">Standard Underwriting Guidelines</h4>
                <p className="text-sm text-dark-500 mt-1 leading-relaxed">
                  GigShield operates on an actuarial model designed for micro-insurance. These guidelines ensure the 'Loss Ratio' remains sustainable while providing maximum coverage for common gig-work risks.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-dark-800 dark:text-dark-200 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning-500" /> Standard Exclusions (Non-Insurable Risks)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Acts of War (EX-WAR-01)', desc: 'Claims resulting from military conflict, invasion, or hostilities, whether war be declared or not.', icon: '⚔️' },
                { title: 'Global Pandemic (EX-PAN-02)', desc: 'Loss of earnings due to government-mandated lockdowns or business interruptions caused by viral pandemics.', icon: '🦠' },
                { title: 'Acts of Terrorism (EX-TER-04)', desc: 'Direct or indirect losses caused by terrorist activities or counter-terrorism operations.', icon: '🚨' },
                { title: 'Civil Disobedience (EX-CIV-03)', desc: 'Disruption of work caused by riots, strikes, or general civil unrest in the urban operating zone.', icon: '📢' },
              ].map((ex, i) => (
                <div key={i} className="p-4 rounded-xl border border-dark-100 dark:border-dark-700 bg-dark-50/50 dark:bg-dark-800/20">
                  <div className="flex items-center gap-2 mb-2">
                    <span>{ex.icon}</span>
                    <span className="text-sm font-bold text-dark-800 dark:text-dark-200">{ex.title}</span>
                  </div>
                  <p className="text-xs text-dark-500 leading-relaxed">{ex.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-dark-50 dark:bg-dark-800/40 border border-dark-100 dark:border-dark-700">
            <h4 className="text-sm font-bold text-dark-800 dark:text-dark-200 mb-2">Notice to Policy Holders</h4>
            <p className="text-xs text-dark-400 leading-relaxed">
              These exclusions are standard across global Lloyd's-style insurance frameworks. GigShield protects against specific weather and algorithmic triggers (Rain, Heat, AQI) which are statistically models. Catastrophic events are excluded to protect the pool's solvency and ensure payouts for legitimate trigger events.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
