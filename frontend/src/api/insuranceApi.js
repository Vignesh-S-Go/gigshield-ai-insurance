import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const insuranceApi = {
    calculate: async (data) => {
        const res = await axios.post(`${API_URL}/insurance/calculate`, data);
        return res.data;
    }
};