import { authHttp } from '../services/httpClient';

export const getExplanation = async (data) => {
    const res = await authHttp.post('/explain', data);
    return res.data;
};
