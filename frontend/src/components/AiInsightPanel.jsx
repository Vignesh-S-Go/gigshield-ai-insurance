import { useState, useEffect } from 'react';
import { Brain, ChevronDown, ChevronUp, CheckCircle2, XCircle, AlertTriangle, Sparkles } from 'lucide-react';

export default function AiInsightPanel({ riskScore, claimSeverity, policyCoverage, status = 'approved' }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [typingText, setTypingText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  const factors = [
    {
      name: 'Risk Score',
      value: riskScore || 45,
      threshold: 70,
      icon: '📊',
      impact: riskScore >= 70 ? 'negative' : 'positive'
    },
    {
      name: 'Claim Severity',
      value: claimSeverity || 'Moderate',
      threshold: 80,
      icon: '⚠️',
      impact: claimSeverity === 'High' ? 'negative' : 'positive'
    },
    {
      name: 'Policy Coverage',
      value: policyCoverage || 'Standard',
      threshold: 50,
      icon: '🛡️',
      impact: policyCoverage === 'Pro' ? 'positive' : 'neutral'
    },
    {
      name: 'Fraud Check',
      value: 'Passed',
      threshold: 100,
      icon: '🔍',
      impact: 'positive'
    },
    {
      name: 'GPS Verification',
      value: 'Verified',
      threshold: 100,
      icon: '📍',
      impact: 'positive'
    },
  ];

  const positiveCount = factors.filter(f => f.impact === 'positive').length;
  const statusConfig = {
    approved: {
      title: '✅ Payout Approved',
      color: 'emerald',
      gradient: 'from-emerald-500/20 to-teal-500/20',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      bgGlow: 'bg-emerald-500/10',
      icon: CheckCircle2
    },
    rejected: {
      title: '❌ Payout Rejected',
      color: 'red',
      gradient: 'from-red-500/20 to-orange-500/20',
      border: 'border-red-500/30',
      text: 'text-red-400',
      bgGlow: 'bg-red-500/10',
      icon: XCircle
    },
    review: {
      title: '🔶 Marked for Review',
      color: 'amber',
      gradient: 'from-amber-500/20 to-orange-500/20',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      bgGlow: 'bg-amber-500/10',
      icon: AlertTriangle
    }
  };

  const config = statusConfig[status] || statusConfig.approved;

  const fullMessage = status === 'approved' 
    ? `AI analysis complete. Payout approved due to ${positiveCount}/5 positive factors. All parametric thresholds met.`
    : status === 'rejected'
    ? `AI analysis complete. Claim rejected due to exclusion clause or high risk score (${riskScore} > 70).`
    : `AI analysis complete. Manual review required due to ambiguous factors.`;

  useEffect(() => {
    setIsAnalyzing(true);
    let index = 0;
    const interval = setInterval(() => {
      if (index <= fullMessage.length) {
        setTypingText(fullMessage.slice(0, index));
        index++;
      } else {
        setIsAnalyzing(false);
        clearInterval(interval);
      }
    }, 30);
    return () => clearInterval(interval);
  }, []);

  const scorePercentage = Math.round((positiveCount / factors.length) * 100);

  return (
    <div className={`rounded-3xl bg-gradient-to-br ${config.gradient} backdrop-blur-xl border ${config.border} overflow-hidden`}>
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${config.bgGlow}`}>
              <Brain className={`w-5 h-5 ${config.text}`} />
            </div>
            <div>
              <h3 className="font-bold text-white flex items-center gap-2">
                <Sparkles className={`w-4 h-4 ${config.text}`} />
                AI Decision Insight
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Powered by GigShield Neural Network</p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-5 space-y-4">
          <div className={`p-4 rounded-2xl ${config.bgGlow} border ${config.border}`}>
            <div className="flex items-center gap-2 mb-2">
              <config.icon className={`w-5 h-5 ${config.text}`} />
              <span className={`font-bold ${config.text}`}>{config.title}</span>
            </div>
            <p className="text-sm text-slate-300 font-mono">
              {typingText}
              {isAnalyzing && <span className="animate-pulse">|</span>}
            </p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Confidence Score</span>
              <span className="text-sm font-bold text-white">{scorePercentage}%</span>
            </div>
            <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${status === 'approved' ? 'from-emerald-500 to-teal-400' : status === 'rejected' ? 'from-red-500 to-orange-400' : 'from-amber-500 to-orange-400'} transition-all duration-1000`}
                style={{ width: `${scorePercentage}%` }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Decision Factors</span>
            {factors.map((factor, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 backdrop-blur-sm border border-slate-700/20 hover:border-slate-600/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">{factor.icon}</span>
                  <span className="text-sm font-medium text-slate-200">{factor.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    factor.impact === 'positive' ? 'bg-emerald-500/20 text-emerald-400' :
                    factor.impact === 'negative' ? 'bg-red-500/20 text-red-400' :
                    'bg-slate-600/30 text-slate-400'
                  }`}>
                    {factor.value}
                  </span>
                  {factor.impact === 'positive' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  {factor.impact === 'negative' && <XCircle className="w-4 h-4 text-red-400" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
