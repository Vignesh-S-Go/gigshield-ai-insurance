import axios from 'axios';
import { clearSession, getStoredToken } from './authSession';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const publicHttp = axios.create({
  baseURL: API_URL,
});

export const authHttp = axios.create({
  baseURL: API_URL,
});

authHttp.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

authHttp.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearSession();

      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }

    return Promise.reject(error);
  }
);
