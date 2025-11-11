/**
 * Numerology API client for NumerAI frontend.
 */
import apiClient from './api-client';

// Type definitions
export interface NumerologyProfile {
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

export interface NumberInterpretation {
  number: number;
  title: string;
  description: string;
  strengths: string[];
  challenges: string[];
  career: string[];
  relationships: string;
  life_purpose: string;
}

export interface BirthChart {
  profile: NumerologyProfile;
  interpretations: {
    life_path_number: NumberInterpretation;
    destiny_number: NumberInterpretation;
    soul_urge_number: NumberInterpretation;
    personality_number: NumberInterpretation;
    attitude_number: NumberInterpretation;
    maturity_number: NumberInterpretation;
    balance_number: NumberInterpretation;
    personal_year_number: NumberInterpretation;
    personal_month_number: NumberInterpretation;
  };
}

export interface DailyReading {
  id: string;
  reading_date: string;
  personal_day_number: number;
  lucky_number: number;
  lucky_color: string;
  auspicious_time: string;
  activity_recommendation: string;
  warning: string;
  affirmation: string;
  actionable_tip: string;
  generated_at: string;
}

export interface ReadingHistory {
  count: number;
  page: number;
  page_size: number;
  results: DailyReading[];
}

// API methods
export const numerologyAPI = {
  /**
   * Calculate numerology profile for the current user.
   */
  async calculateProfile(system: 'pythagorean' | 'chaldean' = 'pythagorean'): Promise<{
    message: string;
    profile: NumerologyProfile;
  }> {
    const response = await apiClient.post('/numerology/calculate/', { system });
    return response.data;
  },

  /**
   * Get the user's numerology profile.
   */
  async getProfile(): Promise<NumerologyProfile> {
    const response = await apiClient.get('/numerology/profile/');
    return response.data;
  },

  /**
   * Get the user's birth chart with interpretations.
   */
  async getBirthChart(): Promise<BirthChart> {
    const response = await apiClient.get('/numerology/birth-chart/');
    return response.data;
  },

  /**
   * Get daily reading for a specific date or today.
   */
  async getDailyReading(date?: string): Promise<DailyReading> {
    const params = date ? { date } : {};
    const response = await apiClient.get('/numerology/daily-reading/', { params });
    return response.data;
  },

  /**
   * Get reading history with pagination.
   */
  async getReadingHistory(page: number = 1, pageSize: number = 10): Promise<ReadingHistory> {
    const response = await apiClient.get('/numerology/reading-history/', {
      params: { page, page_size: pageSize }
    });
    return response.data;
  }
};