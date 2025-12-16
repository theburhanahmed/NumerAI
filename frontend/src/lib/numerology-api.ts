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

export interface LoShuGrid {
  grid: {
    [key: string]: {
      number: number;
      count: number;
      is_present: boolean;
      strength: 'strong' | 'present' | 'missing';
      meaning: string;
    };
  };
  missing_numbers: number[];
  strong_numbers: number[];
  number_frequency: Record<number, number>;
  interpretation: string;
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
  lo_shu_grid?: LoShuGrid;
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

export interface AIChatResponse {
  conversation_id: string;
  message: {
    id: string;
    role: 'assistant';
    content: string;
    created_at: string;
  };
  suggested_followups: string[];
}

export interface AIConversation {
  id: string;
  user: string;
  started_at: string;
  last_message_at: string | null;
  message_count: number;
  is_active: boolean;
}

export interface AIMessage {
  id: string;
  conversation: string;
  role: 'user' | 'assistant';
  content: string;
  tokens_used: number | null;
  created_at: string;
}

// New type definitions for additional features
export interface LifePathAnalysis {
  number: number;
  title: string;
  description: string;
  strengths: string[];
  challenges: string[];
  career: string[];
  relationships: string;
  advice: string;
}

export interface CompatibilityCheck {
  id: string;
  user: string;
  partner_name: string;
  partner_birth_date: string;
  relationship_type: 'romantic' | 'business' | 'friendship' | 'family';
  compatibility_score: number;
  strengths: string[];
  challenges: string[];
  advice: string;
  created_at: string;
}

export interface Remedy {
  id: string;
  user: string;
  remedy_type: 'gemstone' | 'color' | 'ritual' | 'mantra' | 'dietary' | 'exercise';
  title: string;
  description: string;
  recommendation: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RemedyTracking {
  id: string;
  user: string;
  remedy: string;
  date: string;
  is_completed: boolean;
  notes: string;
  created_at: string;
}

export interface Expert {
  id: string;
  name: string;
  email: string;
  specialty: 'relationship' | 'career' | 'spiritual' | 'health' | 'general';
  experience_years: number;
  rating: number;
  bio: string;
  profile_picture_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Consultation {
  id: string;
  user: string;
  expert: string;
  expert_name: string;
  expert_specialty: string;
  consultation_type: 'video' | 'chat' | 'phone';
  scheduled_at: string;
  duration_minutes: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  notes: string;
  meeting_link?: string;
  created_at: string;
  updated_at: string;
  review?: ConsultationReview;
}

export interface ConsultationReview {
  id: string;
  consultation: string;
  rating: number;
  review_text: string;
  is_anonymous: boolean;
  created_at: string;
}

export interface PinnacleCycle {
  number: number;
  age: string;
  title: string;
}

export interface NumerologyReport {
  full_name: string;
  birth_date: string;
  life_path_number: number;
  life_path_title: string;
  destiny_number: number;
  destiny_title: string;
  soul_urge_number: number;
  soul_urge_title: string;
  personality_number: number;
  personality_title: string;
  birthday_number: number;
  birthday_title: string;
  challenge_number: number;
  challenge_title: string;
  pinnacle_cycle: PinnacleCycle[];
  summary: string;
}

export interface RectificationSuggestion {
  type: 'gemstone' | 'color' | 'ritual' | 'mantra' | 'dietary' | 'exercise';
  title: string;
  description: string;
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
}

export interface SubscriptionFeatureAccess {
  birth_date_numerology: boolean;
  basic_interpretations: boolean;
  name_numerology: boolean;
  phone_numerology: boolean;
  lo_shu_grid: boolean;
  rectification_suggestions: boolean;
  detailed_analysis: boolean;
  compatibility_insights: boolean;
  raj_yog_analysis: boolean;
  yearly_forecast: boolean;
  expert_recommendations: boolean;
}

export interface FullNumerologyReport {
  user_profile: {
    full_name: string;
    email: string;
    date_of_birth: string | null;
    calculation_date: string | null;
  };
  subscription_tier: 'free' | 'basic' | 'premium' | 'elite';
  available_features: SubscriptionFeatureAccess;
  birth_date_numerology: NumerologyProfile | null;
  birth_date_interpretations: Record<string, any>;
  name_numerology: NameReport | null;
  name_numerology_available: boolean;
  phone_numerology: PhoneReport | null;
  phone_numerology_available: boolean;
  lo_shu_grid: LoShuGrid | null;
  lo_shu_grid_available: boolean;
  rectification_suggestions: RectificationSuggestion[];
  rectification_suggestions_available: boolean;
  detailed_analysis: Record<string, any> | null;
  detailed_analysis_available: boolean;
  compatibility_insights: Array<{
    partner_name: string;
    compatibility_score: number;
    relationship_type: string;
    strengths: string[];
    challenges: string[];
    advice: string;
  }> | null;
  compatibility_insights_available: boolean;
  raj_yog_analysis: {
    is_detected: boolean;
    yog_type: string | null;
    yog_name: string | null;
    strength_score: number;
    contributing_numbers: Record<string, number>;
    detected_combinations: Array<any>;
  } | null;
  raj_yog_analysis_available: boolean;
  yearly_forecast: {
    year: number;
    personal_year_number: number;
    annual_overview: string;
    major_themes: string[];
    opportunities: string[];
    challenges: string[];
  } | null;
  yearly_forecast_available: boolean;
  expert_recommendations: Array<{
    type: string;
    title: string;
    description: string;
  }> | null;
  expert_recommendations_available: boolean;
  pinnacle_cycles: Array<{
    cycle_number: number;
    pinnacle_number: number;
    age_range: string;
    start_age: number;
    end_age: number | null;
    theme: string;
    description: string;
    challenge_number: number | null;
    challenge_description: string;
  }> | null;
  pinnacle_cycles_available: boolean;
  challenges_opportunities: {
    challenges: Array<{
      cycle: number;
      number: number;
      title: string;
      description: string;
      lessons: string;
    }>;
    opportunities: Array<{
      type: string;
      number: number;
      title: string;
      description: string;
      focus_areas?: string;
    }>;
  } | null;
  challenges_opportunities_available: boolean;
}

// New type definitions for multi-person numerology
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

export interface RajYogDetection {
  id: string;
  is_detected: boolean;
  yog_type: 'leadership' | 'spiritual' | 'material' | 'creative' | 'service' | 'master' | 'other' | null;
  yog_name: string | null;
  strength_score: number;
  contributing_numbers: {
    life_path: number;
    destiny: number;
    soul_urge?: number;
    personality?: number;
  };
  detected_combinations: Array<{
    type: string;
    name: string;
    numbers: Record<string, number>;
    description: string;
  }>;
  calculation_system: 'pythagorean' | 'chaldean';
  detected_at: string;
  updated_at: string;
}

export interface Explanation {
  id: string;
  explanation_type: 'raj_yog' | 'daily' | 'weekly' | 'yearly' | 'number' | 'general';
  title: string;
  content: string;
  llm_provider: string | null;
  llm_model: string | null;
  tokens_used: number | null;
  cost: number | null;
  context_data: Record<string, any>;
  is_cached: boolean;
  generated_at: string;
  expires_at: string | null;
}

export interface WeeklyReport {
  id: string;
  week_start_date: string;
  week_end_date: string;
  week_number: number;
  year: number;
  weekly_number: number;
  personal_year_number: number;
  personal_month_number: number;
  main_theme: string;
  weekly_summary: string;
  daily_insights: Array<{
    date: string;
    day_name: string;
    personal_day_number: number;
    lucky_number: number | null;
    lucky_color: string | null;
    activity: string | null;
    affirmation: string | null;
    raj_yog_status: string | null;
  }>;
  weekly_trends: {
    most_common_day_number: number | null;
    number_frequency: Record<number, number>;
    raj_yog_days: number;
    total_days: number;
    energy_pattern: {
      high: number;
      medium: number;
      low: number;
    };
    dominant_energy: 'high' | 'medium' | 'low';
  };
  recommendations: string[];
  challenges: string[];
  opportunities: string[];
  raj_yog_status: string | null;
  raj_yog_insights: string | null;
  llm_summary: string | null;
  explanation_id: string | null;
  generated_at: string;
  updated_at: string;
}

export interface YearlyReport {
  id: string;
  year: number;
  personal_year_number: number;
  personal_year_cycle: 'beginning' | 'middle' | 'end';
  annual_overview: string;
  major_themes: string[];
  month_by_month: Record<string, {
    month_name: string;
    personal_month_number: number;
    theme: string;
    description: string;
  }>;
  key_dates: Array<{
    date: string;
    type: string;
    description: string;
    importance: 'high' | 'medium' | 'low';
  }>;
  opportunities: string[];
  challenges: string[];
  recommendations: string[];
  annual_raj_yog_status: string | null;
  raj_yog_patterns: Array<{
    type: string;
    description: string;
    strength: number;
    active_weeks: number;
  }>;
  raj_yog_insights: string | null;
  llm_overview: string | null;
  explanation_id: string | null;
  generated_at: string;
  updated_at: string;
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
   * Returns null if profile doesn't exist (404) - user needs to calculate it first.
   */
  async getProfile(): Promise<NumerologyProfile | null> {
    try {
      const response = await apiClient.get('/numerology/profile/');
      return response.data;
    } catch (error: any) {
      // If 404, profile doesn't exist - this is expected for new users
      if (error.response?.status === 404) {
        return null;
      }
      // Re-throw other errors
      throw error;
    }
  },

