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

export interface Person {
  id: string;
  name: string;
  birth_date: string;
  relationship: string;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PersonNumerologyProfile {
  id: string;
  life_path_number: number;
  destiny_number: number;
  soul_urge_number: number;
  personality_number: number;
  attitude_number: number;
  maturity_number: number;
  balance_number: number;
  personal_year_number: number;
  personal_month_number: number;
  calculation_system: 'pythagorean' | 'chaldean';
  calculated_at: string;
  updated_at: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  report_type: string;
  is_premium: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GeneratedReport {
  id: string;
  user: string;
  person: string;
  template: string;
  title: string;
  content: any;
  generated_at: string;
  expires_at: string | null;
}
