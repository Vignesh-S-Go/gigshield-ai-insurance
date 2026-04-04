import { authHttp } from './httpClient';

const api = {
  // Workers
  fetchWorkers: async (params = {}) => {
    const res = await authHttp.get('/workers', { params });
    return res.data;
  },
  fetchWorker: async (id) => {
    const res = await authHttp.get(`/workers/${id}`);
    return res.data;
  },
  createWorker: async (data) => {
    const res = await authHttp.post('/workers', data);
    return res.data;
  },
  updateWorker: async (id, data) => {
    const res = await authHttp.put(`/workers/${id}`, data);
    return res.data;
  },
  syncWorkerStats: async (id, data) => {
    const res = await authHttp.put(`/workers/${id}/sync-stats`, data);
    return res.data;
  },
  getWorkerMetrics: async () => {
    const res = await authHttp.get('/workers/metrics');
    return res.data;
  },
  getUserRiskScore: async (userId) => {
    const res = await authHttp.get(`/workers/${userId}`);
    return res.data;
  },

  // Policies
  fetchPolicies: async (params = {}) => {
    const res = await authHttp.get('/policies', { params });
    return res.data;
  },
  fetchWorkerPolicies: async (workerId) => {
    const res = await authHttp.get('/policies', { params: { worker_id: workerId } });
    return res.data;
  },
  fetchPolicy: async (id) => {
    const res = await authHttp.get(`/policies/${id}`);
    return res.data;
  },
  createPolicy: async (data) => {
    const res = await authHttp.post('/policies', data);
    return res.data;
  },
  renewPolicy: async (id) => {
    const res = await authHttp.post(`/policies/${id}/renew`);
    return res.data;
  },
  getPolicyStats: async () => {
    const res = await authHttp.get('/policies/stats');
    return res.data;
  },

  // Claims
  fetchClaims: async (params = {}) => {
    const res = await authHttp.get('/claims', { params });
    return res.data;
  },
  fetchClaim: async (id) => {
    const res = await authHttp.get(`/claims/${id}`);
    return res.data;
  },
  submitClaim: async (data) => {
    const res = await authHttp.post('/claims', data);
    return res.data;
  },
  updateClaimStatus: async (id, data) => {
    const res = await authHttp.put(`/claims/${id}/status`, data);
    return res.data;
  },
  getClaimStats: async () => {
    const res = await authHttp.get('/claims/stats');
    return res.data;
  },
  analyzeClaimDescription: async (description) => {
    const res = await authHttp.post('/claims/ai-analyze', { description });
    return res.data;
  },

  // Zones
  fetchZones: async (params = {}) => {
    const res = await authHttp.get('/zones', { params });
    return res.data;
  },
  createZone: async (data) => {
    const res = await authHttp.post('/zones', data);
    return res.data;
  },
  getZoneStats: async () => {
    const res = await authHttp.get('/zones/stats');
    return res.data;
  },
  getHighRiskZones: async () => {
    const res = await authHttp.get('/zones/high-risk');
    return res.data;
  },

  // Notifications
  fetchNotifications: async (params = {}) => {
    const res = await authHttp.get('/notifications', { params });
    return res.data;
  },
  createNotification: async (data) => {
    const res = await authHttp.post('/notifications', data);
    return res.data;
  },
  markNotificationRead: async (id) => {
    const res = await authHttp.put(`/notifications/${id}/read`);
    return res.data;
  },
  markAllNotificationsRead: async (params = {}) => {
    const res = await authHttp.put('/notifications/read-all', null, { params });
    return res.data;
  },
  getUnreadCount: async (params = {}) => {
    const res = await authHttp.get('/notifications/unread-count', { params });
    return res.data;
  },

  // Payouts
  fetchPayouts: async (params = {}) => {
    const res = await authHttp.get('/payouts', { params });
    return res.data;
  },
  createPayout: async (data) => {
    const res = await authHttp.post('/payouts', data);
    return res.data;
  },
  processPayout: async (id) => {
    const res = await authHttp.put(`/payouts/${id}/process`);
    return res.data;
  },
  getPayoutStats: async () => {
    const res = await authHttp.get('/payouts/stats');
    return res.data;
  },
  getPayoutsByZone: async () => {
    const res = await authHttp.get('/payouts/by-zone');
    return res.data;
  },

  // Smart Payout Engine
  getSmartPayoutData: async (params = {}) => {
    const res = await authHttp.get('/smart-payout/smart-data', { params });
    return res.data;
  },
  getPayoutQueue: async () => {
    const res = await authHttp.get('/smart-payout/queue');
    return res.data;
  },
  processSmartPayout: async (data) => {
    const res = await authHttp.post('/smart-payout/process', data);
    return res.data;
  },
  rejectPayout: async (data) => {
    const res = await authHttp.post('/smart-payout/reject', data);
    return res.data;
  },
  markPayoutForReview: async (data) => {
    const res = await authHttp.post('/smart-payout/review', data);
    return res.data;
  },

  // Admin Payouts from database
  getAdminPayouts: async (params = {}) => {
    const res = await authHttp.get('/admin/payouts', { params });
    return res.data;
  },

  // Gigs (simulated for Worker App)
  startGig: async (workerId) => {
    const res = await authHttp.post('/gigs/start', { worker_id: workerId });
    return res.data;
  },
  stopGig: async (sessionId) => {
    const res = await authHttp.post('/gigs/stop', { session_id: sessionId });
    return res.data;
  },

  getExplanation: async (data) => {
    const res = await authHttp.post('/explain', data);
    return res.data;
  },

  // Parametric Claims Engine
  fetchParametricClaims: async (params = {}) => {
    const res = await authHttp.get('/parametric-claims', { params });
    return res.data;
  },
  runParametricClaimCheck: async (city) => {
    const res = await authHttp.post('/parametric-claims/run-check', { city });
    return res.data;
  },
  getAdminAnalytics: async () => {
    const res = await authHttp.get('/admin/analytics');
    return res.data;
  },
  simulateTrigger: async (city, triggerType, value) => {
    const res = await authHttp.post('/admin/simulate-trigger', { city, triggerType, value });
    return res.data;
  },
  getLiveData: async () => {
    const res = await authHttp.get('/admin/live');
    return res.data;
  },
};

export default api;
