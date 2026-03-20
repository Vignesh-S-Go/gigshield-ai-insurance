import { useState } from 'react';
import { Wallet, CheckCircle, Loader2, ArrowRight, IndianRupee, Shield } from 'lucide-react';
import Header from '../components/Header';
import useStore from '../store/useStore';
import { formatCurrency } from '../utils/helpers';

export default function PayoutsPage() {
  const { payoutStatus, triggerPayout, claims } = useStore();
  const [selectedAmount, setSelectedAmount] = useState(15000);

  const paidClaims = claims.filter(c => c.status === 'Paid');
  const totalPaid = paidClaims.reduce((s, c) => s + c.payoutAmount, 0);
  const pendingClaims = claims.filter(c => c.status === 'Approved');
  const pendingAmount = pendingClaims.reduce((s, c) => s + c.payoutAmount, 0);

  return (
    <div className="animate-fade-in">
      <Header title="Payout Simulation" subtitle="Process and simulate insurance payouts" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Paid Out', value: formatCurrency(totalPaid), sub: `${paidClaims.length} claims`, icon: CheckCircle, color: 'success' },
          { label: 'Pending Payouts', value: formatCurrency(pendingAmount), sub: `${pendingClaims.length} claims`, icon: Wallet, color: 'warning' },
          { label: 'Avg. Payout', value: formatCurrency(paidClaims.length > 0 ? Math.round(totalPaid / paidClaims.length) : 0), sub: 'Per claim', icon: IndianRupee, color: 'primary' },
        ].map((s, i) => (
          <div key={i} className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-xl bg-${s.color}-50 dark:bg-${s.color}-500/15`}>
                <s.icon className={`w-5 h-5 text-${s.color}-600 dark:text-${s.color}-400`} />
              </div>
              <p className="text-sm text-dark-400">{s.label}</p>
            </div>
            <p className="text-2xl font-bold text-dark-800 dark:text-dark-200">{s.value}</p>
            <p className="text-xs text-dark-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="max-w-lg mx-auto">
        <div className="glass-card rounded-3xl overflow-hidden">
          <div className="bg-gradient-to-br from-primary-600 via-primary-500 to-indigo-600 p-6 text-white">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-semibold">GigShield Quick Payout</span>
            </div>
            <p className="text-xs text-primary-200 mb-2">Simulation Amount</p>
            <p className="text-4xl font-bold">{formatCurrency(selectedAmount)}</p>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <label className="text-xs font-medium text-dark-400 uppercase tracking-wider mb-3 block">Select Amount</label>
              <div className="grid grid-cols-3 gap-2">
                {[5000, 10000, 15000, 25000, 50000, 100000].map(a => (
                  <button key={a} onClick={() => setSelectedAmount(a)}
                    className={`p-3 rounded-xl text-sm font-semibold transition-all ${selectedAmount === a ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25' : 'bg-dark-50 dark:bg-dark-700 text-dark-600 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-600'}`}>
                    {formatCurrency(a)}
                  </button>
                ))}
              </div>
            </div>

            {payoutStatus === null && (
              <button onClick={triggerPayout}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-primary-500/25">
                Trigger Payout <ArrowRight className="w-5 h-5" />
              </button>
            )}

            {payoutStatus === 'processing' && (
              <div className="flex flex-col items-center py-8 animate-fade-in">
                <Loader2 className="w-16 h-16 text-primary-500 animate-spin" />
                <p className="text-sm font-semibold text-dark-600 dark:text-dark-300 mt-4">Processing Payout...</p>
              </div>
            )}

            {payoutStatus === 'success' && (
              <div className="flex flex-col items-center py-6 animate-scale-in">
                <div className="w-20 h-20 rounded-full bg-success-50 dark:bg-success-600/15 flex items-center justify-center mb-4">
                  <CheckCircle className="w-10 h-10 text-success-500" />
                </div>
                <h3 className="text-xl font-bold text-dark-800 dark:text-dark-200">Payout Successful!</h3>
                <p className="text-3xl font-bold text-success-500 mt-2">{formatCurrency(selectedAmount)}</p>
                <div className="mt-4 p-4 rounded-xl bg-dark-50 dark:bg-dark-700/50 w-full space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-dark-400">Txn ID</span>
                    <span className="font-mono text-dark-600 dark:text-dark-300">TXN{Date.now().toString().slice(-8)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-dark-400">Status</span>
                    <span className="text-success-500 font-semibold">✓ Settled via UPI</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