  /**
   * Get the user's birth chart with interpretations.
   * Returns null if birth chart cannot be generated (404) - user needs to calculate profile first.
   */
  async getBirthChart(): Promise<BirthChart | null> {
    try {
      const response = await apiClient.get('/numerology/birth-chart/');
      return response.data;
    } catch (error: any) {
      // If 404, birth chart cannot be generated - this is expected for new users
      if (error.response?.status === 404) {
        return null;
      }
      // Re-throw other errors
      throw error;
    }
  },

  /**
   * Get daily reading for a specific date or today.
   * Returns null if reading cannot be generated (400/404) - user needs to calculate profile first.
   */
  async getDailyReading(date?: string): Promise<DailyReading | null> {
    try {
      const params = date ? { date } : {};
      const response = await apiClient.get('/numerology/daily-reading/', { params });
      return response.data;
    } catch (error: any) {
      // If 400 or 404, reading cannot be generated - this is expected for new users
      if (error.response?.status === 400 || error.response?.status === 404) {
        return null;
      }
      // Re-throw other errors
      throw error;
    }
  },

  /**
   * Get reading history with pagination.
   */
  async getReadingHistory(page: number = 1, pageSize: number = 10): Promise<ReadingHistory> {
    const response = await apiClient.get('/numerology/reading-history/', {
      params: { page, page_size: pageSize }
    });
    return response.data;
  },

  /**
   * Chat with AI numerologist.
   */
  async aiChat(message: string): Promise<AIChatResponse> {
    const response = await apiClient.post('/ai/chat/', { message });
    return response.data;
  },

  /**
   * Get user's AI conversations.
   */
  async getConversations(): Promise<AIConversation[]> {
    const response = await apiClient.get('/ai/conversations/');
    return response.data;
  },

  /**
   * Get messages for a specific conversation.
   */
  async getConversationMessages(conversationId: string): Promise<AIMessage[]> {
    const response = await apiClient.get(`/ai/conversations/${conversationId}/messages/`);
    return response.data;
  },

  // New API methods for additional features

  /**
   * Get detailed life path analysis for the user.
   */
  async getLifePathAnalysis(): Promise<LifePathAnalysis> {
    const response = await apiClient.get('/numerology/life-path-analysis/');
    return response.data;
  },

  /**
   * Check compatibility with another person.
   */
  async checkCompatibility(data: {
    partner_name: string;
    partner_birth_date: string;
    relationship_type: 'romantic' | 'business' | 'friendship' | 'family';
  }): Promise<CompatibilityCheck> {
    const response = await apiClient.post('/numerology/compatibility-check/', data);
    return response.data;
  },

  /**
   * Get user's compatibility check history.
   */
  async getCompatibilityHistory(): Promise<CompatibilityCheck[]> {
    const response = await apiClient.get('/numerology/compatibility-history/');
    return response.data;
  },

  /**
   * Get personalized remedies for the user.
   */
  async getPersonalizedRemedies(): Promise<Remedy[]> {
    const response = await apiClient.get('/numerology/remedies/');
    return response.data;
  },

  /**
   * Track remedy practice.
   */
  async trackRemedy(remedyId: string, data: {
    date: string;
    is_completed: boolean;
    notes?: string;
  }): Promise<RemedyTracking> {
    const response = await apiClient.post(`/numerology/remedies/${remedyId}/track/`, data);
    return response.data;
  },

  /**
   * Get full numerology report (combines birth date, name, and phone numerology).
   */
  async getFullNumerologyReport(): Promise<FullNumerologyReport> {
    const response = await apiClient.get('/numerology/full-report/');
    return response.data;
  },

  /**
   * Get Lo Shu Grid.
   */
  async getLoShuGrid(enhanced: boolean = false): Promise<LoShuGrid & { arrows?: any; arrow_interpretation?: string; enhanced_interpretation?: string }> {
    const params = enhanced ? { enhanced: 'true' } : {};
    const response = await apiClient.get('/numerology/lo-shu-grid/', { params });
    return response.data;
  },

  /**
   * Compare Lo Shu Grids between two people.
   */
  async compareLoShuGrids(person1Id: string, person2Id: string): Promise<{
    person1_name: string;
    person2_name: string;
    compatibility_score: number;
    position_comparison: Record<string, any>;
    matching_positions: number;
    complementary_positions: number;
    conflicting_positions: number;
    common_strength_arrows: string[];
    common_weakness_arrows: string[];
    insights: string[];
    recommendations: string[];
  }> {
    const response = await apiClient.post('/numerology/lo-shu-grid/compare/', {
      person1_id: person1Id,
      person2_id: person2Id
    });
    return response.data;
  },

