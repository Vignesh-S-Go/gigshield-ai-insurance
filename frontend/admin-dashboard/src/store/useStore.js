import { create } from 'zustand';
import {
  generateWorkers,
  generateClaims,
  generatePolicies,
  getDashboardMetrics,
  getClaimsOverTime,
  getPayoutsByZone,
  getTriggerDistribution,
  getAIInsights,
  getZoneRiskData,
  getNotifications,
} from '../utils/mockData';

const workers = generateWorkers(50);
const claims = generateClaims(workers, 80);
const policies = generatePolicies(workers);

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
    } else {
      document.documentElement.classList.remove('dark');
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

  // Loading state
  loading: false,
  setLoading: (loading) => set({ loading }),

  // Workers
  getWorkerById: (id) => get().workers.find(w => w.id === id),

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

  // Payout simulation
  payoutStatus: null,
  triggerPayout: () => {
    set({ payoutStatus: 'processing' });
    setTimeout(() => set({ payoutStatus: 'success' }), 2500);
    setTimeout(() => set({ payoutStatus: null }), 6000);
  },
}));

export default useStore;
