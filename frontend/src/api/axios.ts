// frontend/src/api/axios.ts
import axios, { AxiosError, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { getToken, removeToken } from '../utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    
    if (!error.response) {
      throw new Error('Network Error');
    }

    const { status, data } = error.response;
    
    if (status === 401) {
      removeToken();
      window.location.href = '/login';
      throw new Error('Unauthorized - Please login again');
    }

    if (status === 403) {
      throw new Error('Forbidden - Insufficient permissions');
    }

    if (status === 400 && (data as any).detail) {
      const detail = (data as any).detail;
      if (Array.isArray(detail)) {
        throw new Error(detail.map((err: any) => err.msg || err.message).join(', '));
      }
      throw new Error(detail);
    }

    if (status >= 500) {
      throw new Error('Server Error');
    }

    throw new Error((data as any)?.message || error.message);
  }
);

// Named exports only
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) => 
    apiClient.get<T>(url, config).then((res) => res.data),
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.post<T>(url, data, config).then((res) => res.data),
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.put<T>(url, data, config).then((res) => res.data),
  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<T>(url, config).then((res) => res.data),
};

export default apiClient;