  /**
   * Get Health Numerology profile.
   */
  async getHealthNumerology(): Promise<{
    id: string;
    stress_number: number;
    vitality_number: number;
    health_cycle_number: number;
    health_cycles: any;
    current_cycle: any;
    medical_timing: any;
    health_windows: any[];
    risk_periods: any[];
    interpretation: string;
    calculated_at: string;
    updated_at: string;
  }> {
    const response = await apiClient.get('/numerology/health/');
    return response.data;
  },

  /**
   * Analyze name for correction suggestions.
   */
  async analyzeNameCorrection(data: {
    name: string;
    name_type?: 'birth' | 'current' | 'nickname';
    target_number?: number;
    cultural_context?: string;
  }): Promise<{
    id: string;
    original_name: string;
    name_type: string;
    current_expression: number;
    target_expression: number | null;
    cultural_context: string;
    suggestions: Array<{
      name: string;
      expression: number;
      change: string;
      score: number;
      type: string;
    }>;
    phonetic_analysis: any;
    cultural_analysis: any;
    recommendations: string[];
    created_at: string;
    updated_at: string;
  }> {
    const response = await apiClient.post('/numerology/name-correction/', data);
    return response.data;
  },

  /**
   * Get Spiritual Numerology profile.
   */
  async getSpiritualNumerology(): Promise<{
    id: string;
    soul_contracts: any[];
    karmic_cycles: any[];
    rebirth_cycles: any[];
    divine_gifts: any[];
    spiritual_alignment: any;
    past_life_connections: any;
    interpretation: string;
    calculated_at: string;
    updated_at: string;
  }> {
    const response = await apiClient.get('/numerology/spiritual/');
    return response.data;
  },

  /**
   * Get Predictive Numerology profile.
   */
  async getPredictiveNumerology(forecastYears?: number): Promise<{
    nine_year_cycles: any[];
    life_forecast: any;
    breakthrough_years: any[];
    crisis_years: any[];
    opportunity_periods: any[];
    long_term_forecast: any;
    summary: string;
  }> {
    const params = forecastYears ? { forecast_years: forecastYears } : {};
    const response = await apiClient.get('/numerology/predictive/', { params });
    return response.data;
  },

  /**
   * Get Raj Yog detection for the current user or a specific person.
   */
  async getRajYogDetection(personId?: string): Promise<RajYogDetection> {
    const url = personId 
      ? `/numerology/raj-yog/${personId}/`
      : '/numerology/raj-yog/';
    const response = await apiClient.get(url);
    return response.data;
  },

  /**
   * Generate LLM explanation for Raj Yog detection.
   */
  async generateRajYogExplanation(personId?: string): Promise<Explanation> {
    const url = personId
      ? `/numerology/raj-yog/explanation/${personId}/`
      : '/numerology/raj-yog/explanation/';
    const response = await apiClient.post(url);
    return response.data;
  },

  /**
   * Get a specific explanation by ID.
   */
  async getExplanation(explanationId: string): Promise<Explanation> {
    const response = await apiClient.get(`/numerology/explanations/${explanationId}/`);
    return response.data;
  },

  /**
   * Get weekly report for the current user or a specific person.
   * Returns null if report cannot be generated (400/404) - user needs to calculate profile first.
   */
  async getWeeklyReport(weekStartDate?: string, personId?: string): Promise<WeeklyReport | null> {
    try {
      let url = '/numerology/weekly-report/';
      if (personId && weekStartDate) {
        url = `/numerology/weekly-report/${personId}/${weekStartDate}/`;
      } else if (personId) {
        url = `/numerology/weekly-report/${personId}/`;
      } else if (weekStartDate) {
        url = `/numerology/weekly-report/${weekStartDate}/`;
      }
      const response = await apiClient.get(url);
      return response.data;
    } catch (error: any) {
      // If 400 or 404, report cannot be generated - this is expected for new users
      if (error.response?.status === 400 || error.response?.status === 404) {
        return null;
      }
      // Re-throw other errors
      throw error;
    }
  },

  /**
   * Get yearly report for the current user or a specific person.
   */
  async getYearlyReport(year?: number, personId?: string): Promise<YearlyReport> {
    let url = '/numerology/yearly-report/';
    if (personId && year) {
      url = `/numerology/yearly-report/${personId}/${year}/`;
    } else if (personId) {
      url = `/numerology/yearly-report/${personId}/`;
    } else if (year) {
      url = `/numerology/yearly-report/${year}/`;
    }
    const response = await apiClient.get(url);
    return response.data;
  },

  /**
   * Get auspicious dates for activities.
   */
  async getAuspiciousDates(data: {
    activity_type?: string;
    start_date: string;
    end_date: string;
  }): Promise<Array<{
    date: string;
    personal_day_number: number;
    activity_type: string;
    reasoning: string;
    score: number;
  }>> {
    const params: any = {};
    if (data.activity_type) params.activity_type = data.activity_type;
    if (data.start_date) params.start_date = data.start_date;
    if (data.end_date) params.end_date = data.end_date;
    const response = await apiClient.get('/calendar/auspicious-dates/', { params });
    
    // Map response to include activity_type in each result
    const activityType = data.activity_type || '';
    return response.data.map((item: {
      date: string | Date;
      personal_day_number: number;
      score: number;
      reasoning: string;
    }) => ({
      date: typeof item.date === 'string' ? item.date : (item.date as Date).toISOString().split('T')[0],
      personal_day_number: item.personal_day_number,
      activity_type: activityType,
      reasoning: item.reasoning,
      score: item.score,
    }));
  },

  // ============================================================================
  // Feng Shui × Numerology Hybrid API
  // ============================================================================

  /**
   * Analyze property using Feng Shui × Numerology.
   */
  async analyzeFengShui(houseNumber: string, propertyAddress?: string): Promise<any> {
    const response = await apiClient.post('/numerology/feng-shui/analyze/', {
      house_number: houseNumber,
      property_address: propertyAddress || ''
    });
    return response.data;
  },

  /**
   * Get Feng Shui analysis by ID.
   */
  async getFengShuiAnalysis(analysisId: string): Promise<any> {
    const response = await apiClient.get(`/numerology/feng-shui/analysis/${analysisId}/`);
    return response.data;
  },

  /**
   * Optimize space layout.
   */
  async optimizeSpace(analysisId: string, roomData: any): Promise<any> {
    const response = await apiClient.post('/numerology/feng-shui/optimize-space/', {
      analysis_id: analysisId,
      room_data: roomData
    });
    return response.data;
  },

  // ============================================================================
  // Mental State AI × Numerology API
  // ============================================================================

  /**
   * Track emotional state.
   */
  async trackMentalState(data: {
    emotional_state: string;
    stress_level: number;
    mood_score: number;
    numerology_cycle?: string;
    notes?: string;
  }): Promise<any> {
    const response = await apiClient.post('/numerology/mental-state/track/', data);
    return response.data;
  },

  /**
   * Get mental state history.
   */
  async getMentalStateHistory(limit?: number): Promise<any> {
    const response = await apiClient.get('/numerology/mental-state/history/', {
      params: limit ? { limit } : {}
    });
    return response.data;
  },

  /**
   * Get wellbeing recommendations.
   */
  async getWellbeingRecommendations(): Promise<any> {
    const response = await apiClient.get('/numerology/mental-state/wellbeing-recommendations/');
    return response.data;
  },

