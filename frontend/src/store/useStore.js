import { create } from 'zustand';
import {
  generateClaims,
  generatePolicies,
  generateWorkers,
  getAIInsights,
  getClaimsOverTime,
  getDashboardMetrics,
  getNotifications,
  getPayoutsByZone,
  getTriggerDistribution,
  getZoneRiskData,
  planDetails
} from '../utils/mockData';
import { calculateRiskAdjustedPremium } from '../utils/pricingModel';

const workers = generateWorkers(50);
const claims = generateClaims(workers, 80);
const rawPolicies = generatePolicies(workers);

// Recalculate premiums using the actuarial model
const policies = rawPolicies.map(p => {
  const worker = workers.find(w => w.id === p.workerId);
  const baseRate = planDetails[p.planType].premium;
  const workerRiskScore = worker?.riskScore || 0.5;
  const city = p.city || worker?.city || 'Other';

  return {
    ...p,
    premium: calculateRiskAdjustedPremium(baseRate, workerRiskScore, city),
  };
});

const useStore = create((set, get) => ({
  // Auth
  isAuthenticated: false,
  user: null,
  login: (phone) => set({
    isAuthenticated: true,
    user: { phone, name: 'Admin User', role: 'Insurer Admin', avatar: null },
  }),
  logout: () => set({ isAuthenticated: false, user: null }),

  // Theme
  darkMode: false,
  toggleDarkMode: () => set((state) => {
    const newMode = !state.darkMode;
    if (newMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
    return { darkMode: newMode };
  }),

  // Sidebar
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  // Data
  workers,
  claims,
  policies,
  metrics: getDashboardMetrics(workers, claims),
  claimsOverTime: getClaimsOverTime(),
  payoutsByZone: getPayoutsByZone(),
  triggerDistribution: getTriggerDistribution(),
  aiInsights: getAIInsights(),
  zoneRiskData: getZoneRiskData(),
  notifications: getNotifications(),

  // Simulation: Current Worker for the 'Worker App'
  currentWorkerId: workers[0].id,
  setCurrentWorker: (id) => set({ currentWorkerId: id }),

  // Loading state
  loading: false,
  setLoading: (loading) => set({ loading }),

  // Actions
  getWorkerById: (id) => get().workers.find(w => w.id === id),
  getPoliciesByWorkerId: (id) => get().policies.filter(p => p.workerId === id),
  getClaimsByWorkerId: (id) => get().claims.filter(c => c.workerId === id),

  // Notifications
  markNotificationRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n),
  })),
  markAllRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true })),
  })),
  unreadCount: () => get().notifications.filter(n => !n.read).length,

  // Add Policy
  addPolicy: (policy) => set((state) => ({
    policies: [policy, ...state.policies],
  })),

  // Add Claim
  addClaim: (claim) => set((state) => {
    const now = new Date();

    // Feature 8: Fraud Detection (Simple Logic)
    // Check if worker has filed another claim in the last 24h
    const recentClaims = state.claims.filter(c => {
      if (c.workerId !== claim.workerId) return false;
      const claimDate = new Date(c.date);
      const diffHours = (now - claimDate) / (1000 * 60 * 60);
      return diffHours < 24;
    });

    let finalClaim = { ...claim };
    let newNotification = null;

    if (recentClaims.length > 0) {
      finalClaim.status = 'Flagged';
      if (!finalClaim.auditTrail) finalClaim.auditTrail = [];
      finalClaim.auditTrail.push("Fraud Alert: Suspicious claim activity! Multiple claims filed from same user in short time.");

      newNotification = {
        id: Math.random().toString(36).substr(2, 9),
        icon: '🚨',
        title: 'Fraud Alert Triggered',
        message: `Suspicious activity detected for ${claim.workerName} (velocity check failed).`,
        type: 'danger',
        time: 'Just now',
        read: false
      };
    } else {
      // Create a standard notification based on approval/rejection
      const isRejected = ['Rejected', 'Flagged'].includes(finalClaim.status);
      newNotification = {
        id: Math.random().toString(36).substr(2, 9),
        icon: isRejected ? '🚨' : '✅',
        title: `Claim ${finalClaim.status.toUpperCase()}`,
        message: `Claim ${finalClaim.id} ${finalClaim.status.toLowerCase()} for ${finalClaim.workerName}.`,
        type: isRejected ? 'danger' : 'success',
        time: 'Just now',
        read: false
      };
    }

    const newClaims = [finalClaim, ...state.claims];
    const newNotifications = [newNotification, ...state.notifications];

    return {
      claims: newClaims,
      notifications: newNotifications,
      metrics: getDashboardMetrics(state.workers, newClaims),
    };
  }),

  // Payout simulation
  payoutStatus: null,
  triggerPayout: () => {
    set({ payoutStatus: 'processing' });
    setTimeout(() => set({ payoutStatus: 'success' }), 2500);
    setTimeout(() => set({ payoutStatus: null }), 6000);
  },
}));

export default useStore;
