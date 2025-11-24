import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Only access localStorage in browser environment
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

import { toast } from "@/components/ui/use-toast";

// Response interceptor to handle token refresh and errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized (Token Refresh)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(`${API_URL}/auth/refresh-token/`, {
          refresh: refreshToken,
        });

        const { access_token } = response.data;
        localStorage.setItem('access_token', access_token);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh token failed, logout user
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          window.location.href = '/login';

          toast({
            title: "Session Expired",
            description: "Please log in again.",
            variant: "destructive",
          });
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as any;

      // Don't show toast for 401 as it's handled above (or redirects)
      if (status !== 401) {
        let message = "An unexpected error occurred.";

        if (data?.detail) {
          message = data.detail;
        } else if (data?.message) {
          message = data.message;
        } else if (status === 500) {
          message = "Server error. Please try again later.";
        } else if (status === 404) {
          message = "Resource not found.";
        } else if (status === 403) {
          message = "You do not have permission to perform this action.";
        }

        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
      }
    } else if (error.request) {
      // Network error
      toast({
        title: "Network Error",
        description: "Please check your internet connection.",
        variant: "destructive",
      });
    }

    return Promise.reject(error);
  }
);

export default apiClient;

// API endpoints
export const authAPI = {
  register: (data: {
    email?: string;
    phone?: string;
    password: string;
    full_name: string;
  }) => apiClient.post('/auth/register/', data),

  verifyOTP: (data: { email?: string; phone?: string; otp: string }) =>
    apiClient.post('/auth/verify-otp/', data),

  resendOTP: (data: { email?: string; phone?: string }) =>
    apiClient.post('/auth/resend-otp/', data),

  login: (data: { email?: string; phone?: string; password: string }) =>
    apiClient.post('/auth/login/', data),

  logout: (refreshToken: string) =>
    apiClient.post('/auth/logout/', { refresh_token: refreshToken }),

  refreshToken: (refreshToken: string) =>
    apiClient.post('/auth/refresh-token/', { refresh: refreshToken }),

  requestPasswordReset: (email: string) =>
    apiClient.post('/auth/password-reset/', { email }),

  confirmPasswordReset: (data: { email: string; otp: string; new_password: string }) =>
    apiClient.post('/auth/password-reset/confirm/', data),
};

export const userAPI = {
  getProfile: () => apiClient.get('/users/profile/'),

  updateProfile: (data: {
    full_name?: string;
    date_of_birth?: string;
    gender?: string;
    timezone?: string;
    location?: string;
    bio?: string;
  }) => apiClient.patch('/users/profile/', data),
};

export const notificationAPI = {
  registerDevice: (data: {
    fcm_token: string;
    device_type: 'ios' | 'android' | 'web';
    device_name?: string;
  }) => apiClient.post('/notifications/devices/', data),
};