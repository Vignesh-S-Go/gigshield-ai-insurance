import {
    Activity,
    ArrowRight,
    ChevronRight,
    CloudRain,
    Heart,
    Info,
    ShieldCheck,
    TrendingDown,
    Trophy,
    XCircle,
    Zap
} from 'lucide-react';
import useStore from '../store/useStore';

const WorkerPolicyPage = ({ onAction }) => {
    const { user } = useStore();

    // Mock Worker Data
    const workerData = {
        name: user?.name?.split(' ')[0] || 'Vignesh',
        plan: 'Pro Protection',
        status: 'Active',
        weeklyPremium: 71,
        savings: 10,
        riskLevel: 'Safe', // 'Safe' | 'Moderate' | 'High'
        weatherAlert: 'Heavy Rain Today'
    };

    const coverageItems = [
        { title: 'Accident Protection', icon: ShieldCheck, color: 'text-success-400' },
        { title: 'Theft Protection', icon: ShieldCheck, color: 'text-success-400' },
        { title: 'Weather Protection', icon: CloudRain, color: 'text-primary-400' },
        { title: 'Income Loss Support', icon: Activity, color: 'text-purple-400' },
    ];

    const exclusions = ['Pandemic', 'War', 'Terrorism', 'Fraud'];

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 p-4 pb-12 space-y-6 max-w-md mx-auto animate-fade-in">

            {/* Personalized Header */}
            <div className="flex items-center justify-between pt-4">
                <div>
                    <h1 className="text-2xl font-black text-white px-1">Hi, {workerData.name}! 👋</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-success-500">
                            Your Status: {workerData.riskLevel}
                        </span>
                    </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
                    <Heart className="w-6 h-6 text-white fill-white/20" />
                </div>
            </div>

            {/* Main Policy Summary Card */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-[2.5rem] p-8 shadow-2xl shadow-primary-500/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:rotate-12 transition-transform duration-500">
                    <ShieldCheck className="w-32 h-32 text-white" />
                </div>
                <div className="relative z-10 text-white">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">
                        {workerData.plan}
                    </span>
                    <h2 className="text-4xl font-black mt-4 tracking-tight">₹{workerData.weeklyPremium}</h2>
                    <p className="text-white/70 text-xs font-bold uppercase tracking-widest mt-1">Weekly Premium Paid</p>

                    <div className="h-px bg-white/20 my-6" />

                    <p className="text-lg font-bold leading-tight">
                        You are protected while you work 🚴
                    </p>
                    <p className="text-white/60 text-[10px] mt-2 font-medium">Valid until next renewal: 05 Apr</p>
                </div>
            </div>

            {/* AI Friendly Insight */}
            <div className="bg-success-500/10 border border-success-500/20 rounded-3xl p-5 flex items-center gap-4 relative overflow-hidden">
                <div className="p-3 bg-success-500/20 rounded-2xl">
                    <Trophy className="w-6 h-6 text-success-500" />
                </div>
                <div>
                    <h3 className="text-sm font-black text-white">Great Work!</h3>
                    <p className="text-xs text-success-400 font-bold">
                        You saved <span className="text-lg font-black">₹{workerData.savings}</span> this week due to safe driving 🎉
                    </p>
                </div>
            </div>

            {/* Coverage Grid */}
            <div className="space-y-3">
                <h3 className="text-xs font-black text-dark-500 uppercase tracking-[0.2em] px-2">What we cover</h3>
                <div className="grid grid-cols-2 gap-3">
                    {coverageItems.map((item, idx) => (
                        <div key={idx} className="bg-dark-800/50 border border-dark-700/50 p-4 rounded-3xl flex flex-col items-start gap-2 hover:bg-dark-800 transition-colors">
                            <item.icon className={`w-5 h-5 ${item.color}`} />
                            <span className="text-xs font-bold text-white leading-tight">{item.title}</span>
                            <span className="text-[10px] text-success-500 font-black">✔ PROTECTED</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Weather Protection Simplified */}
            <div className="bg-primary-500/5 border border-primary-500/10 rounded-3xl p-5 relative overflow-hidden">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <CloudRain className="w-8 h-8 text-primary-400" />
                        <Zap className="w-4 h-4 text-warning-400 absolute -bottom-1 -right-1" />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-tight">{workerData.weatherAlert}</h4>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                            You are automatically protected. If conditions worsen, a payout will be triggered instantly.
                        </p>
                    </div>
                </div>
            </div>

            {/* Exclusions Section */}
            <div className="bg-dark-900/50 border border-dark-800 rounded-3xl p-6">
                <h3 className="text-xs font-black text-danger-500/70 uppercase tracking-[0.2em] mb-4">Not Included</h3>
                <div className="flex flex-wrap gap-2">
                    {exclusions.map((item, idx) => (
                        <div key={idx} className="px-3 py-1.5 bg-danger-500/5 border border-danger-500/20 rounded-xl flex items-center gap-2">
                            <XCircle className="w-3 h-3 text-danger-500" />
                            <span className="text-[10px] font-extrabold text-white/80">{item}</span>
                        </div>
                    ))}
                </div>
                <div className="mt-4 flex items-start gap-2 text-dark-500 scale-95 origin-left">
                    <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <p className="text-[10px] italic">Claims under these conditions are not covered by our algorithmic engine.</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3 pt-2">
                <button
                    onClick={() => onAction && onAction('dashboard')}
                    className="w-full bg-dark-800 hover:bg-dark-700 border border-dark-700 p-4 rounded-3xl flex items-center justify-between transition-all group"
                >
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5 text-primary-500" />
                        <span className="text-sm font-bold text-white">Back to Dashboard</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-dark-500 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                    onClick={() => onAction && onAction('claims')}
                    className="w-full bg-primary-600 hover:bg-primary-700 p-4 rounded-3xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-primary-500/20"
                >
                    <span className="text-sm font-black text-white uppercase tracking-widest">File Claim Now</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                </button>
            </div>

            {/* Dynamic Discount Insight */}
            <div className="bg-gradient-to-r from-[#1e293b] to-[#334155] p-5 rounded-3xl border border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
                        <TrendingDown className="w-5 h-5 text-primary-400" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest">Risk Level: Low</p>
                        <p className="text-sm font-bold text-white">Eligible for discounts</p>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-xs font-black text-success-500">10% OFF</span>
                </div>
            </div>

        </div>
    );
};

export default WorkerPolicyPage;
