'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI, userAPI } from '@/lib/api-client';
import { User, AuthResponse, RegisterData, LoginData, OTPVerificationData } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginData) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<void>;
  verifyOTP: (data: OTPVerificationData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in on mount
    const initAuth = async () => {
      try {
        // Only run in browser environment
        if (typeof window !== 'undefined') {
          const storedUser = localStorage.getItem('user');
          const accessToken = localStorage.getItem('access_token');
  
          if (storedUser && accessToken) {
            setUser(JSON.parse(storedUser));
            // Optionally fetch fresh user data
            await refreshUser();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Only clear localStorage in browser environment
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const register = async (data: RegisterData): Promise<void> => {
    try {
      const response = await authAPI.register(data);
      // Registration successful, user needs to verify OTP
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Registration failed');
    }
  };

  const verifyOTP = async (data: OTPVerificationData): Promise<AuthResponse> => {
    try {
      const response = await authAPI.verifyOTP(data);
      const { access_token, refresh_token, user } = response.data;

      // Only store in localStorage if we're in browser environment
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        localStorage.setItem('user', JSON.stringify(user));
      }

      setUser(user);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'OTP verification failed');
    }
  };

  const login = async (data: LoginData): Promise<AuthResponse> => {
    try {
      const response = await authAPI.login(data);
      const { access_token, refresh_token, user } = response.data;

      // Only store in localStorage if we're in browser environment
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        localStorage.setItem('user', JSON.stringify(user));
      }

      setUser(user);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Login failed');
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Only run in browser environment
      if (typeof window !== 'undefined') {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          await authAPI.logout(refreshToken);
        }
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage only in browser environment
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
      }
      setUser(null);
      // Only redirect in browser environment
      if (typeof window !== 'undefined') {
        router.push('/login');
      }
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      // Only run in browser environment
      if (typeof window === 'undefined') {
        return;
      }
      
      const response = await userAPI.getProfile();
      const userData = response.data.user;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // Don't automatically logout on profile fetch failure
      // The user might still have valid tokens but the profile endpoint is temporarily unavailable
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        verifyOTP,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}