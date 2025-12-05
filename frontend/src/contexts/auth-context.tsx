'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
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
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      // Only run in browser environment
      if (typeof window === 'undefined') {
        return;
      }
      
      // Check if we have a valid access token before making the request
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        // No token, clear user state
        setUser(null);
        localStorage.removeItem('user');
        return;
      }
      
      const response = await userAPI.getProfile();
      // Handle DRF response structure - could be response.data directly or nested
      const profileData = response.data.user || response.data;
      
      // Construct user object from profile data and existing user state
      // Profile endpoint returns profile fields, but we need User type fields
      // So we merge with existing user data or construct minimal user object
      const currentUser = user || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : null);
      
      const userData = {
        ...currentUser,
        email: profileData.email || currentUser?.email,
        full_name: profileData.full_name || currentUser?.full_name,
        // Keep other user fields from current state
      };
      
      setUser(userData);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error: any) {
      // If we get a 401, the token is invalid - clear user state
      if (error?.response?.status === 401) {
        setUser(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
        return;
      }
      
      console.error('Failed to refresh user:', error);
      // Don't automatically logout on profile fetch failure for other errors
      // The user might still have valid tokens but the profile endpoint is temporarily unavailable
    }
  }, [user]);

  useEffect(() => {
    // Check if user is logged in on mount
    // Only run once on mount, not when refreshUser changes
    const initAuth = async () => {
      try {
        // Only run in browser environment
        if (typeof window === 'undefined') {
          setLoading(false);
          return;
        }
        
        const storedUser = localStorage.getItem('user');
        const accessToken = localStorage.getItem('access_token');
  
        if (storedUser && accessToken) {
          // Restore user from localStorage immediately
          try {
            setUser(JSON.parse(storedUser));
          } catch (parseError) {
            // Invalid JSON, clear it
            localStorage.removeItem('user');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            setLoading(false);
            return;
          }
          
          // Silently refresh user data in background without blocking
          // Don't await this - let it happen in the background
          // Only refresh if we have a valid access token
          if (accessToken) {
            refreshUser().catch((error) => {
              // Only log the error, don't clear user state for non-401 errors
              // The user might still have valid tokens but the profile endpoint is temporarily unavailable
              if (error?.response?.status !== 401) {
                console.error('Background user refresh failed:', error);
              }
            });
          }
        } else {
          // No stored user or token, clear everything
          setUser(null);
          if (typeof window !== 'undefined') {
            localStorage.removeItem('user');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Only clear localStorage if there's a critical error (e.g., corrupted data)
        // Don't clear on network errors or temporary failures
        if (error instanceof SyntaxError) {
          // Corrupted JSON in localStorage
          if (typeof window !== 'undefined') {
            localStorage.removeItem('user');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
          }
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount, not when refreshUser changes

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
        setUser,
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