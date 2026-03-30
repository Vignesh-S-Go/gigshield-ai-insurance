import {
    Activity,
    ArrowLeft,
    ArrowRight,
    Award,
    Camera,
    CheckCircle2,
    LayoutDashboard,
    LogOut,
    MapPin,
    Navigation,
    PlusCircle,
    ShieldAlert,
    ShieldCheck,
    Wallet,
    Zap
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import { aiService } from '../services/aiService';
import useStore from '../store/useStore';
import { formatCurrency } from '../utils/helpers';
import { evaluateClaim } from '../utils/rulesEngine';

export default function WorkerApp() {
    const navigate = useNavigate();
    const { currentWorkerId, getWorkerById, getPoliciesByWorkerId, getClaimsByWorkerId, addClaim, logout } = useStore();
    const [activeTab, setActiveTab] = useState('dashboard');

    const [showClaimModal, setShowClaimModal] = useState(false);
    const [claimStatus, setClaimStatus] = useState(null); // 'input' | 'submitting' | 'success' | 'rejected'
    const [claimReason, setClaimReason] = useState(null);
    const [claimExplanation, setClaimExplanation] = useState('');

    const [sosActive, setSosActive] = useState(false);

    const worker = getWorkerById(currentWorkerId);
    const policies = getPoliciesByWorkerId(currentWorkerId);
    const activePolicy = policies.find(p => p.status === 'Active') || policies[0];
    const workerClaims = getClaimsByWorkerId(currentWorkerId);

    // Gamification & Risk State
    const safetyScore = Math.floor((1 - (worker?.riskScore || 0.5)) * 100);
    const safetyDiscount = safetyScore > 80 ? 5 : 0;

    // AI States
    const [realTimeAlert, setRealTimeAlert] = useState("Loading live parametric sensor data...");
    const [twinPrediction, setTwinPrediction] = useState("AI is predicting risk trajectory based on historical patterns...");

    useEffect(() => {
        if (activeTab === 'dashboard' && worker) {
            aiService.generateRiskAlert(
                { weather: 'Tracking active storm cells', route: worker.city },
                { shift: 'Active night delivery route', previousIncidents: worker.claimsFired || 0 }
            ).then(res => setRealTimeAlert(res));
        }
        if (activeTab === 'risk' && worker) {
            aiService.simulateDigitalTwin(worker)
                .then(res => setTwinPrediction(res));
        }
    }, [activeTab, worker]);

    // Financial Ledger items
    const ledger = useMemo(() => {
        const items = [];
        for (let i = 0; i < 3; i++) {
            items.push({
                id: `PREM-${i}`,
                label: `${activePolicy?.planType || 'Standard'} Premium`,
                amount: -(activePolicy?.premium || 49),
                date: `2026-03-${28 - i * 7}`,
                type: 'debit'
            });
        }
        workerClaims.filter(c => c.status === 'Paid').forEach(c => {
            items.push({
                id: c.id,
                label: `${c.triggerType} Payout`,
                amount: c.payoutAmount,
                date: c.date,
                type: 'credit'
            });
        });
        return items.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    }, [activePolicy, workerClaims]);

    const handleSOS = () => {
        setSosActive(true);
        // Auto-create SOS claim
        const sosClaim = {
            id: `SOS-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
            workerId: currentWorkerId,
            workerName: worker.name,
            workerCity: worker.city,
            triggerType: 'Medical',
            status: 'Pending',
            payoutAmount: 5000,
            date: new Date().toISOString().split('T')[0],
            auditTrail: ['SOS Emergency triggered via mobile app. GPS location logged.']
        };
        addClaim(sosClaim);
        setTimeout(() => {
            setSosActive(false);
            setActiveTab('claims');
        }, 3000);
    };

    const submitClaim = (type) => {
        setClaimStatus('submitting');

        // Evaluate logic locally to show AI explanation instantly
        const evalData = { trigger: type, location: worker?.city, eventDate: new Date().toISOString().split('T')[0] };
        const decision = evaluateClaim(evalData);

        const newClaim = {
            id: `GS-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
            workerId: currentWorkerId,
            workerName: worker.name,
            workerCity: worker.city,
            triggerType: type,
            status: decision.status === 'REJECTED' ? 'Flagged' : 'Pending',
            payoutAmount: decision.status === 'REJECTED' ? 0 : (500 + Math.floor(Math.random() * 1000)),
            date: evalData.eventDate,
            auditTrail: [`AI Assessment: ${decision.message || 'Standard processing'}`]
        };

        setTimeout(() => {
            addClaim(newClaim);
            setClaimExplanation(decision.message || 'Risk validated against parametric thresholds. Initiating payout queue.');
            setClaimStatus(decision.status === 'REJECTED' ? 'rejected' : 'success');
        }, 1500);
    };

    // Nav icons mapped
    const navs = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
        { id: 'policy', icon: ShieldCheck, label: 'Policy' },
        { id: 'claims', icon: Zap, label: 'Claims' },
        { id: 'exit', icon: LogOut, label: 'Exit' },
    ];

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 antialiased font-sans flex flex-col items-center">
            {/* Mobile Frame Simulation on Desktop */}
            <div className="w-full max-w-md min-h-screen bg-dark-900 border-x border-slate-800 shadow-2xl relative flex flex-col pb-24 overflow-x-hidden">

                {/* Top Header */}
                <div className="p-4 flex items-center justify-between bg-dark-900 sticky top-0 z-20 border-b border-dark-800">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="bg-dark-800 hover:bg-dark-700 text-slate-300 p-2 rounded-lg transition-colors border border-dark-700"
                            title="Back to Admin"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                        <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center text-white font-black italic ml-1">GS</div>
                        <span className="font-extrabold text-base sm:text-lg tracking-tight uppercase hidden sm:inline-block">Worker</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleSOS}
                            className={`px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-widest transition-all duration-300 ${sosActive ? 'bg-danger-500 text-white animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.5)]' : 'bg-danger-500/10 text-danger-500 border border-danger-500/30'}`}
                        >
                            {sosActive ? 'SOS Active' : 'SOS'}
                        </button>
                        <button
                            onClick={() => {
                                logout();
                                navigate('/');
                            }}
                            className="bg-dark-800 hover:bg-danger-500/20 text-slate-400 hover:text-danger-500 p-2 rounded-lg transition-colors border border-dark-700"
                            title="Logout"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {sosActive && (
                    <div className="p-4 bg-danger-500 text-white font-bold text-center text-sm animate-pulse">
                        EMERGENCY ALERT SENT to Authorities & Admin. Claim auto-filed.
                    </div>
                )}

                <div className="flex-1 overflow-y-auto scrollbar-none">
                    {/* TAB: DASHBOARD */}
                    {activeTab === 'dashboard' && (
                        <div className="p-5 space-y-5 animate-fade-in">
                            <p className="text-xl text-white font-bold tracking-tight">Hi, {worker?.name.split(' ')[0]} 👋</p>

                            {/* Earnings & Weekly Deduction Card */}
                            <div className="bg-gradient-to-br from-dark-800 to-dark-900 rounded-3xl p-5 border border-dark-700 shadow-lg relative overflow-hidden">
                                <div className="relative z-10 flex justify-between items-end">
                                    <div>
                                        <p className="text-dark-400 text-xs font-semibold mb-1 uppercase tracking-wider">This Week's Earnings</p>
                                        <h2 className="text-3xl font-black text-white">{formatCurrency(worker?.weeklyEarnings || 0)}</h2>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-dark-400 text-[10px] font-semibold mb-1 uppercase tracking-wider">Auto-Premium</p>
                                        <p className="text-sm font-bold text-danger-400">- {formatCurrency(activePolicy?.premium || 49)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* AI Risk Assistant Notice */}
                            <div className="bg-primary-500/10 border border-primary-500/20 rounded-2xl p-4 flex gap-4 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5">
                                    <Activity className="w-24 h-24" />
                                </div>
                                <Zap className="w-8 h-8 text-primary-400 flex-shrink-0 animate-pulse" />
                                <div>
                                    <h3 className="text-sm font-bold text-primary-400 mb-1">AI Risk Assistant</h3>
                                    <p className="text-xs text-slate-300 leading-relaxed font-medium">
                                        {realTimeAlert}
                                        <strong className="text-white block mt-1">Parametric weather triggers are armed.</strong>
                                    </p>
                                </div>
                            </div>

                            {/* Ledger Summary */}
                            <div>
                                <div className="flex justify-between items-end mb-3">
                                    <h3 className="text-sm font-bold text-white">Recent Transactions</h3>
                                    <span className="text-[10px] text-primary-400 uppercase font-bold cursor-pointer" onClick={() => setActiveTab('claims')}>View All</span>
                                </div>
                                <div className="space-y-2">
                                    {ledger.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between p-3 bg-dark-800 rounded-xl border border-dark-700">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.type === 'credit' ? 'bg-success-500/10 text-success-500' : 'bg-slate-700/50 text-slate-400'}`}>
                                                    {item.type === 'credit' ? <Wallet className="w-4 h-4" /> : <div className="font-bold text-xs">-</div>}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-white">{item.label}</p>
                                                    <p className="text-[10px] text-slate-500">{item.date}</p>
                                                </div>
                                            </div>
                                            <div className={`text-sm font-black ${item.type === 'credit' ? 'text-success-500' : 'text-slate-200'}`}>
                                                {item.type === 'credit' ? '+' : ''}{formatCurrency(item.amount)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    )}

                    {/* TAB: POLICY */}
                    {activeTab === 'policy' && (
                        <div className="p-5 space-y-5 animate-fade-in">
                            <h2 className="text-lg font-bold text-white">Your Coverage</h2>

                            <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <ShieldCheck className="w-24 h-24" />
                                </div>
                                <div className="relative z-10">
                                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-white border border-white/20">
                                        {activePolicy?.planType} Policy
                                    </span>
                                    <h2 className="text-3xl font-black text-white mt-4">
                                        {formatCurrency(activePolicy?.premium || 49)}<span className="text-sm font-normal opacity-70">/wk</span>
                                    </h2>
                                    <p className="text-white/70 text-xs font-semibold mt-1 mb-4">Risk-Adjusted Premium</p>

                                    <div className="border-t border-white/20 pt-4 flex justify-between">
                                        <div>
                                            <p className="text-[10px] text-white/50 uppercase font-bold">Base Cover</p>
                                            <p className="text-xs font-bold text-white">₹50,000</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-white/50 uppercase font-bold">Next Renewal</p>
                                            <p className="text-xs font-bold text-white">05 Apr 2026</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Exclusions Box - Explicit as requested */}
                            <div className="bg-dark-800 border-l-2 border-danger-500 rounded-xl p-4">
                                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                                    <ShieldAlert className="w-4 h-4 text-danger-500" /> Standard Exclusions
                                </h3>
                                <p className="text-xs text-dark-400 mb-3">As per algorithmic underwriting, the following catastrophic events are non-insurable:</p>
                                <ul className="space-y-2">
                                    <li className="flex gap-2 text-xs text-slate-300"><span className="text-danger-400 font-bold">•</span> Acts of War / Foreign Conflict.</li>
                                    <li className="flex gap-2 text-xs text-slate-300"><span className="text-danger-400 font-bold">•</span> Global or Regional Pandemics (Lockdowns).</li>
                                    <li className="flex gap-2 text-xs text-slate-300"><span className="text-danger-400 font-bold">•</span> Terrorist Activities.</li>
                                </ul>
                            </div>

                            <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
                                <h3 className="text-sm font-bold text-white mb-3">Covered Triggers</h3>
                                <div className="flex gap-2 flex-wrap">
                                    <span className="px-3 py-1 bg-dark-700 rounded-full text-xs font-bold text-dark-300">🌧️ Heavy Rain</span>
                                    <span className="px-3 py-1 bg-dark-700 rounded-full text-xs font-bold text-dark-300">🌡️ Heatwave</span>
                                    <span className="px-3 py-1 bg-dark-700 rounded-full text-xs font-bold text-dark-300">🏥 Accident</span>
                                </div>
                            </div>

                            <button onClick={() => alert("Redirecting to Razorpay secure gateway connection...")} className="w-full btn-primary py-4 font-black justify-center mt-6">
                                🔒 Pay Premium via Razorpay
                            </button>
                        </div>
                    )}

                    {/* TAB: CLAIMS (FNOL) */}
                    {activeTab === 'claims' && (
                        <div className="p-5 space-y-5 animate-fade-in">
                            <h2 className="text-lg font-bold text-white">Claims Center</h2>

                            <button
                                onClick={() => { setClaimStatus('input'); setShowClaimModal(true); }}
                                className="w-full bg-gradient-to-r from-primary-600 flex items-center justify-between to-primary-800 hover:opacity-90 transition p-5 rounded-2xl shadow-lg shadow-primary-500/10 group"
                            >
                                <div className="flex items-center gap-3">
                                    <PlusCircle className="w-6 h-6 text-white" />
                                    <div className="text-left">
                                        <p className="font-bold text-white">File New Claim</p>
                                        <p className="text-[10px] text-white/70">1-Tap AI Autofill Enabled</p>
                                    </div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
                            </button>

                            <div>
                                <h3 className="text-sm font-bold text-white mb-3">Claim History</h3>
                                {workerClaims.length === 0 ? (
                                    <p className="text-xs text-dark-500 border border-dashed border-dark-700 p-4 rounded-xl text-center">No previous claims.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {workerClaims.map(c => (
                                            <div key={c.id} className="bg-dark-800 border border-dark-700 p-4 rounded-xl">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <p className="text-xs text-slate-400 font-bold">{c.id}</p>
                                                        <p className="text-sm text-white font-bold">{c.triggerType} Claim</p>
                                                    </div>
                                                    <span className={`px-2 py-1 flex items-center gap-1 rounded text-[10px] font-bold uppercase tracking-wider
                              ${c.status === 'Paid' || c.status === 'Approved' ? 'bg-success-500/10 text-success-500' :
                                                            c.status === 'Flagged' || c.status === 'Rejected' ? 'bg-danger-500/10 text-danger-500' :
                                                                'bg-warning-500/10 text-warning-500'}`}>
                                                        {c.status}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-slate-500">Filed on: {c.date}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB: RISK INTELLIGENCE & GAMIFICATION */}
                    {activeTab === 'risk' && (
                        <div className="p-5 space-y-5 animate-fade-in flex flex-col items-center">
                            <div className="w-full text-left">
                                <h2 className="text-lg font-bold text-white">AI Safety Intelligence</h2>
                            </div>

                            {/* Digital Twin Simulation */}
                            <div className="w-full bg-dark-800 border-2 border-primary-500/30 p-5 rounded-2xl relative overflow-hidden shadow-lg shadow-primary-500/10">
                                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                    <Activity className="w-24 h-24 text-primary-500" />
                                </div>
                                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-primary-400" /> Digital Twin Projection
                                </h3>
                                <div className="p-4 bg-dark-900/50 rounded-xl border border-dark-700">
                                    <p className="text-sm text-slate-300 leading-relaxed font-medium relative z-10 italic">
                                        "{twinPrediction}"
                                    </p>
                                </div>
                            </div>

                            {/* Gamification Ring */}
                            <div className="relative w-48 h-48 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="8" />
                                    <circle
                                        cx="50" cy="50" r="45"
                                        fill="none"
                                        stroke={safetyScore > 80 ? '#10b981' : '#6366f1'}
                                        strokeWidth="8"
                                        strokeDasharray={`${safetyScore * 2.82} 282`}
                                        className="transition-all duration-1000 ease-out"
                                    />
                                </svg>
                                <div className="absolute flex flex-col items-center justify-center">
                                    <span className="text-4xl font-black text-white">{safetyScore}</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Safety Score</span>
                                </div>
                            </div>

                            {/* Gamification Reward Details */}
                            <div className="w-full bg-dark-800 border border-dark-700 p-4 rounded-xl flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-success-500/10 flex items-center justify-center flex-shrink-0">
                                    <Award className="w-5 h-5 text-success-500" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white">Rewards Locked In</h3>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Great driving this week! Your smooth braking earned you a <strong className="text-success-400">5% premium discount</strong> next week.
                                    </p>
                                </div>
                            </div>

                            {/* Zone Risk Alert */}
                            <div className="w-full bg-dark-800 border border-dark-700 p-4 rounded-xl">
                                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-primary-400" /> Current Zone: {worker?.city}
                                </h3>
                                <div className={`p-3 rounded-lg flex gap-3 ${worker?.city === 'Mumbai' ? 'bg-warning-500/10 border border-warning-500/20' : 'bg-success-500/10 border border-success-500/20'}`}>
                                    <Navigation className={`w-5 h-5 flex-shrink-0 ${worker?.city === 'Mumbai' ? 'text-warning-500' : 'text-success-500'}`} />
                                    <p className={`text-xs ${worker?.city === 'Mumbai' ? 'text-warning-200' : 'text-success-200'}`}>
                                        {worker?.city === 'Mumbai' ? 'Severe water-logging up ahead on Main Str. Rerouting via Highway recommended to maintain your Safety Score.' : 'Clear routes ahead. Keep up the safe driving.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom Navigation Tabs */}
                <div className="absolute bottom-0 inset-x-0 h-[72px] bg-dark-900/95 backdrop-blur-xl border-t border-dark-800 flex items-center justify-around px-2 z-30">
                    {navs.map(nav => (
                        <button
                            key={nav.id}
                            onClick={() => {
                                if (nav.id === 'exit') {
                                    navigate('/dashboard');
                                } else {
                                    setActiveTab(nav.id);
                                }
                            }}
                            className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-all ${(activeTab === nav.id && nav.id !== 'exit') ? 'text-primary-500' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <nav.icon className={`w-5 h-5 transition-transform ${(activeTab === nav.id && nav.id !== 'exit') ? 'scale-110 flex-shrink-0' : ''}`} />
                            <span className={`text-[9px] font-bold tracking-wider ${(activeTab === nav.id && nav.id !== 'exit') ? 'opacity-100' : 'opacity-70'} text-center leading-tight`}>
                                {nav.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Claim FNOL Modal with Upload & Auto-Decision Simulation */}
            <Modal
                isOpen={showClaimModal}
                onClose={() => claimStatus !== 'submitting' && setShowClaimModal(false)}
                title="AI Claim Center"
            >
                {claimStatus === 'submitting' ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-4">
                        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="font-bold text-dark-800 dark:text-white">AI Cross-checking triggers & policy...</p>
                    </div>
                ) : claimStatus === 'success' || claimStatus === 'rejected' ? (
                    <div className="py-2 flex flex-col items-center justify-center gap-4 text-center w-full">
                        {claimStatus === 'success' ? (
                            <CheckCircle2 className="w-16 h-16 text-success-500 animate-bounce" />
                        ) : (
                            <ShieldAlert className="w-16 h-16 text-danger-500" />
                        )}
                        <div className="w-full">
                            <p className="text-xl font-black text-dark-900 dark:text-white mb-4 uppercase tracking-widest">
                                {claimStatus === 'success' ? 'Claim Approved' : 'Claim Rejected'}
                            </p>

                            <div className="bg-dark-50 dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-xl p-4 text-left w-full space-y-3 mb-4">
                                <div className="flex justify-between items-center border-b border-dark-200 dark:border-dark-700 pb-2">
                                    <span className="text-xs text-dark-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Policy Match</span>
                                    <span className={`text-xs font-bold ${claimStatus === 'success' ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'}`}>{claimStatus === 'success' ? 'True (Within Limits)' : 'False (Out of bounds)'}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-dark-200 dark:border-dark-700 pb-2">
                                    <span className="text-xs text-dark-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Exclusion Triggered</span>
                                    <span className={`text-xs font-bold ${claimStatus === 'success' ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'}`}>{claimStatus === 'success' ? 'False' : 'True'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-dark-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Risk Score Used</span>
                                    <span className="text-xs font-bold text-dark-800 dark:text-white">{worker?.riskScore || 0.5} / 1.0</span>
                                </div>
                            </div>

                            <div className="text-left mt-1">
                                <span className="text-[10px] text-dark-400 dark:text-slate-500 font-bold uppercase tracking-widest block mb-1">Reason for Decision</span>
                                <p className={`text-sm p-3 rounded-lg border font-semibold ${claimStatus === 'success' ? 'bg-success-50 dark:bg-success-500/10 border-success-200 dark:border-success-500/30 text-success-700 dark:text-success-400' : 'bg-danger-50 dark:bg-danger-500/10 border-danger-200 dark:border-danger-500/30 text-danger-700 dark:text-danger-400'}`}>
                                    {claimExplanation}
                                </p>
                            </div>

                            <button onClick={() => setShowClaimModal(false)} className="w-full mt-6 btn-primary py-3 justify-center">
                                Close Window
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm text-dark-500 dark:text-dark-400 italic border-l-4 border-primary-500 pl-3">
                            "AI Auto-fill is active. GPS, Timestamp and Weather APIs will be attached to your submission."
                        </p>

                        <div>
                            <label className="text-xs font-bold text-dark-500 dark:text-dark-400 mb-2 block uppercase tracking-wider">Incident Type</label>
                            <div className="grid grid-cols-2 gap-2">
                                {['Accident', 'Rain', 'Pandemic', 'War'].map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => setClaimReason(opt)}
                                        className={`p-3 rounded-xl border-2 text-sm font-bold transition-all ${claimReason === opt ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300' : 'border-dark-200 dark:border-dark-700 text-dark-600 dark:text-dark-300'}`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-dark-500 dark:text-dark-400 mb-2 mt-4 block uppercase tracking-wider">Evidence Upload</label>
                            <div className="border-2 border-dashed border-dark-200 dark:border-dark-700 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-dark-50 dark:hover:bg-dark-800 transition-colors">
                                <Camera className="w-8 h-8 text-dark-400" />
                                <span className="text-xs text-dark-500 font-bold">Tap to capture photo</span>
                            </div>
                        </div>

                        <button
                            onClick={() => submitClaim(claimReason || 'Accident')}
                            className="w-full btn-primary py-3 justify-center mt-4"
                        >
                            Submit & Run AI Audit
                        </button>
                    </div>
                )}
            </Modal>
        </div>
    );
}
