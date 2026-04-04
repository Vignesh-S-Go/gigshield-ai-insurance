import { create } from 'zustand';
import api from '../services/api';
import { clearSession, getStoredSession, storeSession } from '../services/authSession';
import { getClaimsOverTime, getPayoutsByZone, getTriggerDistribution, getAIInsights } from '../utils/mockData';

const storedSession = getStoredSession();

const useStore = create((set, get) => ({
  // Auth
  isAuthenticated: storedSession.isAuthenticated,
  user: storedSession.user,
  users: JSON.parse(localStorage.getItem('users')) || [],

  login: (userData, token, worker = userData?.worker || null) => set(() => {
    storeSession({ user: userData, token, worker });
    return { isAuthenticated: true, user: userData };
  }),

  signup: (userData) => set((state) => {
    const newUsers = [...state.users, userData];
    localStorage.setItem('users', JSON.stringify(newUsers));
    return { users: newUsers };
  }),

  logout: () => set(() => {
    clearSession();
    return { isAuthenticated: false, user: null };
  }),

  // Theme
  darkMode: true,
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

  // Data from API
  workers: [],
  claims: [],
  policies: [],
  zones: [],
  notifications: [],
  metrics: {
    activeWorkers: 0,
    totalWorkers: 0,
    totalPayout: 0,
    fraudAlerts: 0,
    avgRiskScore: 0
  },
  claimStats: {
    total: 0,
    pending: 0,
    approved: 0,
    paid: 0,
    flagged: 0,
    totalPayout: 0
  },
  policyStats: {
    total: 0,
    active: 0,
    expired: 0
  },
  zoneStats: {
    totalZones: 0,
    highRiskZones: 0,
    avgRiskScore: 0
  },
  
  // Chart data (calculated from real data)
  claimsOverTime: [],
  payoutsByZone: [],
  triggerDistribution: [],
  aiInsights: {
    highRiskZones: [],
    predictions: [],
    fraudAlerts: []
  },
  zoneRiskData: [],

  // Loading state
  loading: false,
  setLoading: (loading) => set({ loading }),

  // Error state
  error: null,
  setError: (error) => set({ error }),

  // Initialize data from API
  initializeData: async () => {
    set({ loading: true, error: null });
    try {
      const [workersRes, claimsRes, policiesRes, zonesRes, notificationsRes, metricsRes, claimStatsRes, policyStatsRes, zoneStatsRes, highRiskRes] = await Promise.all([
        api.fetchWorkers(),
        api.fetchClaims(),
        api.fetchPolicies(),
        api.fetchZones(),
        api.fetchNotifications(),
        api.getWorkerMetrics(),
        api.getClaimStats(),
        api.getPolicyStats(),
        api.getZoneStats(),
        api.getHighRiskZones()
      ]);

      const workers = workersRes.data || [];
      const claims = claimsRes.data || [];
      const policies = policiesRes.data || [];
      const zones = zonesRes.data || [];

      // Calculate chart data from real data
      const claimsOverTime = calculateClaimsOverTime(claims);
      const payoutsByZone = calculatePayoutsByZone(claims, workers);
      const triggerDistribution = calculateTriggerDistribution(claims);

      set({
        workers,
        claims,
        policies,
        zones,
        zoneRiskData: zones,
        notifications: notificationsRes.data || [],
        metrics: metricsRes.data || get().metrics,
        claimStats: claimStatsRes.data || get().claimStats,
        policyStats: policyStatsRes.data || get().policyStats,
        zoneStats: zoneStatsRes.data || get().zoneStats,
        claimsOverTime,
        payoutsByZone,
        triggerDistribution,
        aiInsights: {
          highRiskZones: highRiskRes.data || [],
          predictions: generatePredictions(),
          fraudAlerts: calculateFraudAlerts(claims)
        },
        loading: false
      });
    } catch (error) {
      console.error('[STORE] Failed to initialize data:', error);
      set({ error: error.message, loading: false });
    }
  },

  // Refresh all data
  refreshData: async () => {
    await get().initializeData();
  },

  // Fetch Workers
  fetchWorkers: async (params = {}) => {
    try {
      const res = await api.fetchWorkers(params);
      set({ workers: res.data || [] });
      return res.data;
    } catch (error) {
      console.error('[STORE] Failed to fetch workers:', error);
      throw error;
    }
  },

  // Fetch Claims
  fetchClaims: async (params = {}) => {
    try {
      const res = await api.fetchClaims(params);
      set({ claims: res.data || [] });
      return res.data;
    } catch (error) {
      console.error('[STORE] Failed to fetch claims:', error);
      throw error;
    }
  },

  // Fetch Policies
  fetchPolicies: async (params = {}) => {
    try {
      const res = await api.fetchPolicies(params);
      set({ policies: res.data || [] });
      return res.data;
    } catch (error) {
      console.error('[STORE] Failed to fetch policies:', error);
      throw error;
    }
  },

  // Fetch Zones
  fetchZones: async (params = {}) => {
    try {
      const res = await api.fetchZones(params);
      set({ zones: res.data || [], zoneRiskData: res.data || [] });
      return res.data;
    } catch (error) {
      console.error('[STORE] Failed to fetch zones:', error);
      throw error;
    }
  },

  // Fetch Notifications
  fetchNotifications: async (params = {}) => {
    try {
      const res = await api.fetchNotifications(params);
      set({ notifications: res.data || [] });
      return res.data;
    } catch (error) {
      console.error('[STORE] Failed to fetch notifications:', error);
      throw error;
    }
  },

  // Actions
  getWorkerById: (id) => get().workers.find(w => w.id === id),
  getWorkerDetail: async (id) => {
    try {
      const res = await api.fetchWorker(id);
      return res.data;
    } catch (error) {
      console.error('[STORE] Failed to fetch worker detail:', error);
      throw error;
    }
  },
  getPoliciesByWorkerId: (id) => get().policies.filter(p => p.worker_id === id),
  getClaimsByWorkerId: (id) => get().claims.filter(c => c.workerId === id),

  // Sync Worker Stats
  syncWorkerStats: async (id, stats) => {
    try {
      const res = await api.syncWorkerStats(id, stats);
      if (res.success) {
        set((state) => ({
          workers: state.workers.map(w => w.id === id ? { ...w, ...stats } : w)
        }));
      }
      return res;
    } catch (error) {
      console.error('[STORE] Failed to sync worker stats:', error);
      throw error;
    }
  },

  // Add Worker
  addWorker: (worker) => set((state) => ({
    workers: [worker, ...state.workers]
  })),

  // Add Policy
  addPolicy: (policy) => set((state) => ({
    policies: [policy, ...state.policies],
  })),

  // Add Claim
  addClaim: (claim) => set((state) => ({
    claims: [claim, ...state.claims]
  })),

  // Notifications
  markNotificationRead: async (id) => {
    try {
      await api.markNotificationRead(id);
      set((state) => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
      }));
    } catch (error) {
      console.error('[STORE] Failed to mark notification read:', error);
    }
  },

  markAllRead: async () => {
    try {
      await api.markAllNotificationsRead();
      set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true }))
      }));
    } catch (error) {
      console.error('[STORE] Failed to mark all notifications read:', error);
    }
  },

  unreadCount: () => get().notifications.filter(n => !n.read).length,

  // Payout simulation
  payoutStatus: null,
  triggerPayout: () => {
    set({ payoutStatus: 'processing' });
    setTimeout(() => set({ payoutStatus: 'success' }), 2500);
    setTimeout(() => set({ payoutStatus: null }), 6000);
  },

  // Live Alerts Feature
  liveAlerts: [],
  addLiveAlert: (alert) => {
    const id = Date.now() + Math.random().toString();
    set((state) => ({
      liveAlerts: [...state.liveAlerts, { ...alert, id }]
    }));
    setTimeout(() => {
      set((state) => ({
        liveAlerts: state.liveAlerts.filter((a) => a.id !== id)
      }));
    }, 4000);
  },
}));

