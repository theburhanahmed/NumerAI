export interface User {
  id: string;
  email?: string;
  phone?: string;
  full_name: string;
  is_verified: boolean;
  is_premium: boolean;
  subscription_plan: 'free' | 'basic' | 'premium' | 'elite';
  created_at: string;
}

export interface UserProfile {
  id: string;
  user: User;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  timezone: string;
  location?: string;
  profile_picture_url?: string;
  bio?: string;
  profile_completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface RegisterData {
  email?: string;
  phone?: string;
  password: string;
  confirm_password: string;
  full_name: string;
}

export interface LoginData {
  email?: string;
  phone?: string;
  password: string;
}

export interface OTPVerificationData {
  email?: string;
  phone?: string;
  otp: string;
}