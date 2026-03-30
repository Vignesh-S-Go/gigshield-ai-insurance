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
    const newClaims = [claim, ...state.claims];
    return {
      claims: newClaims,
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