  /**
   * Get mood cycle predictions.
   */
  async getMoodPredictions(): Promise<any> {
    const response = await apiClient.get('/numerology/mental-state/mood-predictions/');
    return response.data;
  }
};

// Name Numerology API types and methods
export interface NameNumerologyNumbers {
  expression: {
    raw_total: number;
    reduced: number;
    reduction_steps: number[];
  };
  soul_urge: {
    raw_total: number;
    reduced: number;
    reduction_steps: number[];
    letters: string[];
  };
  personality: {
    raw_total: number;
    reduced: number;
    reduction_steps: number[];
    letters: string[];
  };
  name_vibration: number;
}

export interface NameReport {
  id: string;
  user: string;
  name: string;
  name_type: 'birth' | 'current' | 'nickname';
  system: 'pythagorean' | 'chaldean';
  normalized_name: string;
  numbers: NameNumerologyNumbers;
  breakdown: Array<{
    letter: string;
    value: number;
    is_vowel: boolean;
    is_consonant: boolean;
  }>;
  explanation: {
    short_summary: string;
    long_explanation: string;
    action_points: string[];
    confidence_notes: string;
  } | null;
  explanation_error: string | null;
  computed_at: string;
  version: number;
}

export interface NamePreview {
  normalized_name: string;
  numbers: NameNumerologyNumbers;
  breakdown: Array<{
    letter: string;
    value: number;
    is_vowel: boolean;
    is_consonant: boolean;
  }>;
  word_totals: Array<{
    word: string;
    raw_total: number;
    reduced: number;
  }>;
}

export const nameNumerologyAPI = {
  /**
   * Generate name numerology report (queues task).
   */
  async generateReport(data: {
    name: string;
    name_type: 'birth' | 'current' | 'nickname';
    system: 'pythagorean' | 'chaldean';
    transliterate?: boolean;
    force_refresh?: boolean;
  }): Promise<{ job_id: string; status: string }> {
    const response = await apiClient.post('/name-numerology/generate/', data);
    return response.data;
  },

  /**
   * Preview name numerology results without persisting.
   */
  async preview(data: {
    name: string;
    system: 'pythagorean' | 'chaldean';
    transliterate?: boolean;
  }): Promise<NamePreview> {
    const response = await apiClient.post('/name-numerology/preview/', data);
    return response.data;
  },

  /**
   * Get a specific name report by ID.
   */
  async getReport(userId: string, reportId: string): Promise<NameReport> {
    const response = await apiClient.get(`/name-numerology/${userId}/${reportId}/`);
    return response.data;
  },

  /**
   * Get the latest name report for a user.
   */
  async getLatestReport(
    userId: string,
    nameType?: string,
    system?: string
  ): Promise<NameReport | null> {
    try {
      const params: any = {};
      if (nameType) params.name_type = nameType;
      if (system) params.system = system;
      const response = await apiClient.get(`/name-numerology/${userId}/latest/`, { params });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }
};

// Phone Numerology API types and methods
export interface PhoneComputed {
  digits: string[];
  evidence_map: {
    E1: string;
    E2: string;
    E3: string;
    E4: string;
    E5: string;
  };
  core_number: {
    raw_total: number;
    reduced: number;
    reduction_steps: number[];
  };
  positional_sequence: Array<{
    position: number;
    digit: string;
    running_total: number;
    running_reduced: number;
  }>;
  pair_sums: Array<{
    pair: string;
    raw: number;
    reduced: number;
  }>;
  repeated_digits: Record<string, number>;
  dominant_digit: string | null;
}

export interface PhoneReport {
  id: string;
  user: string;
  phone_raw: string;
  phone_e164: string;
  phone_e164_display: string;
  country: string | null;
  method: 'core' | 'full' | 'compatibility';
  computed: PhoneComputed;
  explanation: {
    short_summary: string;
    long_explanation: string;
    action_points: string[];
    confidence_notes: string;
  } | null;
  explanation_error: string | null;
  computed_at: string;
  version: number;
}

export interface PhonePreview {
  phone_e164: string;
  phone_display: string;
  country: string | null;
  computed: PhoneComputed;
}

export interface PhoneCompatibility {
  compatibility_score: number;
  core_number_1: number;
  core_number_2: number;
  difference: number;
  base_score: number;
  shared_digits_modifier: number;
  shared_digits: string[];
}

export const phoneNumerologyAPI = {
  /**
   * Generate phone numerology report (queues task).
   */
  async generateReport(data: {
    phone_number: string;
    country_hint?: string;
    method?: 'core' | 'full' | 'compatibility';
    persist?: boolean;
    force_refresh?: boolean;
    convert_vanity?: boolean;
  }): Promise<{ job_id: string; status: string }> {
    const response = await apiClient.post('/phone-numerology/generate/', data);
    return response.data;
  },

  /**
   * Preview phone numerology results without persisting.
   */
  async preview(data: {
    phone_number: string;
    country_hint?: string;
    method?: 'core' | 'full' | 'compatibility';
    convert_vanity?: boolean;
  }): Promise<PhonePreview> {
    const response = await apiClient.post('/phone-numerology/preview/', data);
    return response.data;
  },

  /**
   * Get a specific phone report by ID.
   */
  async getReport(userId: string, reportId: string): Promise<PhoneReport> {
    const response = await apiClient.get(`/phone-numerology/${userId}/${reportId}/`);
    return response.data;
  },

  /**
   * Get the latest phone report for a user.
   */
  async getLatestReport(
    userId: string,
    method?: string
  ): Promise<PhoneReport | null> {
    try {
      const params: any = {};
      if (method) params.method = method;
      const response = await apiClient.get(`/phone-numerology/${userId}/latest/`, { params });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Check compatibility between two phone numbers.
   */
  async checkCompatibility(data: {
    phone1?: string;
    phone2?: string;
    user_id1?: string;
    user_id2?: string;
    country_hint?: string;
    convert_vanity?: boolean;
  }): Promise<PhoneCompatibility> {
    const response = await apiClient.post('/phone-numerology/compatibility/', data);
    return response.data;
  }
};

// API methods for experts and consultations
export const expertAPI = {
  /**
   * Get list of available experts.
   */
  async getExperts(): Promise<Expert[]> {
    const response = await apiClient.get('/experts/');
    return response.data;
  },

  /**
   * Get details of a specific expert.
   */
  async getExpert(expertId: string): Promise<Expert> {
    const response = await apiClient.get(`/experts/${expertId}/`);
    return response.data;
  }
};

// API methods for consultations
export const consultationAPI = {
  /**
   * Book a consultation with an expert.
   */
  async bookConsultation(data: {
    expert: string;
    consultation_type: 'video' | 'chat' | 'phone';
    scheduled_at: string;
    duration_minutes?: number;
    notes?: string;
  }): Promise<Consultation> {
    const response = await apiClient.post('/consultations/book/', data);
    return response.data;
  },

  /**
   * Get user's upcoming consultations.
   */
  async getUpcomingConsultations(): Promise<Consultation[]> {
    const response = await apiClient.get('/consultations/upcoming/');
    return response.data;
  },

  /**
   * Get user's past consultations.
   */
  async getPastConsultations(): Promise<Consultation[]> {
    const response = await apiClient.get('/consultations/past/');
    return response.data;
  },

  /**
   * Rate a completed consultation.
   */
  async rateConsultation(consultationId: string, data: {
    rating: number;
    review_text?: string;
    is_anonymous?: boolean;
  }): Promise<ConsultationReview> {
    const response = await apiClient.post(`/consultations/${consultationId}/rate/`, data);
    return response.data;
  }
};

// API methods for people management
export const peopleAPI = {
  /**
   * Get list of people for the current user.
   */
  async getPeople(): Promise<Person[]> {
    const response = await apiClient.get('/people/');
    // Handle paginated response
    if (response.data && 'results' in response.data) {
      return response.data.results;
    }
    // Fallback for non-paginated response
    return Array.isArray(response.data) ? response.data : [];
  },

  /**
   * Create a new person.
   */
  async createPerson(data: {
    name: string;
    birth_date: string;
    relationship: string;
    notes?: string;
  }): Promise<Person> {
    const response = await apiClient.post('/people/', data);
    return response.data;
  },

  /**
   * Get details of a specific person.
   */
  async getPerson(personId: string): Promise<Person> {
    const response = await apiClient.get(`/people/${personId}/`);
    return response.data;
  },

  /**
   * Update a specific person.
   */
  async updatePerson(personId: string, data: {
    name?: string;
    birth_date?: string;
    relationship?: string;
    notes?: string;
    is_active?: boolean;
  }): Promise<Person> {
    const response = await apiClient.put(`/people/${personId}/`, data);
    return response.data;
  },

  /**
   * Delete a specific person (soft delete).
   */
  async deletePerson(personId: string): Promise<void> {
    await apiClient.delete(`/people/${personId}/`);
  },

  /**
   * Calculate numerology profile for a specific person.
   */
  async calculatePersonNumerology(personId: string, system: 'pythagorean' | 'chaldean' = 'pythagorean'): Promise<{
    message: string;
    profile: PersonNumerologyProfile;
  }> {
    const response = await apiClient.post(`/people/${personId}/calculate/`, { system });
    return response.data;
  },

  /**
   * Get numerology profile for a specific person.
   */
  async getPersonNumerologyProfile(personId: string): Promise<PersonNumerologyProfile | null> {
    try {
      const response = await apiClient.get(`/people/${personId}/profile/`);
      return response.data;
    } catch (error: any) {
      // Handle 404 errors gracefully - it's okay if profile doesn't exist yet
      if (error.response?.status === 404) {
        return null;
      }
      // Re-throw other errors
      throw error;
    }
  }
};

// API methods for report templates and generation
export const reportAPI = {
  /**
   * Get list of available report templates.
   */
  async getReportTemplates(): Promise<ReportTemplate[]> {
    const response = await apiClient.get('/report-templates/');
    // Handle paginated response
    if (response.data && 'results' in response.data) {
      return response.data.results;
    }
    // Fallback for non-paginated response
    return Array.isArray(response.data) ? response.data : [];
  },

  /**
   * Generate a new report for a person using a template.
   */
  async generateReport(data: {
    person_id: string;
    template_id: string;
  }): Promise<GeneratedReport> {
    const response = await apiClient.post('/reports/generate/', data);
    return response.data;
  },

  /**
   * Generate multiple reports at once.
   */
  async bulkGenerateReports(data: {
    person_ids: string[];
    template_ids: string[];
  }): Promise<{
    reports: GeneratedReport[];
    errors: string[];
  }> {
    const response = await apiClient.post('/reports/bulk-generate/', data);
    return response.data;
  },

  /**
   * Get list of user's generated reports.
   */
  async getGeneratedReports(): Promise<GeneratedReport[]> {
    const response = await apiClient.get('/reports/');
    // Handle paginated response
    if (response.data && 'results' in response.data) {
      return response.data.results;
    }
    // Fallback for non-paginated response
    return Array.isArray(response.data) ? response.data : [];
  },

  /**
   * Get a specific generated report.
   */
  async getGeneratedReport(reportId: string): Promise<GeneratedReport> {
    const response = await apiClient.get(`/reports/${reportId}/`);
    return response.data;
  }
};

// Dashboard API types and methods
export interface DashboardWidget {
  id: string;
  widget_type: string;
  widget_type_display: string;
  position: number;
  is_visible: boolean;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface UserActivity {
  id: string;
  activity_type: string;
  activity_type_display: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface QuickInsight {
  id: string;
  insight_type: string;
  insight_type_display: string;
  title: string;
  content: string;
  action_url?: string;
  action_text?: string;
  priority: number;
  is_read: boolean;
  expires_at?: string;
  created_at: string;
}

export interface DashboardOverview {
  widgets: DashboardWidget[];
  insights: QuickInsight[];
  recent_activities: UserActivity[];
  daily_reading?: DailyReading;
  numerology_profile?: NumerologyProfile;
  upcoming_events: any[];
  stats: {
    total_readings: number;
    profile_calculated: boolean;
    unread_insights: number;
  };
}

export const dashboardAPI = {
  /**
   * Get unified dashboard overview.
   */
  async getOverview(): Promise<DashboardOverview> {
    const response = await apiClient.get('/dashboard/overview/');
    return response.data;
  },

  /**
   * Get user's dashboard widgets.
   */
  async getWidgets(): Promise<DashboardWidget[]> {
    const response = await apiClient.get('/dashboard/widgets/');
    return response.data;
  },

  /**
   * Create or update a dashboard widget.
   */
  async createWidget(data: {
    widget_type: string;
    position?: number;
    config?: Record<string, any>;
  }): Promise<DashboardWidget> {
    const response = await apiClient.post('/dashboard/widgets/', data);
    return response.data;
  },

  /**
   * Update a dashboard widget.
   */
  async updateWidget(widgetId: string, data: Partial<DashboardWidget>): Promise<DashboardWidget> {
    const response = await apiClient.put(`/dashboard/widgets/${widgetId}/`, data);
    return response.data;
  },

  /**
   * Delete a dashboard widget.
   */
  async deleteWidget(widgetId: string): Promise<void> {
    await apiClient.delete(`/dashboard/widgets/${widgetId}/`);
  },

  /**
   * Reorder dashboard widgets.
   */
  async reorderWidgets(widgetPositions: Array<{ id: string; position: number }>): Promise<DashboardWidget[]> {
    const response = await apiClient.post('/dashboard/widgets/reorder/', {
      widget_positions: widgetPositions
    });
    return response.data;
  },

  /**
   * Get AI-generated insights.
   */
  async getInsights(limit?: number, unreadOnly?: boolean): Promise<QuickInsight[]> {
    const params: any = {};
    if (limit) params.limit = limit;
    if (unreadOnly) params.unread_only = 'true';
    const response = await apiClient.get('/dashboard/insights/', { params });
    return response.data;
  },

  /**
   * Mark an insight as read.
   */
  async markInsightRead(insightId: string): Promise<QuickInsight> {
    const response = await apiClient.post(`/dashboard/insights/${insightId}/mark-read/`);
    return response.data;
  }
};

// Calendar API types and methods
export interface NumerologyEvent {
  id: string;
  event_type: string;
  event_type_display: string;
  event_date: string;
  title: string;
  description: string;
  numerology_number?: number;
  importance: number;
  is_recurring: boolean;
  created_at: string;
}

export interface PersonalCycle {
  id: string;
  cycle_type: string;
  cycle_type_display: string;
  cycle_number: number;
  start_date: string;
  end_date: string;
  description: string;
  created_at: string;
}

export interface AuspiciousDate {
  id: string;
  activity_type: string;
  activity_type_display: string;
  activity_description: string;
  auspicious_date: string;
  numerology_score: number;
  reasoning: string;
  created_at: string;
}

export interface CalendarReminder {
  id: string;
  reminder_type: string;
  reminder_type_display: string;
  title: string;
  description: string;
  reminder_date: string;
  reminder_time?: string;
  numerology_context: string;
  is_completed: boolean;
  is_recurring: boolean;
  recurrence_pattern: string;
  created_at: string;
  updated_at: string;
}

export interface DateInsight {
  date: string;
  personal_day_number: number;
  personal_year_number: number;
  personal_month_number: number;
  weekday: string;
  insight: string;
}

export const calendarAPI = {
  /**
   * Get numerology events for a date range.
   */
  async getEvents(startDate?: string, endDate?: string): Promise<NumerologyEvent[]> {
    const params: any = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    const response = await apiClient.get('/calendar/events/', { params });
    // Handle paginated response
    if (response.data && 'results' in response.data) {
      return response.data.results;
    }
    // Fallback for non-paginated response
    return Array.isArray(response.data) ? response.data : [];
  },

  /**
   * Find auspicious dates for activities.
   */
  async findAuspiciousDates(data: {
    activity_type?: string;
    start_date?: string;
    end_date?: string;
    preferred_numbers?: number[];
  }): Promise<Array<{
    date: string;
    personal_day_number: number;
    score: number;
    reasoning: string;
  }>> {
    const params: any = {};
    if (data.activity_type) params.activity_type = data.activity_type;
    if (data.start_date) params.start_date = data.start_date;
    if (data.end_date) params.end_date = data.end_date;
    if (data.preferred_numbers) params.preferred_numbers = data.preferred_numbers.join(',');
    const response = await apiClient.get('/calendar/auspicious-dates/', { params });
    return response.data;
  },

  /**
   * Create a calendar reminder.
   */
  async createReminder(data: {
    reminder_type: string;
    title: string;
    description?: string;
    reminder_date: string;
    reminder_time?: string;
    numerology_context?: string;
    is_recurring?: boolean;
    recurrence_pattern?: string;
  }): Promise<CalendarReminder> {
    const response = await apiClient.post('/calendar/reminders/', data);
    return response.data;
  },

  /**
   * Get personal cycles.
   */
  async getPersonalCycles(startDate?: string, daysAhead?: number): Promise<Array<{
    type: string;
    date: string;
    number: number;
    title: string;
  }>> {
    const params: any = {};
    if (startDate) params.start_date = startDate;
    if (daysAhead) params.days_ahead = daysAhead;
    const response = await apiClient.get('/calendar/cycles/', { params });
    return response.data;
  },

  /**
   * Get numerology insight for a specific date.
   */
  async getDateInsight(date?: string): Promise<DateInsight> {
    const params: any = {};
    if (date) params.date = date;
    const response = await apiClient.get('/calendar/date-insight/', { params });
    return response.data;
  }
};

// Co-Pilot API types and methods
export interface CoPilotSuggestion {
  type: string;
  title: string;
  content: string;
  action_url?: string;
  action_text?: string;
  priority: number;
}

export interface DecisionAnalysis {
  decision_id?: string;
  decision_text: string;
  decision_date: string;
  personal_day_number: number;
  personal_year_number: number;
  personal_month_number: number;
  timing_score: number;
  timing_reasoning: string[];
  recommendation: string;
  suggested_actions: string[];
}

export const coPilotAPI = {
  /**
   * Get proactive suggestions from Co-Pilot.
   */
  async getSuggestions(): Promise<CoPilotSuggestion[]> {
    const response = await apiClient.post('/ai-co-pilot/suggest/');
    return response.data;
  },

  /**
   * Analyze a decision with numerology.
   */
  async analyzeDecision(data: {
    decision_text: string;
    decision_date?: string;
  }): Promise<DecisionAnalysis> {
    const response = await apiClient.post('/ai-co-pilot/analyze-decision/', data);
    return response.data;
  },

  /**
   * Get personalized insights.
   */
  async getInsights(): Promise<CoPilotSuggestion[]> {
    const response = await apiClient.get('/ai-co-pilot/insights/');
    return response.data;
  }
};

// Decision Engine API types and methods
export interface Decision {
  id: string;
  decision_text: string;
  decision_category: string;
  decision_date: string;
  timing_score: number;
  recommendation: string;
  is_made: boolean;
  outcome_recorded: boolean;
}

export const decisionAPI = {
  /**
   * Analyze a decision.
   */
  async analyzeDecision(data: {
    decision_text: string;
    decision_category?: string;
    decision_date?: string;
  }): Promise<DecisionAnalysis> {
    const response = await apiClient.post('/decisions/analyze/', data);
    return response.data;
  },

  /**
   * Get decision history.
   */
  async getHistory(limit?: number): Promise<Decision[]> {
    const params: any = {};
    if (limit) params.limit = limit;
    const response = await apiClient.get('/decisions/history/', { params });
    return response.data;
  },

  /**
   * Record decision outcome.
   */
  async recordOutcome(decisionId: string, data: {
    outcome_type: string;
    outcome_description: string;
    satisfaction_score?: number;
    actual_date?: string;
    notes?: string;
  }): Promise<void> {
    await apiClient.post(`/decisions/${decisionId}/outcome/`, data);
  },

  /**
   * Get decision recommendations.
   */
  async getRecommendations(category?: string): Promise<any[]> {
    const params: any = {};
    if (category) params.category = category;
    const response = await apiClient.get('/decisions/recommendations/', { params });
    return response.data;
  },

  /**
   * Get success rate.
   */
  async getSuccessRate(): Promise<{
    total_decisions: number;
    success_rate: number;
    average_satisfaction: number;
  }> {
    const response = await apiClient.get('/decisions/success-rate/');
    return response.data;
  }
};

// Analytics API types and methods
export interface PersonalAnalytics {
  period_days: number;
  total_actions: number;
  engagement_score: number;
  feature_usage: Array<{ action_type: string; count: number }>;
  daily_activity: Record<string, number>;
  average_daily_actions: number;
}

export const analyticsAPI = {
  /**
   * Get personal analytics.
   */
  async getPersonalAnalytics(days?: number): Promise<PersonalAnalytics> {
    const params: any = {};
    if (days) params.days = days;
    const response = await apiClient.get('/analytics/personal/', { params });
    return response.data;
  },

  /**
   * Get behavioral insights.
   */
  async getInsights(): Promise<any[]> {
    const response = await apiClient.get('/analytics/insights/');
    return response.data;
  },

  /**
   * Get growth metrics.
   */
  async getGrowthMetrics(periodDays?: number): Promise<any> {
    const params: any = {};
    if (periodDays) params.period_days = periodDays;
    const response = await apiClient.get('/analytics/growth/', { params });
    return response.data;
  },

  /**
   * Track behavior.
   */
  async trackBehavior(data: {
    action_type: string;
    action_details?: Record<string, any>;
    session_id?: string;
  }): Promise<void> {
    await apiClient.post('/analytics/track/', data);
  }
};

// Knowledge Graph API types and methods
export const assetNumerologyAPI = {
  /**
   * Calculate vehicle numerology
   */
  calculateVehicle: async (data: { license_plate: string }) => {
    const response = await apiClient.post('/numerology/vehicle/', data);
    return response.data;
  },

  /**
   * Calculate property numerology
   */
  calculateProperty: async (data: { house_number: string; floor_number?: number }) => {
    const response = await apiClient.post('/numerology/property/', data);
    return response.data;
  },

  /**
   * Calculate business numerology
   */
  calculateBusiness: async (data: {
    business_name: string;
    registration_number?: string;
    launch_date?: string;
  }) => {
    const response = await apiClient.post('/numerology/business/', data);
    return response.data;
  },

  /**
   * Calculate phone numerology (asset version)
   */
  calculatePhoneAsset: async (data: { phone_number: string }) => {
    const response = await apiClient.post('/numerology/phone-asset/', data);
    return response.data;
  },
};

export const relationshipNumerologyAPI = {
  /**
   * Calculate enhanced compatibility
   */
  calculateEnhancedCompatibility: async (data: {
    profile_1: any;
    profile_2: any;
    relationship_type?: string;
  }) => {
    const response = await apiClient.post('/numerology/relationship/enhanced-compatibility/', data);
    return response.data;
  },

  /**
   * Compare multiple partners
   */
  comparePartners: async (data: {
    user_profile: any;
    partner_profiles: Array<{ name: string; id?: string; profile: any }>;
  }) => {
    const response = await apiClient.post('/numerology/relationship/compare-partners/', data);
    return response.data;
  },

  /**
   * Calculate marriage harmony cycles
   */
  calculateMarriageHarmony: async (data: {
    profile_1: any;
    profile_2: any;
    marriage_date?: string;
  }) => {
    const response = await apiClient.post('/numerology/relationship/marriage-harmony/', data);
    return response.data;
  },
};

export const timingNumerologyAPI = {
  /**
   * Find best dates for an event
   */
  findBestDates: async (data: {
    birth_date: string;
    event_type: string;
    start_date: string;
    end_date: string;
    limit?: number;
  }) => {
    const response = await apiClient.post('/numerology/timing/best-dates/', data);
    return response.data;
  },

  /**
   * Find danger dates
   */
  findDangerDates: async (data: {
    birth_date: string;
    start_date: string;
    end_date: string;
  }) => {
    const response = await apiClient.post('/numerology/timing/danger-dates/', data);
    return response.data;
  },

  /**
   * Optimize event timing
   */
  optimizeTiming: async (data: {
    birth_date: string;
    event_type: string;
    preferred_month?: number;
    preferred_year?: number;
  }) => {
    const response = await apiClient.post('/numerology/timing/optimize/', data);
    return response.data;
  },
};

export const healthNumerologyAPI = {
  /**
   * Calculate health cycles
   */
  calculateHealthCycles: async (data: {
    birth_date?: string;
    full_name?: string;
    start_year?: number;
    end_year?: number;
  }) => {
    const response = await apiClient.post('/numerology/health/cycles/', data);
    return response.data;
  },

  /**
   * Calculate medical timing
   */
  calculateMedicalTiming: async (data: {
    birth_date: string;
    procedure_type: string;
    start_date: string;
    end_date: string;
  }) => {
    const response = await apiClient.post('/numerology/health/medical-timing/', data);
    return response.data;
  },

  /**
   * Calculate emotional vulnerabilities
   */
  calculateEmotionalVulnerabilities: async (data: {
    birth_date?: string;
    full_name?: string;
  }) => {
    const response = await apiClient.post('/numerology/health/emotional-vulnerabilities/', data);
    return response.data;
  },
};

export const nameCorrectionAPI = {
  /**
   * Analyze name for correction
   */
  analyzeName: async (data: {
    name: string;
    target_number?: number;
    cultural_context?: string;
  }) => {
    const response = await apiClient.post('/numerology/name-correction/analyze/', data);
    return response.data;
  },
};

export const spiritualNumerologyAPI = {
  /**
   * Get spiritual numerology profile
   */
  getSpiritualProfile: async (params?: { person_id?: string }) => {
    const response = await apiClient.get('/numerology/spiritual/', { params });
    return response.data;
  },
};

export const predictiveNumerologyAPI = {
  /**
   * Get predictive numerology profile
   */
  getPredictiveProfile: async (params?: { person_id?: string; year?: number }) => {
    const response = await apiClient.get('/numerology/predictive/', { params });
    return response.data;
  },
};

export const generationalNumerologyAPI = {
  /**
   * Analyze family generational numerology
   */
  analyzeFamily: async (data: { family_member_ids: string[] }) => {
    const response = await apiClient.post('/numerology/generational/family-analysis/', data);
    return response.data;
  },

  /**
   * Get generational patterns
   */
  getGenerationalPatterns: async (params?: { year?: number }) => {
    const response = await apiClient.get('/numerology/generational/patterns/', { params });
    return response.data;
  },

  /**
   * Analyze karmic contracts
   */
  analyzeKarmicContract: async (data: { parent_id: string; child_id: string }) => {
    const response = await apiClient.post('/numerology/generational/karmic-contract/', data);
    return response.data;
  },
};

export const fengShuiHybridAPI = {
  /**
   * Analyze space with Feng Shui × Numerology
   */
  analyzeSpace: async (data: {
    address: string;
    house_number?: string;
    floor_number?: number;
    room_layout?: any;
  }) => {
    const response = await apiClient.post('/numerology/feng-shui/analyze/', data);
    return response.data;
  },

  /**
   * Get Feng Shui analysis
   */
  getAnalysis: async (analysisId: string) => {
    const response = await apiClient.get(`/numerology/feng-shui/analysis/${analysisId}/`);
    return response.data;
  },

  /**
   * Optimize space
   */
  optimizeSpace: async (data: {
    analysis_id: string;
    optimization_goals?: string[];
  }) => {
    const response = await apiClient.post('/numerology/feng-shui/optimize-space/', data);
    return response.data;
  },
};

export const mentalStateAIAPI = {
  /**
   * Track mental state
   */
  trackMentalState: async (data: {
    mood: string;
    stress_level?: number;
    energy_level?: number;
    notes?: string;
  }) => {
    const response = await apiClient.post('/numerology/mental-state/track/', data);
    return response.data;
  },

  /**
   * Get mental state history
   */
  getMentalStateHistory: async (params?: { start_date?: string; end_date?: string }) => {
    const response = await apiClient.get('/numerology/mental-state/history/', { params });
    return response.data;
  },

  /**
   * Analyze mental state patterns
   */
  analyzeMentalState: async (params?: { period?: string }) => {
    const response = await apiClient.get('/numerology/mental-state/analyze/', { params });
    return response.data;
  },

  /**
   * Get stress patterns
   */
  getStressPatterns: async (params?: { period?: string }) => {
    const response = await apiClient.get('/numerology/mental-state/stress-patterns/', { params });
    return response.data;
  },

  /**
   * Get wellbeing recommendations
   */
  getWellbeingRecommendations: async () => {
    const response = await apiClient.get('/numerology/mental-state/wellbeing-recommendations/');
    return response.data;
  },

  /**
   * Get mood predictions
   */
  getMoodPredictions: async (params?: { days_ahead?: number }) => {
    const response = await apiClient.get('/numerology/mental-state/mood-predictions/', { params });
    return response.data;
  },
};

export const enhancedCyclesAPI = {
  /**
   * Get essence cycles
   */
  getEssenceCycles: async () => {
    const response = await apiClient.get('/numerology/essence-cycles/');
    return response.data;
  },

  /**
   * Get cycle timeline
   */
  getCycleTimeline: async (params?: { start_year?: number; end_year?: number }) => {
    const response = await apiClient.get('/numerology/cycle-timeline/', { params });
    return response.data;
  },

  /**
   * Get universal cycles
   */
  getUniversalCycles: async (params?: { year?: number; month?: number; day?: number }) => {
    const response = await apiClient.get('/numerology/universal-cycles/', { params });
    return response.data;
  },

  /**
   * Calculate cycle compatibility
   */
  calculateCycleCompatibility: async (data: {
    profile_1_name: string;
    profile_1_dob: string;
    profile_2_name: string;
    profile_2_dob: string;
    target_year: number;
  }) => {
    const response = await apiClient.post('/numerology/cycle-compatibility/', data);
    return response.data;
  },
};

export const featureFlagsAPI = {
  /**
   * Get all feature flags with user access status
   */
  getAllFlags: async () => {
    const response = await apiClient.get('/feature-flags/');
    return response.data;
  },

  /**
   * Get feature flag details
   */
  getFlag: async (name: string) => {
    const response = await apiClient.get(`/feature-flags/${name}/`);
    return response.data;
  },

  /**
   * Check if user can access a specific feature
   */
  checkAccess: async (featureName: string) => {
    const response = await apiClient.post('/feature-flags/check/', {
      feature_name: featureName,
    });
    return response.data;
  },

  /**
   * Get all features available to current user
   */
  getUserFeatures: async () => {
    const response = await apiClient.get('/users/features/');
    return response.data;
  },
};

export const meusAPI = {
  /**
   * Get all entities
   */
  getEntities: async (params?: { entity_type?: string; relationship_type?: string }) => {
    const response = await apiClient.get('/entity/', { params });
    return response.data;
  },

  /**
   * Create entity
   */
  createEntity: async (data: {
    entity_type: 'person' | 'asset' | 'event';
    name: string;
    date_of_birth?: string;
    relationship_type?: string;
    metadata?: Record<string, any>;
  }) => {
    const response = await apiClient.post('/entity/', data);
    return response.data;
  },

  /**
   * Get entity by ID
   */
  getEntity: async (id: string) => {
    const response = await apiClient.get(`/entity/${id}/`);
    return response.data;
  },

  /**
   * Update entity
   */
  updateEntity: async (id: string, data: Partial<{
    name: string;
    date_of_birth: string;
    relationship_type: string;
    metadata: Record<string, any>;
  }>) => {
    const response = await apiClient.put(`/entity/${id}/`, data);
    return response.data;
  },

  /**
   * Delete entity (soft delete)
   */
  deleteEntity: async (id: string) => {
    const response = await apiClient.delete(`/entity/${id}/`);
    return response.data;
  },

  /**
   * Get universe dashboard
   */
  getDashboard: async () => {
    const response = await apiClient.get('/universe/dashboard/');
    return response.data;
  },

  /**
   * Get influence map
   */
  getInfluenceMap: async (params?: { period?: string; period_value?: string }) => {
    const response = await apiClient.get('/universe/influence-map/', { params });
    return response.data;
  },

  /**
   * Cross-entity analysis
   */
  analyzeCrossEntity: async (data: {
    entity_ids: string[];
    analysis_type?: 'compatibility' | 'influence' | 'full';
  }) => {
    const response = await apiClient.post('/analysis/cross-entity/', data);
    return response.data;
  },

  /**
   * Get next action recommendations
   */
  getNextActions: async (params?: { limit?: number; priority?: string }) => {
    const response = await apiClient.get('/recommendations/next-actions/', { params });
    return response.data;
  },

  /**
   * Get universe events
   */
  getEvents: async () => {
    const response = await apiClient.get('/universe/events/');
    return response.data;
  },

  /**
   * Create universe event
   */
  createEvent: async (data: {
    event_type: string;
    event_date: string;
    title: string;
    description?: string;
    related_entities?: string[];
  }) => {
    const response = await apiClient.post('/universe/events/', data);
    return response.data;
  },
};

export const knowledgeGraphAPI = {
  /**
   * Discover patterns.
   */
  async discoverPatterns(): Promise<any[]> {
    const response = await apiClient.get('/knowledge-graph/patterns/');
    return response.data;
  },

  /**
   * Find number connections.
   */
  async findConnections(number: number): Promise<any[]> {
    const response = await apiClient.get('/knowledge-graph/connections/', {
      params: { number }
    });
    return response.data;
  },

  /**
   * Generate insights.
   */
  async generateInsights(): Promise<any[]> {
    const response = await apiClient.get('/knowledge-graph/insights/');
    return response.data;
  },

  /**
   * Query graph.
   */
  async queryGraph(queryType: string, params: Record<string, any>): Promise<any> {
    const response = await apiClient.post('/knowledge-graph/query/', {
      query_type: queryType,
      params
    });
    return response.data;
  },

  // ============================================================================
  // Generational Numerology API
  // ============================================================================

  /**
   * Analyze family generational numerology.
   */
  async analyzeFamilyGenerational(personIds: string[]): Promise<any> {
    const response = await apiClient.post('/numerology/generational/family-analysis/', {
      person_ids: personIds
    });
    return response.data;
  },

  /**
   * Get generational family analysis.
   */
  async getGenerationalFamilyAnalysis(): Promise<any> {
    const response = await apiClient.get('/numerology/generational/family-analysis/get/');
    return response.data;
  },

  /**
   * Analyze parent-child karmic contract.
   */
  async analyzeKarmicContract(parentId: string, childId: string): Promise<any> {
    const response = await apiClient.post('/numerology/generational/karmic-contract/', {
      parent_id: parentId,
      child_id: childId
    });
    return response.data;
  },

  /**
   * Get all karmic contracts.
   */
  async getKarmicContracts(): Promise<any> {
    const response = await apiClient.get('/numerology/generational/karmic-contracts/');
    return response.data;
  },

  /**
   * Get generational patterns.
   */
  async getGenerationalPatterns(personIds?: string[]): Promise<any> {
    const response = await apiClient.get('/numerology/generational/patterns/', {
      params: personIds ? { person_ids: personIds } : {}
    });
    return response.data;
  },

  /**
   * Get family compatibility matrix.
   */
  async getFamilyCompatibilityMatrix(personIds?: string[]): Promise<any> {
    const response = await apiClient.get('/numerology/generational/compatibility-matrix/', {
      params: personIds ? { person_ids: personIds } : {}
    });
    return response.data;
  }
};
