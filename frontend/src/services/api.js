import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = {
  // Workers
  fetchWorkers: async (params = {}) => {
    const res = await axios.get(`${API_URL}/workers`, { params });
    return res.data;
  },
  fetchWorker: async (id) => {
    const res = await axios.get(`${API_URL}/workers/${id}`);
    return res.data;
  },
  createWorker: async (data) => {
    const res = await axios.post(`${API_URL}/workers`, data);
    return res.data;
  },
  updateWorker: async (id, data) => {
    const res = await axios.put(`${API_URL}/workers/${id}`, data);
    return res.data;
  },
  syncWorkerStats: async (id, data) => {
    const res = await axios.put(`${API_URL}/workers/${id}/sync-stats`, data);
    return res.data;
  },
  getWorkerMetrics: async () => {
    const res = await axios.get(`${API_URL}/workers/metrics`);
    return res.data;
  },
  getUserRiskScore: async (userId) => {
    const res = await axios.get(`${API_URL}/workers/${userId}`);
    return res.data;
  },

  // Policies
  fetchPolicies: async (params = {}) => {
    const res = await axios.get(`${API_URL}/policies`, { params });
    return res.data;
  },
  fetchPolicy: async (id) => {
    const res = await axios.get(`${API_URL}/policies/${id}`);
    return res.data;
  },
  createPolicy: async (data) => {
    const res = await axios.post(`${API_URL}/policies`, data);
    return res.data;
  },
  renewPolicy: async (id) => {
    const res = await axios.post(`${API_URL}/policies/${id}/renew`);
    return res.data;
  },
  getPolicyStats: async () => {
    const res = await axios.get(`${API_URL}/policies/stats`);
    return res.data;
  },

  // Claims
  fetchClaims: async (params = {}) => {
    const res = await axios.get(`${API_URL}/claims`, { params });
    return res.data;
  },
  fetchClaim: async (id) => {
    const res = await axios.get(`${API_URL}/claims/${id}`);
    return res.data;
  },
  submitClaim: async (data) => {
    const res = await axios.post(`${API_URL}/claims`, data);
    return res.data;
  },
  updateClaimStatus: async (id, data) => {
    const res = await axios.put(`${API_URL}/claims/${id}/status`, data);
    return res.data;
  },
  getClaimStats: async () => {
    const res = await axios.get(`${API_URL}/claims/stats`);
    return res.data;
  },
  analyzeClaimDescription: async (description) => {
    const res = await axios.post(`${API_URL}/claims/ai-analyze`, { description });
    return res.data;
  },

  // Zones
  fetchZones: async (params = {}) => {
    const res = await axios.get(`${API_URL}/zones`, { params });
    return res.data;
  },
  createZone: async (data) => {
    const res = await axios.post(`${API_URL}/zones`, data);
    return res.data;
  },
  getZoneStats: async () => {
    const res = await axios.get(`${API_URL}/zones/stats`);
    return res.data;
  },
  getHighRiskZones: async () => {
    const res = await axios.get(`${API_URL}/zones/high-risk`);
    return res.data;
  },

  // Notifications
  fetchNotifications: async (params = {}) => {
    const res = await axios.get(`${API_URL}/notifications`, { params });
    return res.data;
  },
  createNotification: async (data) => {
    const res = await axios.post(`${API_URL}/notifications`, data);
    return res.data;
  },
  markNotificationRead: async (id) => {
    const res = await axios.put(`${API_URL}/notifications/${id}/read`);
    return res.data;
  },
  markAllNotificationsRead: async (params = {}) => {
    const res = await axios.put(`${API_URL}/notifications/read-all`, null, { params });
    return res.data;
  },
  getUnreadCount: async (params = {}) => {
    const res = await axios.get(`${API_URL}/notifications/unread-count`, { params });
    return res.data;
  },

  // Payouts
  fetchPayouts: async (params = {}) => {
    const res = await axios.get(`${API_URL}/payouts`, { params });
    return res.data;
  },
  createPayout: async (data) => {
    const res = await axios.post(`${API_URL}/payouts`, data);
    return res.data;
  },
  processPayout: async (id) => {
    const res = await axios.put(`${API_URL}/payouts/${id}/process`);
    return res.data;
  },
  getPayoutStats: async () => {
    const res = await axios.get(`${API_URL}/payouts/stats`);
    return res.data;
  },
  getPayoutsByZone: async () => {
    const res = await axios.get(`${API_URL}/payouts/by-zone`);
    return res.data;
  },

  // Smart Payout Engine
  getSmartPayoutData: async (params = {}) => {
    const res = await axios.get(`${API_URL}/smart-payout/smart-data`, { params });
    return res.data;
  },
  getPayoutQueue: async () => {
    const res = await axios.get(`${API_URL}/smart-payout/queue`);
    return res.data;
  },
  processSmartPayout: async (data) => {
    const res = await axios.post(`${API_URL}/smart-payout/process`, data);
    return res.data;
  },
  rejectPayout: async (data) => {
    const res = await axios.post(`${API_URL}/smart-payout/reject`, data);
    return res.data;
  },
  markPayoutForReview: async (data) => {
    const res = await axios.post(`${API_URL}/smart-payout/review`, data);
    return res.data;
  },

  // Gigs (simulated for Worker App)
  startGig: async (workerId) => {
    const res = await axios.post(`${API_URL}/gigs/start`, { worker_id: workerId });
    return res.data;
  },
  stopGig: async (sessionId) => {
    const res = await axios.post(`${API_URL}/gigs/stop`, { session_id: sessionId });
    return res.data;
  },

  getExplanation: async (data) => {
    const res = await axios.post(`${API_URL}/explain`, data);
    return res.data;
  },
};

export default api;
