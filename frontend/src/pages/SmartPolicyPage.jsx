import {
    Bike,
    Briefcase,
    CheckCircle2,
    Droplets,
    Info,
    ShieldAlert,
    ShieldCheck,
    TrendingDown,
    TrendingUp,
    XCircle,
    Zap
} from 'lucide-react';
import { useMemo } from 'react';
import useStore from '../store/useStore';
import PolicyBlueprint from '../components/policy/PolicyBlueprint';
import TriggerEngineVisual from '../components/policy/TriggerEngineVisual';
import PricingLogicCard from '../components/policy/PricingLogicCard';
import PayoutLogicCard from '../components/policy/PayoutLogicCard';
import PredictionPanel from '../components/policy/PredictionPanel';
import FraudEngineCard from '../components/policy/FraudEngineCard';
import PolicyMetrics from '../components/policy/PolicyMetrics';

const SmartPolicyPage = () => {
    const { user } = useStore();

    // Mock Data
    const worker = {
        name: user?.name || 'Vignesh',
        riskScore: user?.riskScore || 0.42,
        plan: 'Pro Plus',
        status: 'Active',
        basePremium: 50.00,
        rainfall: 82, // mm
        threshold: 75, // mm
        deliveriesThisWeek: 142
    };

    const finalPremium = useMemo(() => {
        return (worker.basePremium + (worker.basePremium * worker.riskScore)).toFixed(2);
    }, [worker]);

    const riskAdjustment = (worker.basePremium * worker.riskScore).toFixed(2);

    const coverageItems = [
        { title: 'Accident Protection', desc: 'Up to ₹50,000 cover', icon: ShieldCheck },
        { title: 'Theft Protection', desc: 'Smartphone & Vehicle', icon: ShieldCheck },
        { title: 'Weather Coverage', desc: 'Rain & Heat triggers', icon: Droplets },
        { title: 'Income Loss', desc: 'Daily payout for downtime', icon: Briefcase },
    ];

    const exclusions = [
        { title: 'Pandemic', tag: 'COVID-19/Lockdowns' },
        { title: 'War', tag: 'Armed Conflict' },
        { title: 'Terrorism', tag: 'Terrorist Acts' },
        { title: 'Fraud', tag: 'False Evidence' },
    ];

    return (
        <div className="min-h-screen bg-dark-950 text-slate-200 p-6 space-y-8 animate-fade-in">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Smart Insurance Policy</h1>
                    <p className="text-dark-400 text-sm mt-1">Real-time parametric coverage for {worker.name}</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 rounded-full bg-success-500/10 border border-success-500/20 text-success-500 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse"></div>
                        <span className="text-sm font-bold uppercase tracking-wider">Status: {worker.status}</span>
                    </div>
                    <div className="px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-bold uppercase tracking-wider">
                        {worker.plan} Plan
                    </div>
                </div>
            </div>

            {/* Policy Intelligence Control Panel - MOVED TO TOP */}
            <div className="mb-8">
                <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                    <Zap className="w-6 h-6 text-primary-400" />
                    Policy Intelligence Control Panel
                </h2>
                
                {/* Row 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <PolicyBlueprint />
                    <PricingLogicCard />
                </div>
                
                {/* Row 2 */}
                <div className="mb-6">
                    <TriggerEngineVisual />
                </div>
                
                {/* Row 3 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <PayoutLogicCard />
                    <FraudEngineCard />
                </div>
                
                {/* Row 4 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <PredictionPanel />
                    <PolicyMetrics />
                </div>
            </div>

            {/* Smart Insurance Policy - MOVED TO BOTTOM */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Overview & Calculation */}
                <div className="lg:col-span-2 space-y-8">

                    {/* AI Insight Panel */}
                    <div className="bg-gradient-to-r from-primary-600/20 to-purple-600/20 border-l-4 border-primary-500 p-5 rounded-r-2xl relative overflow-hidden group">
                        <Zap className="absolute -right-4 -top-4 w-24 h-24 text-primary-500/10 group-hover:scale-110 transition-transform" />
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-primary-500/20 rounded-xl">
                                <TrendingDown className="w-6 h-6 text-primary-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">AI Underwriting Insight</h3>
                                <p className="text-slate-400 text-sm mt-1">
                                    You are currently <span className="text-success-400 font-bold">low risk</span> based on telemetry data.
                                    You are eligible for a <span className="text-success-400 font-bold">10% discount</span> on your next weekly adjustment.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Premium Calculation */}
                        <div className="bg-white dark:bg-dark-900 border border-dark-200 dark:border-dark-800 rounded-3xl p-6 shadow-xl">
                            <h2 className="text-sm font-black uppercase text-dark-500 tracking-[0.2em] mb-6">Premium Breakdown</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-slate-400">
                                    <span className="text-sm">Base Premium (Weekly)</span>
                                    <span className="font-bold">₹{worker.basePremium.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-400">Risk Adjustment (AI Score: {worker.riskScore})</span>
                                    <span className="font-bold text-danger-400">+₹{riskAdjustment}</span>
                                </div>
                                <div className="h-px bg-dark-200 dark:bg-dark-800 my-2"></div>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <span className="text-xs text-dark-500 font-bold uppercase block">Final Premium</span>
                                        <span className="text-4xl font-black text-dark-900 dark:text-white">₹{finalPremium}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] text-dark-500 font-bold bg-dark-100 dark:bg-dark-800 px-2 py-1 rounded">AUTO-DEBIT</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-[11px] text-dark-500 mt-6 flex items-center gap-1.5 italic">
                                <Info className="w-3 h-3" /> Higher risk scores (telemetry) lead to higher premium adjustments.
                            </p>
                        </div>

                        {/* Pay-As-You-Ride */}
                        <div className="bg-white dark:bg-dark-900 border border-dark-200 dark:border-dark-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
                            <Bike className="absolute -right-6 -bottom-6 w-32 h-32 text-slate-200 dark:text-slate-800/10 group-hover:-translate-x-4 transition-transform" />
                            <h2 className="text-sm font-black uppercase text-dark-500 tracking-[0.2em] mb-6 underline decoration-primary-500/50 underline-offset-8">Pay-As-You-Ride</h2>
                            <div className="space-y-4 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                        <span className="text-xl font-black text-indigo-400">₹2</span>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white">Per Delivery Rate</h4>
                                        <p className="text-[11px] text-dark-400 uppercase font-black">Dynamic Adjustment</p>
                                    </div>
                                </div>
                                <div className="mt-8 p-4 bg-dark-800/50 rounded-2xl border border-dark-700">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-dark-500 font-bold uppercase">Weekly Activity</span>
                                        <span className="text-xs font-bold text-white">{worker.deliveriesThisWeek} Trips</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-dark-700 rounded-full mt-3 overflow-hidden">
                                        <div className="h-full bg-indigo-500 w-[65%]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Parametric Insurance Visualizer */}
                    <div className="bg-white dark:bg-dark-900 border border-dark-200 dark:border-dark-800 rounded-3xl p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-sm font-black uppercase text-dark-500 tracking-[0.2em]">Parametric Trigger Status</h2>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-dark-400 bg-dark-100 dark:bg-dark-800 px-2 py-1 rounded">LIVE SENSOR DATA</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="flex flex-col items-center text-center p-4 bg-dark-50 dark:bg-dark-800/30 rounded-2xl border border-dark-200 dark:border-dark-700/50 hover:border-primary-500/30 transition-colors">
                                <Droplets className="w-8 h-8 text-primary-400 mb-2" />
                                <span className="text-xs font-bold text-dark-500 uppercase">Rainfall Intensity</span>
                                <span className="text-2xl font-black text-dark-900 dark:text-white mt-1">{worker.rainfall}mm</span>
                            </div>
                            <div className="flex flex-col items-center text-center p-4">
                                <div className="w-px h-12 bg-dark-200 dark:bg-dark-800 hidden md:block" />
                                <div className="flex flex-col items-center">
                                    <span className="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em] mb-2">Threshold</span>
                                    <div className="px-4 py-1.5 rounded-lg border-2 border-dashed border-dark-300 dark:border-dark-700 font-mono text-lg font-bold">
                                        {worker.threshold}mm
                                    </div>
                                </div>
                                <div className="w-px h-12 bg-dark-200 dark:bg-dark-800 hidden md:block" />
                            </div>
                            <div className="flex flex-col items-center text-center p-4 bg-success-50 dark:bg-success-500/5 rounded-2xl border border-success-200 dark:border-success-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]">
                                <CheckCircle2 className="w-8 h-8 text-success-500 mb-2 animate-bounce" />
                                <span className="text-xs font-bold text-success-500 uppercase">Trigger Status</span>
                                <span className="text-xl font-black text-dark-900 dark:text-white mt-1 uppercase tracking-tight">PAYOUT TRIGGERED</span>
                            </div>
                        </div>

                        <p className="text-[11px] text-dark-500 mt-6 text-center italic">
                            "When rainfall exceeds the safety threshold of 70mm, we automatically trigger an income protection payout."
                        </p>
                    </div>

                </div>

                {/* Right Column: Coverage, Exclusions, Risk-Based Benefits */}
                <div className="space-y-8">

                    {/* Coverage Section */}
                    <div className="bg-white dark:bg-dark-900 border border-dark-200 dark:border-dark-800 rounded-3xl p-6 shadow-xl">
                        <h2 className="text-sm font-black uppercase text-dark-500 tracking-[0.2em] mb-6">Your Coverage</h2>
                        <div className="space-y-3">
                            {coverageItems.map((item, idx) => (
                                <div key={idx} className="group flex items-center justify-between p-4 bg-dark-50 dark:bg-dark-800/50 rounded-2xl border border-dark-200 dark:border-dark-700 hover:border-success-500/50 transition-all cursor-default">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-success-500/10 rounded-xl group-hover:scale-110 transition-transform">
                                            <item.icon className="w-5 h-5 text-success-500" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-dark-900 dark:text-white">{item.title}</h4>
                                            <p className="text-[10px] text-dark-400">{item.desc}</p>
                                        </div>
                                    </div>
                                    <div className="w-5 h-5 rounded-full bg-success-500 text-white dark:text-dark-950 flex items-center justify-center">
                                        <CheckCircle2 className="w-3.5 h-3.5 font-bold" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Exclusions Section */}
                    <div className="bg-white dark:bg-dark-900 border border-dark-200 dark:border-dark-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-[0.03]">
                            <ShieldAlert className="w-24 h-24 text-danger-500 rotate-12" />
                        </div>
                        <h2 className="text-sm font-black uppercase text-danger-500/70 tracking-[0.2em] mb-6">Exclusion List</h2>
                        <div className="grid grid-cols-2 gap-3">
                            {exclusions.map((item, idx) => (
                                <div key={idx} className="p-3 bg-danger-50 dark:bg-danger-500/5 border border-danger-200 dark:border-danger-500/20 rounded-2xl">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <XCircle className="w-3 h-3 text-danger-500" />
                                        <span className="text-xs font-black text-dark-900 dark:text-white">{item.title}</span>
                                    </div>
                                    <p className="text-[10px] text-dark-500 font-medium truncate">{item.tag}</p>
                                </div>
                            ))}
                        </div>
                        <p className="text-[10px] text-dark-600 dark:text-dark-500 mt-6 leading-relaxed">
                            * Claims for excluded events are automatically filtered by the algorithmic rules engine.
                        </p>
                    </div>

                    {/* Risk-Based Benefits */}
                    <div className="bg-slate-100 dark:bg-gradient-to-br from-dark-800 to-dark-900 border border-dark-200 dark:border-dark-700 rounded-3xl p-6 shadow-xl">
                        <h2 className="text-sm font-black uppercase text-dark-500 tracking-[0.2em] mb-6">Dynamic Risk Logic</h2>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-3 bg-success-500/5 rounded-2xl border border-success-500/10">
                                <div className="p-2 bg-success-500/20 rounded-lg">
                                    <TrendingDown className="w-4 h-4 text-success-500" />
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-success-400 block uppercase">Low Risk Profile</span>
                                    <span className="text-[10px] text-white/70">Automatic 15% Premium Discount applied.</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-3 bg-danger-500/5 rounded-2xl border border-danger-500/10 grayscale opacity-60">
                                <div className="p-2 bg-danger-500/20 rounded-lg">
                                    <TrendingUp className="w-4 h-4 text-danger-500" />
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-danger-400 block uppercase">High Risk Profile</span>
                                    <span className="text-[10px] text-white/70">Increased surcharge up to +40% premium.</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
};

export default SmartPolicyPage;
