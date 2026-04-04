import {
    Activity,
    ArrowLeft,
    ArrowRight,
    Award,
    Camera,
    Check,
    CheckCircle2,
    CloudRain,
    LayoutDashboard,
    LogOut,
    MapPin,
    Navigation,
    PlusCircle,
    ShieldAlert,
    ShieldCheck,
    TrendingUp,
    User,
    Wallet,
    Zap,
    Edit2,
    DollarSign,
    Clock,
    Truck,
    Star,
    AlertTriangle,
    CheckCircle,
    Locate
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import { aiService } from '../services/aiService';
import { userApi } from '../api/userApi';
import { riskApi } from '../api/riskApi';
import { insuranceApi } from '../api/insuranceApi';
import api from '../services/api';
import { authHttp } from '../services/httpClient';
import useStore from '../store/useStore';
import { formatCurrency } from '../utils/helpers';
import { evaluateClaim } from '../utils/rulesEngine';
import WorkerPolicyPage from './WorkerPolicyPage';
import AutoClaimFeed from '../components/AutoClaimFeed';
import ImpactScoreDisplay from '../components/worker/ImpactScoreDisplay';
import TrustBadges from '../components/worker/TrustBadges';
import RiskPanel from '../components/worker/RiskPanel';
import WhyProtectedSection from '../components/worker/WhyProtectedSection';
import RiskAssistant from '../components/worker/RiskAssistant';
import PlanSelectionModal from '../components/worker/PlanSelectionModal';

export default function WorkerApp() {
    const navigate = useNavigate();
    const { user, getPoliciesByWorkerId, getClaimsByWorkerId, addClaim, logout } = useStore();
    const [activeTab, setActiveTab] = useState('dashboard');

    const [profileData, setProfileData] = useState(null);
    const [profileLoading, setProfileLoading] = useState(false);
    const [editingProfile, setEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({ name: '', platform: '', email: '' });

    const [showClaimModal, setShowClaimModal] = useState(false);
    const [claimStatus, setClaimStatus] = useState(null); // 'input' | 'submitting' | 'success' | 'rejected'
    const [claimReason, setClaimReason] = useState(null);
    const [claimExplanation, setClaimExplanation] = useState('');

    const [sosActive, setSosActive] = useState(false);
    const [showExplainable, setShowExplainable] = useState(false);
    const [activeAlert, setActiveAlert] = useState(null);
    const [aiExplanation, setAiExplanation] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);

    const [liveRisk, setLiveRisk] = useState({ score: 85, factors: [] });
    const [locationRisk, setLocationRisk] = useState(null);
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationError, setLocationError] = useState(null);
    const [insuranceResult, setInsuranceResult] = useState(null);
    const [insuranceLoading, setInsuranceLoading] = useState(false);
    
    // New state for enhanced UI
    const [riskForecast, setRiskForecast] = useState(null);
    const [riskLoading, setRiskLoading] = useState(false);
    const [workerImpactScore, setWorkerImpactScore] = useState(82);
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [planChanging, setPlanChanging] = useState(false);
    const [dbPolicies, setDbPolicies] = useState([]);

    // Live Alert System
    useEffect(() => {
        const alerts = [
            "⚠️ High risk zone nearby (Andheri West)",
            "🚨 Heavy rain incoming in 15 mins",
            "🛡️ Protection enabled for night shift"
        ];
        const timer = setTimeout(() => {
            setActiveAlert(alerts[Math.floor(Math.random() * alerts.length)]);
            setTimeout(() => setActiveAlert(null), 5000);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    // Get worker data from localStorage or user object
    const storedWorker = JSON.parse(localStorage.getItem('currentWorker') || 'null');
    const worker = storedWorker || user?.worker || { 
      id: user?.workerId || user?.id, 
      riskScore: user?.riskScore || 0.52, 
      weeklyEarnings: user?.weeklyEarnings || 4500, 
      city: user?.city || 'Mumbai',
      name: user?.name || 'Worker',
      plan: 'Standard',
      deliveryPlatform: 'Zomato'
    };
    const policies = getPoliciesByWorkerId(worker.id);
    const activePolicy = policies.find(p => p.status === 'Active') || policies[0] || { planType: 'Standard', premium: 49 };
    const workerClaims = getClaimsByWorkerId(worker.id);

    // Gamification & Risk State
    const safetyScore = liveRisk.score;
    const safetyDiscount = safetyScore > 80 ? 5 : 0;

    // AI States
    const [realTimeAlert, setRealTimeAlert] = useState("Loading live parametric sensor data...");
    const [twinPrediction, setTwinPrediction] = useState("AI is predicting risk trajectory based on historical patterns...");

    const fetchLocationRisk = () => {
        if (!navigator.geolocation) {
            setLocationError('Geolocation not supported');
            return;
        }
        setLocationLoading(true);
        setLocationError(null);
        
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const res = await riskApi.calculateRisk({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude,
                        isWorking: profileData?.isWorking || false
                    });
                    if (res.success) {
                        setLocationRisk(res.data);
                    }
                } catch (err) {
                    setLocationError('Failed to calculate risk');
                } finally {
                    setLocationLoading(false);
                }
            },
            (err) => {
                setLocationError(err.message);
                setLocationLoading(false);
            }
        );
    };

    const getRiskLevel = (score) => {
        if (score < 40) return { label: 'Low', color: 'text-success-400' };
        if (score <= 70) return { label: 'Medium', color: 'text-warning-400' };
        return { label: 'High', color: 'text-danger-400' };
    };

    const fetchRiskForecast = async () => {
        setRiskLoading(true);
        try {
            const workerCity = profileData?.city || 'Hyderabad';
            const res = await authHttp.get(`/workers/risk?city=${workerCity}`);
            if (res.data) {
                setRiskForecast(res.data);
                setWorkerImpactScore(Math.floor(50 + Math.random() * 40));
            }
        } catch (err) {
            console.error('Risk forecast fetch failed:', err);
            setRiskForecast(null);
        } finally {
            setRiskLoading(false);
        }
    };

    const handlePlanChange = async (newPlan) => {
        if (!worker?.id) {
            console.error('No worker ID found');
            alert('Worker ID not found. Please login again.');
            return;
        }
        console.log('Attempting to change plan:', { workerId: worker.id, plan: newPlan });
        setPlanChanging(true);
        try {
            const res = await authHttp.put(`/workers/${worker.id}/plan`, { planType: newPlan });
            console.log('Plan change response:', res);
            if (res.data?.success) {
                // Save to localStorage
                const storedWorker = JSON.parse(localStorage.getItem('currentWorker') || '{}');
                localStorage.setItem('currentWorker', JSON.stringify({ ...storedWorker, plan: newPlan }));
                
                // Fetch updated policies from DB
                const policiesRes = await api.fetchWorkerPolicies(worker.id);
                if (policiesRes?.data) {
                    setDbPolicies(policiesRes.data);
                }
                
                setShowPlanModal(false);
            }
        } catch (err) {
            console.error('Plan change failed:', err);
            const errorMsg = err.response?.data?.error || err.message || 'Unknown error';
            alert('Failed to change plan: ' + errorMsg);
        } finally {
            setPlanChanging(false);
        }
    };

    // Fetch policies from database and check if worker needs to select plan
    useEffect(() => {
        const checkWorkerPolicy = async () => {
            if (!worker?.id) {
                console.log('[PlanCheck] No worker ID, skipping policy check');
                return;
            }
            
            console.log('[PlanCheck] Checking policies for worker:', worker.id);
            
            try {
                const policiesRes = await api.fetchWorkerPolicies(worker.id);
                console.log('[PlanCheck] API Response:', policiesRes);
                
                const policies = policiesRes?.data || [];
                console.log('[PlanCheck] Policies found:', policies.length);
                
                setDbPolicies(policies);
                
                // Check if worker has an active policy
                const hasActivePolicy = policies.some(p => p.status === 'Active');
                console.log('[PlanCheck] Has active policy:', hasActivePolicy);
                
                // Show plan modal only if no active policy
                if (!hasActivePolicy) {
                    console.log('[PlanCheck] Showing plan modal - no active policy');
                    setShowPlanModal(true);
                } else {
                    console.log('[PlanCheck] NOT showing modal - has active policy');
                }
            } catch (err) {
                console.error('[PlanCheck] API Error:', err);
                // If API error (like 401), don't show modal - user might have auth issue
                // Only show modal if it's a network error or similar
                if (err.response?.status === 401) {
                    console.log('[PlanCheck] Auth error, not showing modal');
                } else {
                    console.log('[PlanCheck] Network error, showing modal');
                    setShowPlanModal(true);
                }
            }
        };
        
        checkWorkerPolicy();
    }, [worker?.id]);

    const calculateInsurance = (claimType) => {
        if (!navigator.geolocation) {
            alert('Geolocation not supported');
            return;
        }
        setInsuranceLoading(true);
        
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const res = await insuranceApi.calculate({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude,
                        isWorking: profileData?.isWorking || false,
                        claimType
                    });
                    if (res.success) {
                        setInsuranceResult(res.data);
                    }
                } catch (err) {
                    console.error('Insurance calculation failed:', err);
                } finally {
                    setInsuranceLoading(false);
                }
            },
            (err) => {
                alert('Location access denied');
                setInsuranceLoading(false);
            }
        );
    };


    useEffect(() => {
        if (worker?.id && worker?.riskScore) {
            setLiveRisk({ 
                score: Math.round((1 - worker.riskScore) * 100), 
                factors: [] 
            });
        }
    }, [worker?.id, worker?.riskScore]);

    // Fetch profile data when profile tab is active
    useEffect(() => {
        if ((activeTab === 'profile' || activeTab === 'dashboard') && user?.phone) {
            fetchProfileData();
        }
    }, [activeTab, user?.phone]);

    // Live earnings simulation when working
    useEffect(() => {
        if (profileData?.isWorking) {
            const earningsInterval = setInterval(() => {
                simulateEarnings();
            }, 30000); // Every 30 seconds (realistic for per-minute earnings)
            return () => clearInterval(earningsInterval);
        }
    }, [profileData?.isWorking, locationRisk?.riskScore]);

    const fetchProfileData = async () => {
        if (!user?.phone) return;
        setProfileLoading(true);
        try {
            const res = await userApi.getUser(user.phone);
            if (res.success) {
                setProfileData(res.data);
                setProfileForm({ name: res.data.name, platform: res.data.platform || 'Zomato', email: res.data.email || '' });
            }
        } catch (e) {
            console.error('Failed to fetch profile:', e);
        } finally {
            setProfileLoading(false);
        }
    };

    const simulateEarnings = async () => {
        if (!profileData?.isWorking || !profileData?.id) return;
        try {
            const hour = new Date().getHours();
            const day = new Date().getDay();
            
            let amount = Math.random() * 10 + 5; // Base ₹5-15 per 30 seconds (₹10-30/min realistic)
            
            // Night shift bonus (8pm - 6am)
            if (hour >= 20 || hour < 6) {
                amount *= 1.25;
            }
            
            // Weekend bonus (Sat-Sun)
            if (day === 0 || day === 6) {
                amount *= 1.15;
            }
            
            // Rain/surge bonus (if high risk)
            if (locationRisk?.riskScore > 60) {
                amount *= 1.20;
            }
            
            const res = await userApi.updateEarnings(profileData.id, amount, null);
            if (res.success) setProfileData(res.data);
        } catch (e) { console.error('Earnings update failed:', e); }
    };

    const handleToggleWork = async () => {
        if (!profileData?.id) return;
        try {
            const res = await userApi.toggleWork(profileData.id, !profileData.isWorking);
            if (res.success) setProfileData(res.data);
        } catch (e) { console.error('Work toggle failed:', e); }
    };

    // Auto delivery simulation
    useEffect(() => {
        if (!profileData?.isWorking || !profileData?.id) return;
        
        const triggerAutoDelivery = () => {
            const randomDelay = Math.random() * 600000 + 300000; // 5-10 minutes between deliveries
            return setTimeout(async () => {
                if (!profileData?.isWorking || !profileData?.id) return;
                try {
                    const res = await userApi.completeDelivery(profileData.id);
                    if (res.success) {
                        setProfileData(prev => ({
                            ...prev,
                            todayEarnings: res.data.todayEarnings,
                            totalEarnings: res.data.totalEarnings,
                            deliveries: res.data.deliveries
                        }));
                    }
                } catch (e) { console.error('Auto delivery failed:', e); }
            }, randomDelay);
        };
        
        const timeoutId = triggerAutoDelivery();
        return () => clearTimeout(timeoutId);
    }, [profileData?.isWorking, profileData?.id]);

    const handleSaveProfile = async () => {
        if (!profileData?.id) return;
        setProfileLoading(true);
        try {
            const res = await userApi.updateProfile(profileData.id, profileForm.name, profileForm.platform, profileForm.email);
            if (res.success) {
                setProfileData(res.data);
                setEditingProfile(false);
            }
        } catch (e) { console.error('Profile update failed:', e); }
        finally { setProfileLoading(false); }
    };

    const getRiskBadge = (score) => {
        if (score < 0.4) return { label: 'Safe', color: 'text-success-400 bg-success-500/20', icon: CheckCircle };
        if (score < 0.7) return { label: 'Medium', color: 'text-warning-400 bg-warning-500/20', icon: AlertTriangle };
        return { label: 'High', color: 'text-danger-400 bg-danger-500/20', icon: AlertTriangle };
    };

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

    const handleSOS = async () => {
        if (!profileData?.isWorking) {
            alert('Please start working first to use SOS!');
            return;
        }
        
        const lastSOS = localStorage.getItem('lastSOS');
        if (lastSOS) {
            const hoursSince = (Date.now() - parseInt(lastSOS)) / (1000 * 60 * 60);
            if (hoursSince < 24) {
                alert(`SOS cooldown active. You can use SOS again in ${Math.round(24 - hoursSince)} hours.`);
                return;
            }
        }
        
        setSosActive(true);
        localStorage.setItem('lastSOS', Date.now().toString());
        
        try {
            const claimData = {
                worker_id: worker.id,
                trigger_type: 'Emergency',
                payout_amount: 5000,
                trigger_data: {
                    type: 'SOS',
                    location: worker.city,
                    timestamp: new Date().toISOString()
                }
            };
            await api.submitClaim(claimData);
        } catch (error) {
            console.error('SOS Claim creation failed:', error);
        }
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
            workerId: worker.id,
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
        { id: 'profile', icon: User, label: 'Profile' },
        { id: 'exit', icon: LogOut, label: 'Exit' },
    ];

    // Story Mode State
    const [storyMode, setStoryMode] = useState({
        active: false,
        step: 0,
        showDecision: false,
        activeGig: false,
        sessionId: null,
        rawDescription: '',
        aiAnalyzing: false,
        aiFeedback: ''
    });

    const handleGetAIExplanation = async () => {
        if (aiExplanation) {
            setShowExplainable(!showExplainable);
            return;
        }

        setAiLoading(true);
        setShowExplainable(true);
        try {
            const explanation = await aiService.getAIExplanation({
                risk: safetyScore || 50,
                status: safetyScore > 70 ? 'approved' : 'pending',
                reason: safetyScore > 70 ? 'Low risk score indicates automatic approval' : 'Moderate risk score requires review'
            });
            setAiExplanation(explanation);
        } catch (error) {
            setAiExplanation("AI service is temporarily unavailable. Based on your policy, you are protected during heavy rain events.");
        } finally {
            setAiLoading(false);
        }
    };

    const runStoryMode = () => {
        setStoryMode({ active: true, step: 1, showDecision: false });
        // 1. Worker Riding
        setTimeout(() => setStoryMode(prev => ({ ...prev, step: 2 })), 2500); // 2. Weather Change
        setTimeout(() => setStoryMode(prev => ({ ...prev, step: 3 })), 5000); // 3. Risk Increases
        setTimeout(() => setStoryMode(prev => ({ ...prev, step: 4 })), 7500); // 4. Claim Triggered
        setTimeout(() => {
            setStoryMode(prev => ({ ...prev, step: 5, showDecision: true })); // 5. Decision Show
            setClaimReason('Rain');
            submitClaim('Rain');
            setShowClaimModal(true);
        }, 10000);
        setTimeout(() => setStoryMode({ active: false, step: 0, showDecision: false }), 15000);
    };

    const getEmotionalFeedback = () => {
        if (safetyScore > 75) return { text: "You are safe today 🌿", sub: `You saved ₹${safetyDiscount * 4} this month`, color: "text-success-400", bg: "bg-success-900/30", border: 'border-success-500/30' };
        if (safetyScore < 45) return { text: "High risk detected ⚠️", sub: "Drive carefully to avoid premium strike", color: "text-danger-400", bg: "bg-danger-900/30", border: 'border-danger-500/30' };
        return { text: "Your day looks normal ☀️", sub: "Focus on the road", color: "text-primary-400", bg: "bg-primary-900/30", border: 'border-primary-500/30' };
    };
    const emoFeedback = getEmotionalFeedback();

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 antialiased font-sans flex flex-col items-center">
            {/* Mobile Frame Simulation on Desktop */}
            <div className="w-full max-w-md min-h-screen bg-dark-900 border-x border-slate-800 shadow-2xl relative flex flex-col pb-24 overflow-x-hidden">

                {/* Top Header */}
                <div className="p-4 flex items-center justify-between bg-dark-900 sticky top-0 z-20 border-b border-dark-800">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center text-white font-black italic">GS</div>
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
                                localStorage.removeItem('currentWorker');
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

                {activeAlert && (
                    <div className="absolute top-20 inset-x-4 z-50 animate-bounce-in">
                        <div className="bg-primary-600/90 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl border border-white/20 flex items-center justify-between">
                            <span className="text-xs font-bold">{activeAlert}</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></div>
                        </div>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto scrollbar-none">
                    {/* TAB: DASHBOARD */}
                    {activeTab === 'dashboard' && (
                        <div className="p-5 space-y-5 animate-fade-in relative">
                            {/* Story Mode Overlay */}
                            {storyMode.active && (
                                <div className="absolute inset-0 z-50 bg-dark-900/80 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center text-center p-6 animate-fade-in">
                                    <h3 className="text-primary-500 font-black uppercase tracking-widest mb-6">Demo / Story Mode</h3>

                                    <div className="space-y-4 w-full">
                                        <div className={`p-3 rounded-xl border transition-all ${storyMode.step >= 1 ? 'border-primary-500 bg-primary-900/50 text-white' : 'border-dark-700 bg-dark-800 text-dark-500'}`}>
                                            1. Worker is riding to destination 🛵
                                        </div>
                                        <div className={`p-3 rounded-xl border transition-all ${storyMode.step >= 2 ? 'border-warning-500 bg-warning-900/50 text-white' : 'border-dark-700 bg-dark-800 text-dark-500'}`}>
                                            2. Sudden Heavy Rain Detected 🌧️
                                        </div>
                                        <div className={`p-3 rounded-xl border transition-all ${storyMode.step >= 3 ? 'border-danger-500 bg-danger-900/50 text-white' : 'border-dark-700 bg-dark-800 text-dark-500'}`}>
                                            3. Risk Multiplier Increased! ⚠️
                                        </div>
                                        <div className={`p-3 rounded-xl border transition-all ${storyMode.step >= 4 ? 'border-success-500 bg-success-900/50 text-white' : 'border-dark-700 bg-dark-800 text-dark-500'}`}>
                                            4. Parametric Claim Auto-Triggered ⚡
                                        </div>
                                    </div>
                                    <div className="mt-8">
                                        {storyMode.step < 5 && <div className="w-8 h-8 rounded-full border-4 border-primary-500 border-t-transparent animate-spin mx-auto"></div>}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <p className="text-xl text-white font-bold tracking-tight">Hi, {worker?.name.split(' ')[0]} 👋</p>
                                <button onClick={runStoryMode} className="bg-primary-500/20 text-primary-400 border border-primary-500/30 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-primary-500/40 transition">
                                    ▶ Run Scenario
                                </button>
                            </div>

                            {/* Emotional Feedback & Confidence Badge */}
                            <div className="flex flex-col gap-3">
                                <div className={`p-4 rounded-3xl border ${emoFeedback.bg} ${emoFeedback.border} flex flex-col justify-center items-center text-center shadow-lg transition-all hover:scale-[1.02] active:scale-95 cursor-pointer`}>
                                    <h3 className={`text-xl font-black ${emoFeedback.color}`}>{emoFeedback.text}</h3>
                                    <p className="text-xs text-white/70 font-bold tracking-wide mt-1">{emoFeedback.sub}</p>
                                </div>
                                <div className="flex items-center justify-between px-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${safetyScore > 70 ? 'bg-success-500' : 'bg-warning-500'} animate-pulse`}></div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-dark-400">Protection Confidence</span>
                                    </div>
                                    <span className={`text-xs font-black ${safetyScore > 70 ? 'text-success-400' : 'text-warning-400'}`}>{safetyScore + 10}%</span>
                                </div>
                            </div>

                            {/* Pay-As-You-Work (PAYW) Coverage Toggle */}
                            <div className="bg-gradient-to-r from-indigo-800 to-purple-900 rounded-3xl p-6 border border-indigo-400/30 shadow-xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                    <ShieldCheck className="w-20 h-20 text-white" />
                                </div>
                                    <div className="flex items-center justify-between relative z-10">
                                    <div>
                                        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-1">Coverage Control</h3>
                                        <p className="text-[10px] text-indigo-300 font-bold mb-4 italic">Only pay while you work.</p>
                                        <div className="flex gap-4">
                                            <div>
                                                <p className="text-[10px] text-white/50 uppercase font-black mb-1">Status</p>
                                                <div className="flex items-center gap-1.5">
                                                    <div className={`w-2 h-2 rounded-full ${profileData?.isWorking ? 'bg-success-500 animate-pulse' : 'bg-slate-500'}`}></div>
                                                    <span className={`text-xs font-black ${profileData?.isWorking ? 'text-success-400' : 'text-slate-400'}`}>
                                                        {profileData?.isWorking ? 'LIVE PROTECTED' : 'COVERAGE OFF'}
                                                    </span>
                                                </div>
                                            </div>
                                            {profileData?.isWorking && (
                                                <>
                                                    <div>
                                                        <p className="text-[10px] text-white/50 uppercase font-black mb-1">Today's Earnings</p>
                                                        <span className="text-xs font-black text-success-400">₹{(profileData?.todayEarnings || 0).toFixed(0)}</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-white/50 uppercase font-black mb-1">Deliveries</p>
                                                        <span className="text-xs font-black text-primary-400">{profileData?.deliveries || 0}</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleToggleWork}
                                        className={`w-14 h-8 rounded-full relative transition-all duration-500 border-2 ${profileData?.isWorking ? 'bg-success-600 border-success-400' : 'bg-slate-700 border-slate-600'}`}
                                    >
                                        <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-md ${profileData?.isWorking ? 'left-7' : 'left-1'}`}></div>
                                    </button>
                                </div>
                            </div>

                            {/* Delivery Simulation */}
                            {profileData?.isWorking && (
                                <div className="bg-dark-800/50 border border-dark-700 rounded-2xl p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-bold text-white uppercase">Delivery Simulator</h3>
                                        <span className="text-[10px] text-white/50">Auto: 5-10 min</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={async () => {
                                                if (!profileData?.id) return;
                                                const res = await userApi.completeDelivery(profileData.id);
                                                if (res.success) {
                                                    setProfileData(prev => ({
                                                        ...prev,
                                                        todayEarnings: res.data.todayEarnings,
                                                        totalEarnings: res.data.totalEarnings,
                                                        deliveries: res.data.deliveries
                                                    }));
                                                }
                                            }}
                                            className="flex-1 bg-success-500/20 border border-success-500/30 text-success-400 text-xs font-bold py-2 rounded-lg hover:bg-success-500/30 transition"
                                        >
                                            🚴 Complete Delivery
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (!profileData?.id) return;
                                                for (let i = 0; i < 5; i++) {
                                                    const res = await userApi.completeDelivery(profileData.id);
                                                    if (res.success) {
                                                        setProfileData(prev => ({
                                                            ...prev,
                                                            todayEarnings: res.data.todayEarnings,
                                                            totalEarnings: res.data.totalEarnings,
                                                            deliveries: res.data.deliveries
                                                        }));
                                                    }
                                                }
                                            }}
                                            className="bg-primary-500/20 border border-primary-500/30 text-primary-400 text-xs font-bold px-3 py-2 rounded-lg hover:bg-primary-500/30 transition"
                                        >
                                            ⚡x5
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Real-time Risk Meter */}
                            <div className="bg-dark-800/50 border border-dark-700 rounded-2xl p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Locate className="w-4 h-4 text-primary-400" />
                                        <span className="text-xs font-bold text-white uppercase">Live Risk</span>
                                    </div>
                                    {locationLoading ? (
                                        <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <button onClick={fetchLocationRisk} className="text-[10px] text-primary-400 hover:text-primary-300 font-bold uppercase">
                                            Refresh
                                        </button>
                                    )}
                                </div>
                                {locationRisk ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-3 bg-dark-700 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full transition-all duration-500 ${locationRisk.riskScore > 70 ? 'bg-danger-500' : locationRisk.riskScore > 40 ? 'bg-warning-500' : 'bg-success-500'}`}
                                                    style={{ width: `${locationRisk.riskScore}%` }}
                                                ></div>
                                            </div>
                                            <span className={`text-lg font-black ${getRiskLevel(locationRisk.riskScore).color}`}>
                                                {locationRisk.riskScore}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className={`text-xs font-bold uppercase ${getRiskLevel(locationRisk.riskScore).color}`}>
                                                {getRiskLevel(locationRisk.riskScore).label} Risk
                                            </span>
                                            {locationRisk.weather && (
                                                <span className="text-xs text-white/50">
                                                    {locationRisk.weather.condition} • {locationRisk.weather.temperature}°C
                                                </span>
                                            )}
                                        </div>
                                        {locationRisk.riskScore > 70 && (
                                            <div className="bg-danger-500/10 border border-danger-500/30 p-2 rounded-lg text-center">
                                                <span className="text-xs font-bold text-danger-400">⚠️ High risk detected. Drive carefully.</span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-2">
                                        <button 
                                            onClick={fetchLocationRisk}
                                            className="text-xs text-white/60 hover:text-white font-medium"
                                        >
                                            {locationError || 'Tap to get your location risk'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Auto-Claim Feed - Shows AI-filed claims when triggers fire */}
                            <AutoClaimFeed />

                            {/* Trust Badges */}
                            <TrustBadges />

                            {/* Impact Score Display */}
                            <ImpactScoreDisplay score={workerImpactScore} />

                            {/* Real-Time Risk Panel */}
                            <RiskPanel riskData={riskForecast} loading={riskLoading} onRefresh={fetchRiskForecast} />

                            {/* Why Protected Section */}
                            <WhyProtectedSection />

                            {/* Earnings Summary */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-dark-800 border border-dark-700 p-3 rounded-2xl text-center">
                                    <p className="text-[10px] text-white/50 mb-1">Today</p>
                                    <p className="text-white font-bold text-sm">₹{(profileData?.todayEarnings || 0).toFixed(0)}</p>
                                </div>
                                <div className="bg-dark-800 border border-dark-700 p-3 rounded-2xl text-center">
                                    <p className="text-[10px] text-white/50 mb-1">Weekly</p>
                                    <p className="text-white font-bold text-sm">₹{(profileData?.weeklyEarnings || 0).toLocaleString()}</p>
                                </div>
                                <div className="bg-dark-800 border border-dark-700 p-3 rounded-2xl text-center">
                                    <p className="text-[10px] text-white/50 mb-1">Total</p>
                                    <p className="text-white font-bold text-sm">₹{(profileData?.totalEarnings || 0).toLocaleString()}</p>
                                </div>
                            </div>

                            {/* AI Risk Assistant & Explainable Section */}
                            <div className="space-y-3">
                                <div className="bg-primary-500/10 border border-primary-500/20 rounded-3xl p-5 flex flex-col transition-all hover:bg-primary-500/15 group relative overflow-hidden">
                                    <div className="flex gap-4">
                                        <Zap className="w-8 h-8 text-primary-400 flex-shrink-0 animate-pulse" />
                                        <div className="flex-1">
                                            <h3 className="text-sm font-bold text-primary-400 mb-1">AI Risk Assistant</h3>
                                            <p className="text-xs text-slate-300 leading-relaxed font-medium">
                                                {realTimeAlert}
                                                <strong className="text-white block mt-1">Keep driving safely to maintain discounts.</strong>
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleGetAIExplanation}
                                        disabled={aiLoading}
                                        className="mt-4 text-[10px] font-black uppercase tracking-widest text-primary-500 flex items-center gap-1 hover:text-primary-400 transition disabled:opacity-50"
                                    >
                                        {aiLoading ? 'AI is thinking...' : (showExplainable ? 'Hide Details' : 'Why am I protected?')}
                                        {!aiLoading && <ArrowRight className={`w-3 h-3 transition-transform ${showExplainable ? 'rotate-90' : ''}`} />}
                                    </button>

                                    {showExplainable && (
                                        <div className="mt-4 pt-4 border-t border-primary-500/20 animate-slide-down">
                                            {aiLoading ? (
                                                <div className="flex items-center gap-2 py-2">
                                                    <div className="w-3 h-3 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                                                    <span className="text-[10px] text-slate-400 uppercase font-black">AI is analyzing policy clauses...</span>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    <p className="text-[11px] text-slate-300 leading-relaxed font-medium italic pr-4">
                                                        "{aiExplanation}"
                                                    </p>
                                                    <div className="bg-success-500/10 p-2 rounded-lg text-center">
                                                        <span className="text-[10px] font-black text-success-500 uppercase tracking-widest">Protection Active ✅</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Event Timeline */}
                            <div className="bg-dark-800/50 rounded-3xl p-6 border border-dark-700">
                                <h3 className="text-[10px] font-black text-dark-500 uppercase tracking-[0.2em] mb-6">Smart Event Timeline</h3>
                                <div className="space-y-6">
                                    {[
                                        { icon: CloudRain, title: "Rain Detected", time: "10:04 AM", color: "text-primary-400", bg: "bg-primary-500/10" },
                                        { icon: TrendingUp, title: "Risk Increased", time: "10:06 AM", color: "text-warning-400", bg: "bg-warning-500/10" },
                                        { icon: Check, title: "Protection Activated", time: "10:06 AM", color: "text-success-400", bg: "bg-success-500/10" }
                                    ].map((event, i) => (
                                        <div key={i} className="flex gap-4 relative">
                                            {i !== 2 && <div className="absolute left-4 top-8 bottom-0 w-px bg-dark-700"></div>}
                                            <div className={`w-8 h-8 rounded-full ${event.bg} flex items-center justify-center shrink-0 border border-dark-700`}>
                                                <event.icon className={`w-4 h-4 ${event.color}`} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-white leading-none mb-1">{event.title}</p>
                                                <p className="text-[10px] text-dark-500">{event.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Ledger Summary */}
                            <div>
                                <div className="flex justify-between items-end mb-3">
                                    <h3 className="text-sm font-bold text-white tracking-tight">Recent Activity</h3>
                                    <span className="text-[10px] text-primary-400 uppercase font-bold cursor-pointer hover:underline" onClick={() => setActiveTab('claims')}>View All</span>
                                </div>
                                <div className="space-y-2">
                                    {ledger.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between p-3.5 bg-dark-800/40 rounded-2xl border border-dark-700 hover:bg-dark-700 hover:border-primary-500/30 transition-all cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.type === 'credit' ? 'bg-success-500/10 text-success-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-slate-700/50 text-slate-400'}`}>
                                                    {item.type === 'credit' ? <Wallet className="w-5 h-5" /> : <div className="font-bold text-sm">-</div>}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-white max-w-[120px] truncate">{item.label}</p>
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
                        <div className="animate-fade-in -mt-4">
                            <WorkerPolicyPage onAction={(tab) => setActiveTab(tab)} />
                        </div>
                    )}

                    {/* TAB: CLAIMS (FNOL) */}
                    {activeTab === 'claims' && (
                        <div className="p-5 space-y-5 animate-fade-in">
                            <h2 className="text-lg font-bold text-white">Claims Center</h2>

                            <div className="bg-dark-800 border border-dark-700 rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Zap className="w-4 h-4 text-primary-400 animate-pulse" />
                                    <p className="text-sm font-bold text-white uppercase tracking-wider">Auto-Filed Claims</p>
                                </div>
                                <p className="text-xs text-white/60 mb-4">Claims are automatically filed when extreme weather triggers are detected in your area.</p>
                                <AutoClaimFeed />
                            </div>

                            {/* Smart Insurance Decision */}
                            <div className="bg-dark-800 border border-dark-700 rounded-2xl p-5">
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-primary-400" />
                                    Smart Insurance Decision
                                </h3>
                                
                                {insuranceLoading ? (
                                    <div className="flex items-center justify-center py-4">
                                        <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                                        <span className="ml-2 text-xs text-white/60">Calculating...</span>
                                    </div>
                                ) : insuranceResult ? (
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center p-3 bg-dark-900/50 rounded-xl">
                                            <span className="text-xs text-white/60">Risk Score</span>
                                            <span className={`text-lg font-black ${getRiskLevel(insuranceResult.riskScore).color}`}>
                                                {insuranceResult.riskScore} ({getRiskLevel(insuranceResult.riskScore).label})
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-dark-900/50 rounded-xl">
                                            <span className="text-xs text-white/60">Premium</span>
                                            <span className="text-lg font-bold text-white">₹{insuranceResult.premium}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-dark-900/50 rounded-xl">
                                            <span className="text-xs text-white/60">Claim Status</span>
                                            <span className={`text-lg font-black ${insuranceResult.claimStatus === 'approved' ? 'text-success-400' : 'text-danger-400'}`}>
                                                {insuranceResult.claimStatus === 'approved' ? 'Approved' : 'Rejected'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-dark-900/50 rounded-xl">
                                            <span className="text-xs text-white/60">Payout</span>
                                            <span className="text-lg font-bold text-success-400">₹{insuranceResult.payout.toLocaleString()}</span>
                                        </div>
                                        {insuranceResult.weather && (
                                            <div className="text-xs text-white/40 text-center mt-2">
                                                {insuranceResult.weather.condition} • {insuranceResult.weather.temperature}°C
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <p className="text-xs text-white/60 mb-3">Test your insurance eligibility with different claim types:</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {['Rain', 'Heat', 'Storm', 'Flood'].map(type => (
                                                <button
                                                    key={type}
                                                    onClick={() => calculateInsurance(type)}
                                                    className="bg-primary-500/20 border border-primary-500/30 text-primary-400 text-xs font-bold py-2 rounded-lg hover:bg-primary-500/30 transition"
                                                >
                                                    Test {type}
                                                </button>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => calculateInsurance('war')}
                                            className="w-full bg-danger-500/10 border border-danger-500/20 text-danger-400 text-xs font-bold py-2 rounded-lg hover:bg-danger-500/20 transition"
                                        >
                                            Test Exclusion (War)
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB: PROFILE */}
                    {activeTab === 'profile' && (
                        <div className="p-5 space-y-5 animate-fade-in">
                            {profileLoading ? (
                                <div className="flex justify-center py-10">
                                    <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-lg font-bold text-white">My Profile</h2>
                                        <button onClick={() => setEditingProfile(true)} className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300">
                                            <Edit2 className="w-3 h-3" /> Edit
                                        </button>
                                    </div>

                                    {/* Profile Header */}
                                    <div className="bg-dark-800 border border-dark-700 p-5 rounded-2xl">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center text-white text-2xl font-bold">
                                                    {profileData?.name?.charAt(0) || user?.name?.charAt(0) || 'U'}
                                                </div>
                                                <div>
                                                    <p className="text-white font-bold text-lg">{profileData?.name || user?.name || 'Worker'}</p>
                                                    <p className="text-white/60 text-sm">{profileData?.phone || user?.phone}</p>
                                                </div>
                                            </div>
                                            {(() => {
                                                const risk = getRiskBadge(profileData?.riskScore || 0.5);
                                                const Icon = risk.icon;
                                                return (
                                                    <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${risk.color}`}>
                                                        <Icon className="w-3 h-3" /> {risk.label}
                                                    </span>
                                                );
                                            })()}
                                        </div>

                                        {/* Work Status - Reference to Dashboard */}
                                        <div className="flex items-center justify-between p-4 rounded-xl bg-dark-900/50 border border-dark-700">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-3 h-3 rounded-full ${profileData?.isWorking ? 'bg-success-500 animate-pulse' : 'bg-dark-500'}`}></div>
                                                <span className="text-white font-medium">
                                                    {profileData?.isWorking ? '● Working' : '○ Not Working'}
                                                </span>
                                            </div>
                                            <span className="text-xs text-white/50">Use dashboard toggle</span>
                                        </div>
                                    </div>

                                    {/* Earnings Cards */}
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="bg-dark-800 border border-dark-700 p-4 rounded-2xl">
                                            <div className="flex items-center gap-1 mb-1">
                                                <DollarSign className="w-3 h-3 text-success-400" />
                                                <span className="text-white/50 text-[10px]">Today</span>
                                            </div>
                                            <p className="text-white font-bold">₹{(profileData?.todayEarnings || 0).toLocaleString()}</p>
                                        </div>
                                        <div className="bg-dark-800 border border-dark-700 p-4 rounded-2xl">
                                            <div className="flex items-center gap-1 mb-1">
                                                <Clock className="w-3 h-3 text-primary-400" />
                                                <span className="text-white/50 text-[10px]">Weekly</span>
                                            </div>
                                            <p className="text-white font-bold">₹{(profileData?.weeklyEarnings || 0).toLocaleString()}</p>
                                        </div>
                                        <div className="bg-dark-800 border border-dark-700 p-4 rounded-2xl">
                                            <div className="flex items-center gap-1 mb-1">
                                                <TrendingUp className="w-3 h-3 text-warning-400" />
                                                <span className="text-white/50 text-[10px]">Total</span>
                                            </div>
                                            <p className="text-white font-bold">₹{(profileData?.totalEarnings || 0).toLocaleString()}</p>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="bg-dark-800 border border-dark-700 p-5 rounded-2xl">
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center py-2 border-b border-dark-700">
                                                <span className="text-white/60 text-sm flex items-center gap-2"><Truck className="w-4 h-4" /> Platform</span>
                                                <span className="text-white font-bold">{profileData?.platform || worker?.deliveryPlatform || 'Zomato'}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-dark-700">
                                                <span className="text-white/60 text-sm flex items-center gap-2"><Star className="w-4 h-4" /> Rating</span>
                                                <span className="text-white font-bold">{profileData?.rating || worker?.avgRating || 4.5} ★</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2">
                                                <span className="text-white/60 text-sm flex items-center gap-2"><Award className="w-4 h-4" /> Deliveries</span>
                                                <span className="text-white font-bold">{profileData?.deliveries || worker?.totalDeliveries || 0}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Plan Info */}
                                    <div className="bg-dark-800 border border-dark-700 p-5 rounded-2xl">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-white/50 text-xs uppercase mb-1">Current Plan</p>
                                                <p className="text-white font-bold text-lg">{activePolicy?.planType || 'Standard'}</p>
                                                <p className="text-success-400 text-sm">₹{activePolicy?.premium || 49}/week • ₹{activePolicy?.maxPayout || 5000} coverage</p>
                                            </div>
                                            <button 
                                                onClick={() => setShowPlanModal(true)}
                                                className="px-4 py-2 bg-primary-500/20 text-primary-400 border border-primary-500/30 rounded-xl text-sm font-bold hover:bg-primary-500/30 transition"
                                            >
                                                Change Plan
                                            </button>
                                        </div>
                                    </div>

                                    {/* AI Insight */}
                                    <div className="bg-gradient-to-r from-primary-900/50 to-purple-900/50 border border-primary-500/30 p-4 rounded-2xl">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Activity className="w-4 h-4 text-primary-400" />
                                            <span className="text-primary-400 text-xs font-bold uppercase">AI Insight</span>
                                        </div>
                                        <p className="text-white/80 text-sm">
                                            {profileData?.isWorking 
                                                ? "You're earning steadily. Keep up the momentum to maximize weekly earnings!" 
                                                : "Start working to build your earnings history and improve your risk profile."}
                                        </p>
                                    </div>
                                </>
                            )}
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
                                    logout();
                                    localStorage.removeItem('currentWorker');
                                    navigate('/login');
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
                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-500/30 rounded-2xl">
                            <h3 className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Zap className="w-4 h-4" /> ✨ AI Instant Fill
                            </h3>
                            <textarea
                                className="w-full bg-white dark:bg-dark-900 border border-indigo-200 dark:border-indigo-500/20 rounded-xl p-3 text-sm min-h-[80px] text-dark-800 dark:text-slate-200"
                                placeholder="Tell ZeroClaim what happened in your own words... (e.g. 'I slipped on a wet floor while delivering near Dadar')"
                                value={storyMode.rawDescription || ''}
                                onChange={(e) => setStoryMode(prev => ({ ...prev, rawDescription: e.target.value }))}
                            />
                            <button
                                onClick={async () => {
                                    setStoryMode(prev => ({ ...prev, aiAnalyzing: true }));
                                    const analysis = await aiService.analyzeClaim(storyMode.rawDescription);
                                    setClaimReason(analysis.incident_type === 'VEHICLE' ? 'Accident' : analysis.incident_type);
                                    setStoryMode(prev => ({ ...prev, aiAnalyzing: false, aiFeedback: analysis.brief_summary }));
                                }}
                                disabled={storyMode.aiAnalyzing || !storyMode.rawDescription}
                                className="mt-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase py-2 rounded-lg transition-colors disabled:opacity-50"
                            >
                                {storyMode.aiAnalyzing ? 'AI is analyzing...' : 'Use AI to fill form'}
                            </button>
                            {storyMode.aiFeedback && (
                                <p className="mt-2 text-[10px] text-indigo-500 font-bold italic">AI: {storyMode.aiFeedback}</p>
                            )}
                        </div>

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
                            onClick={() => {
                                setStoryMode(prev => ({ ...prev, rawDescription: '', aiFeedback: '' }));
                                submitClaim(claimReason || 'Accident');
                            }}
                            className="w-full btn-primary py-3 justify-center mt-4"
                        >
                            Submit & Run AI Audit
                        </button>
                    </div>
                )}
            </Modal>

            {/* Edit Profile Modal */}
            <Modal isOpen={editingProfile} onClose={() => setEditingProfile(false)} title="Edit Profile">
                <div className="space-y-4">
                    <div>
                        <label className="text-sm text-dark-400 mb-1 block">Name</label>
                        <input
                            type="text"
                            value={profileForm.name}
                            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-dark-700 bg-dark-800 text-white"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-dark-400 mb-1 block">Email</label>
                        <input
                            type="email"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-dark-700 bg-dark-800 text-white"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-dark-400 mb-1 block">Platform</label>
                        <select
                            value={profileForm.platform}
                            onChange={(e) => setProfileForm({ ...profileForm, platform: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-dark-700 bg-dark-800 text-white"
                        >
                            <option value="Zomato">Zomato</option>
                            <option value="Swiggy">Swiggy</option>
                        </select>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setEditingProfile(false)} className="flex-1 px-4 py-2 rounded-lg border border-dark-700 text-dark-400">
                            Cancel
                        </button>
                        <button onClick={handleSaveProfile} disabled={profileLoading} className="flex-1 btn-primary">
                            {profileLoading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>
            </Modal>

            <PlanSelectionModal 
                isOpen={showPlanModal} 
                onSelect={handlePlanChange}
                currentPlan={activePolicy?.planType}
            />
        </div >
    );
}
