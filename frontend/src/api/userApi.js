import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const userApi = {
    getUser: async (phone) => {
        const res = await axios.get(`${API_URL}/user/${phone}`);
        return res.data;
    },
    
    createUser: async (data) => {
        const res = await axios.post(`${API_URL}/user/create`, data);
        return res.data;
    },
    
    updateUser: async (data) => {
        const res = await axios.put(`${API_URL}/user/update`, data);
        return res.data;
    },
    
    toggleWork: async (id, isWorking) => {
        const res = await axios.post(`${API_URL}/user/work-toggle`, { id, isWorking });
        return res.data;
    },
    
    updateEarnings: async (id, amount, weekly) => {
        const res = await axios.post(`${API_URL}/user/earnings`, { id, amount, weekly });
        return res.data;
    },
    
    completeDelivery: async (id) => {
        const res = await axios.post(`${API_URL}/user/complete-delivery`, { id });
        return res.data;
    },
    
    updateProfile: async (id, name, platform, email) => {
        const res = await axios.put(`${API_URL}/user/update`, { id, name, platform, email });
        return res.data;
    }
};