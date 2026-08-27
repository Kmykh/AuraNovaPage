import axios, { AxiosError } from 'axios';
import { AuthSession } from './auth-storage';
import { ApiProblemDetails } from './api-errors';
import { ProblemDetails } from '../types/common';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://auranova-backend.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject the Auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = AuthSession.getToken();
    if (token) {
      if (typeof config.headers.set === 'function') {
        config.headers.set('Authorization', `Bearer ${token}`);
      } else {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    // Remove manual Content-Type for FormData, Axios will handle boundary
    if (config.data instanceof FormData) {
      if (typeof config.headers.delete === 'function') {
        config.headers.delete('Content-Type');
      } else {
        delete config.headers['Content-Type'];
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle responses and transform to ApiProblemDetails
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      const { status, data } = error.response;

      // Centralized 401 handling
      if (status === 401) {
        AuthSession.clearSession();
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/admin/login')) {
           // eslint-disable-next-line @next/next/no-location-assign-relative-destination
           window.location.href = '/admin/login';
        }
      }

      // If backend responded with ProblemDetails shape
      if (data && typeof data === 'object') {
        const problemData = data as ProblemDetails;
        throw new ApiProblemDetails({
          ...problemData,
          status: problemData.status || status
        });
      }

      // Fallback for non-ProblemDetails errors
      throw new ApiProblemDetails({
        status,
        title: error.name,
        detail: error.message
      });
    }

    // Network errors or timeout
    throw new ApiProblemDetails({
      status: 0,
      title: 'Network Error',
      detail: error.message
    });
  }
);
