import axios from 'axios';
import { getAuthCallbacks } from './authUtils'; // Import authUtils
import { backendApiUrl } from './runtimeConfig';

interface CreateApiOptions {
  baseURL: string;
}

export const createApi = (options: CreateApiOptions) => {
  const api = axios.create({
    baseURL: options.baseURL,
  });

  let isRefreshing = false;
  let failedQueue: { resolve: (value?: unknown) => void; reject: (reason?: any) => void; config: any; }[] = [];

  const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
      if (token) {
        prom.config.headers.Authorization = `Bearer ${token}`;
        prom.resolve(api(prom.config));
      } else {
        prom.reject(error);
      }
    });
    failedQueue = [];
  };

  // Request interceptor to add the auth token to the headers
  api.interceptors.request.use(
    (config) => {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor for handling token refresh
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      const { logout, setAccessToken } = getAuthCallbacks(); // Get callbacks from authUtils

      // If 401 and not already retrying
      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          // If refreshing, add to queue and retry later
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject, config: originalRequest });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
          logout();
          return Promise.reject(error);
        }

        try {
          // IMPORTANT: Refresh token endpoint should always point to the main backend
          const response = await axios.post(`${backendApiUrl}/auth/refresh-token`, { refreshToken });
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

          localStorage.setItem('accessToken', newAccessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          setAccessToken(newAccessToken); // Update state in AuthContext
          api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;

          processQueue(null, newAccessToken); // Process queued requests
          return api(originalRequest); // Retry original request
        } catch (refreshError) {
          processQueue(refreshError, null); // Reject queued requests
          logout(); // Logout on refresh failure
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // Handle 403 (Forbidden) explicitly if not already caught by 401 refresh logic
      if (error.response?.status === 403) {
        // Optionally redirect to a forbidden page or show a message
        console.warn("Forbidden access:", error.response.data.message);
        // For now, just reject the promise. If you want to force logout here for all 403s, you can.
      }

      return Promise.reject(error);
    }
  );

  return api;
};

