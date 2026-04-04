import { authHttp } from '../services/httpClient';

export const riskApi = {
    calculateRisk: async (data) => {
        const res = await authHttp.post('/risk/calculate', data);
        return res.data;
    }
};