import { authHttp, publicHttp } from '../services/httpClient';

export const authApi = {
    // Login
    sendOtp: async (phone) => {
        const res = await publicHttp.post('/auth/send-otp', { phone });
        return res.data;
    },
    verifyOtp: async (phone, otp) => {
        const res = await publicHttp.post('/auth/verify-otp', { phone, otp });
        return res.data;
    },

    // Worker Registration (public)
    register: async (userData) => {
        const res = await publicHttp.post('/auth/register', userData);
        return res.data;
    },

    // Admin: User Management
    getUsers: async () => {
        const res = await authHttp.get('/auth/users');
        return res.data;
    },
    createUser: async (userData) => {
        const res = await authHttp.post('/auth/users', userData);
        return res.data;
    },
    updateUser: async (id, userData) => {
        const res = await authHttp.put(`/auth/users/${id}`, userData);
        return res.data;
    },
    deleteUser: async (id) => {
        const res = await authHttp.delete(`/auth/users/${id}`);
        return res.data;
    }
};
