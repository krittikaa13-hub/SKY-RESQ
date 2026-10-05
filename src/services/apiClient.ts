/**
 * @file src/services/apiClient.ts
 * Enterprise Axios Client Architecture with Interceptors, Retry, Timeout & Error Handler
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const getBaseUrl = (): string => {
  if (typeof import.meta !== 'undefined' && 'env' in import.meta) {
    return (import.meta as Record<string, any>).env?.VITE_API_BASE_URL || '/api';
  }
  return '/api';
};

const API_BASE_URL = getBaseUrl();

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  errorCode: string;
  message: string;
  details?: unknown;
}

// Create custom Axios Instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Attach authorization token if stored
    const token = localStorage.getItem('q_optima_token') || 'qiskit_ibm_runtime_live_key';
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['X-Request-ID'] = `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor with Automatic Retry Strategy
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const config = error.config as InternalAxiosRequestConfig & { _retryCount?: number };

    // Retry configuration (max 2 retries for 5xx errors or network timeout)
    if (config && (!error.response || error.response.status >= 500)) {
      config._retryCount = config._retryCount || 0;
      if (config._retryCount < 2) {
        config._retryCount += 1;
        const delay = Math.pow(2, config._retryCount) * 500; // Exponential backoff: 1s, 2s
        await new Promise((resolve) => setTimeout(resolve, delay));
        return apiClient(config);
      }
    }

    const formattedError: ApiErrorResponse = {
      success: false,
      errorCode: error.response?.data?.errorCode || 'NETWORK_ERROR',
      message:
        error.response?.data?.message ||
        error.message ||
        'An unexpected server error occurred during quantum execution.',
    };

    return Promise.reject(formattedError);
  }
);
