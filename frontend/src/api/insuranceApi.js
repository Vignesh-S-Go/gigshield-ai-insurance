import { authHttp } from '../services/httpClient';

export const insuranceApi = {
    calculate: async (data) => {
        const res = await authHttp.post('/insurance/calculate', data);
        return res.data;
    }
};