import { authHttp } from '../services/httpClient';

export const userApi = {
    getUser: async (phone) => {
        const res = await authHttp.get(`/user/${phone}`);
        return res.data;
    },
    
    createUser: async (data) => {
        const res = await authHttp.post('/user/create', data);
        return res.data;
    },
    
    updateUser: async (data) => {
        const res = await authHttp.put('/user/update', data);
        return res.data;
    },
    
    toggleWork: async (id, isWorking) => {
        const res = await authHttp.post('/user/work-toggle', { id, isWorking });
        return res.data;
    },
    
    updateEarnings: async (id, amount, weekly) => {
        const res = await authHttp.post('/user/earnings', { id, amount, weekly });
        return res.data;
    },
    
    completeDelivery: async (id) => {
        const res = await authHttp.post('/user/complete-delivery', { id });
        return res.data;
    },
    
    updateProfile: async (id, name, platform, email) => {
        const res = await authHttp.put('/user/update', { id, name, platform, email });
        return res.data;
    }
};