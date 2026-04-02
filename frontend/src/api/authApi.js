import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const authApi = {
    // Login
    sendOtp: async (phone) => {
        const res = await axios.post(`${API_URL}/auth/send-otp`, { phone });
        return res.data;
    },
    verifyOtp: async (phone, otp) => {
        const res = await axios.post(`${API_URL}/auth/verify-otp`, { phone, otp });
        return res.data;
    },

    // Admin: User Management
    getUsers: async () => {
        const res = await axios.get(`${API_URL}/auth/users`);
        return res.data;
    },
    createUser: async (userData) => {
        const res = await axios.post(`${API_URL}/auth/users`, userData);
        return res.data;
    },
    updateUser: async (id, userData) => {
        const res = await axios.put(`${API_URL}/auth/users/${id}`, userData);
        return res.data;
    },
    deleteUser: async (id) => {
        const res = await axios.delete(`${API_URL}/auth/users/${id}`);
        return res.data;
    }
};
