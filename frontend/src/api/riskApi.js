import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const riskApi = {
    calculateRisk: async (data) => {
        const res = await axios.post(`${API_URL}/risk/calculate`, data);
        return res.data;
    }
};