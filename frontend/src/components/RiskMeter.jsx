import { useEffect, useState } from 'react';
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function RiskMeter({ score, size = 'md', showLabel = true }) {
  const [displayScore, setDisplayScore] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => setDisplayScore(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const getRiskLevel = (s) => {
    if (s >= 70) return { label: 'High', color: 'red', gradient: 'from-red-500 to-orange-500', bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', glow: 'shadow-red-500/50' };
    if (s >= 40) return { label: 'Medium', color: 'yellow', gradient: 'from-yellow-500 to-amber-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', glow: 'shadow-yellow-500/50' };
    return { label: 'Low', color: 'green', gradient: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', glow: 'shadow-emerald-500/50' };
  };

  const risk = getRiskLevel(displayScore);
  const percentage = Math.min(100, Math.max(0, displayScore));
  
  const sizes = {
    sm: { ring: 80, stroke: 6, text: 'text-lg', label: 'text-[10px]' },
    md: { ring: 120, stroke: 8, text: 'text-2xl', label: 'text-xs' },
    lg: { ring: 160, stroke: 10, text: 'text-4xl', label: 'text-sm' },
  };
  
  const s = sizes[size];
  const radius = (s.ring - s.stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative flex items-center justify-center">
        <svg className={`transform -rotate-90 w-${s.ring/4} h-${s.ring/4}`} width={s.ring} height={s.ring}>
          <circle
            cx={s.ring / 2}
            cy={s.ring / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={s.stroke}
            className="text-slate-700/50"
          />
          <circle
            cx={s.ring / 2}
            cy={s.ring / 2}
            r={radius}
            fill="none"
            stroke={`url(#riskGradient${size})`}
            strokeWidth={s.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out drop-shadow-lg"
          />
          <defs>
            <linearGradient id={`riskGradient${size}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={risk.color === 'red' ? '#ef4444' : risk.color === 'yellow' ? '#f59e0b' : '#10b981'} />
              <stop offset="100%" stopColor={risk.color === 'red' ? '#f97316' : risk.color === 'yellow' ? '#d97706' : '#14b8a6'} />
            </linearGradient>
          </defs>
        </svg>
        
        <div className="absolute flex flex-col items-center">
          <span className={`font-black ${s.text} text-white tabular-nums`}>
            {Math.round(displayScore)}
          </span>
          <span className={`${s.label} text-slate-400 font-bold uppercase tracking-wider`}>Score</span>
        </div>
        
        <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-br ${risk.gradient} animate-pulse`} />
      </div>
      
      {showLabel && (
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${risk.bg} border ${risk.border}`}>
          {risk.color === 'red' ? <TrendingUp className={`w-4 h-4 ${risk.text}`} /> : 
           risk.color === 'yellow' ? <Minus className={`w-4 h-4 ${risk.text}`} /> : 
           <TrendingDown className={`w-4 h-4 ${risk.text}`} />}
          <span className={`font-bold uppercase tracking-wider ${s.label} ${risk.text}`}>
            {risk.label} Risk
          </span>
        </div>
      )}
    </div>
  );
}