// Helper functions for calculating chart data
function calculateClaimsOverTime(claims) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map(month => {
    const monthClaims = claims.filter(c => {
      const date = new Date(c.date);
      return date.toLocaleString('default', { month: 'short' }) === month;
    });
    return {
      month,
      claims: monthClaims.length,
      payouts: monthClaims.reduce((sum, c) => sum + (c.payoutAmount || 0), 0)
    };
  });
}

function calculatePayoutsByZone(claims, workers) {
  const zoneData = {};
  claims.filter(c => c.status === 'Paid').forEach(c => {
    const worker = workers.find(w => w.id === c.workerId);
    const city = worker?.city || 'Other';
    if (!zoneData[city]) {
      zoneData[city] = { zone: city, payouts: 0, claims: 0 };
    }
    zoneData[city].payouts += c.payoutAmount || 0;
    zoneData[city].claims += 1;
  });
  return Object.values(zoneData);
}

function calculateTriggerDistribution(claims) {
  const triggers = {};
  const colors = ['#6366f1', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6'];
  const triggerList = ['Rain', 'Heat', 'Flood', 'AQI', 'Curfew'];
  
  triggerList.forEach(t => {
    triggers[t] = claims.filter(c => c.triggerType === t).length;
  });
  
  return triggerList.map((type, i) => ({
    name: type,
    value: triggers[type] || 0,
    color: colors[i]
  }));
}

function calculateFraudAlerts(claims) {
  return claims
    .filter(c => c.status === 'Flagged')
    .map(c => ({
      id: c.id,
      workerName: 'Suspicious Pattern Detected',
      description: 'Claim flagged for review',
      severity: 'high',
      timestamp: new Date(c.date).toLocaleDateString()
    }));
}

function generatePredictions() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map(day => ({
    day,
    disruptions: Math.floor(Math.random() * 10) + 3,
    confidence: Math.floor(Math.random() * 20) + 75
  }));
}

export default useStore;
