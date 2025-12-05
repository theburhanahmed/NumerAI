/**
 * API client for consultations and expert booking.
 */
import apiClient from './api-client';
import type {
  Expert,
  Consultation,
  ConsultationDetail,
  ConsultationBookingRequest,
  ConsultationRescheduleRequest,
  ConsultationCancelRequest,
  ConsultationReview,
  ExpertAvailability,
  TimeSlot,
  ExpertApplication,
  ExpertVerificationDocument,
  ExpertDashboard,
  MeetingLink,
} from '@/types/consultations';

export interface ExpertsResponse {
  count: number;
  page: number;
  page_size: number;
  results: Expert[];
}

export interface ConsultationsResponse {
  count: number;
  page: number;
  page_size: number;
  results: Consultation[];
}

export const consultationsAPI = {
  /**
   * Get list of experts.
   */
  async getExperts(filters?: {
    page?: number;
    page_size?: number;
    specialty?: string;
  }): Promise<ExpertsResponse> {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.page_size) params.append('page_size', filters.page_size.toString());
    if (filters?.specialty) params.append('specialty', filters.specialty);
    
    const response = await apiClient.get(`/consultations/experts/?${params.toString()}`);
    return response.data;
  },

  /**
   * Get expert details.
   */
  async getExpert(expertId: string): Promise<Expert> {
    const response = await apiClient.get(`/consultations/experts/${expertId}/`);
    return response.data;
  },

  /**
   * Get expert availability schedule.
   */
  async getExpertAvailability(expertId: string): Promise<ExpertAvailability[]> {
    const response = await apiClient.get(`/consultations/experts/${expertId}/availability/`);
    return response.data;
  },

  /**
   * Get available time slots for an expert on a specific date.
   */
  async getAvailableTimeSlots(
    expertId: string,
    date: string,
    duration?: number
  ): Promise<{ date: string; expert_id: string; duration_minutes: number; available_slots: string[] }> {
    const params = new URLSearchParams({ date });
    if (duration) params.append('duration', duration.toString());
    
    const response = await apiClient.get(`/consultations/experts/${expertId}/time-slots/?${params.toString()}`);
    return response.data;
  },

  /**
   * Book a consultation.
   */
  async bookConsultation(data: ConsultationBookingRequest): Promise<Consultation> {
    const response = await apiClient.post('/consultations/consultations/book/', data);
    return response.data;
  },

  /**
   * Get user's consultations.
   */
  async getMyConsultations(status?: string): Promise<ConsultationsResponse> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    
    const response = await apiClient.get(`/consultations/consultations/upcoming/?${params.toString()}`);
    return response.data;
  },

  /**
   * Get past consultations.
   */
  async getPastConsultations(): Promise<ConsultationsResponse> {
    const response = await apiClient.get('/consultations/consultations/past/');
    return response.data;
  },

  /**
   * Get consultation details.
   */
  async getConsultation(consultationId: string): Promise<ConsultationDetail> {
    const response = await apiClient.get(`/consultations/consultations/${consultationId}/`);
    return response.data;
  },

  /**
   * Confirm consultation (expert only).
   */
  async confirmConsultation(consultationId: string): Promise<Consultation> {
    const response = await apiClient.post(`/consultations/consultations/${consultationId}/confirm/`);
    return response.data;
  },

  /**
   * Cancel consultation.
   */
  async cancelConsultation(consultationId: string, data: ConsultationCancelRequest): Promise<Consultation> {
    const response = await apiClient.post(`/consultations/consultations/${consultationId}/cancel/`, data);
    return response.data;
  },

  /**
   * Reschedule consultation.
   */
  async rescheduleConsultation(
    consultationId: string,
    data: ConsultationRescheduleRequest
  ): Promise<Consultation> {
    const response = await apiClient.post(`/consultations/consultations/${consultationId}/reschedule/`, data);
    return response.data;
  },

  /**
   * Get meeting link.
   */
  async getMeetingLink(consultationId: string): Promise<MeetingLink> {
    const response = await apiClient.get(`/consultations/consultations/${consultationId}/meeting-link/`);
    return response.data;
  },

  /**
   * Start meeting.
   */
  async startMeeting(consultationId: string): Promise<Consultation> {
    const response = await apiClient.post(`/consultations/consultations/${consultationId}/start/`);
    return response.data;
  },

  /**
   * End meeting.
   */
  async endMeeting(consultationId: string): Promise<Consultation> {
    const response = await apiClient.post(`/consultations/consultations/${consultationId}/end/`);
    return response.data;
  },

  /**
   * Rate consultation.
   */
  async rateConsultation(
    consultationId: string,
    rating: number,
    reviewText: string,
    isAnonymous: boolean = false
  ): Promise<ConsultationReview> {
    const response = await apiClient.post(`/consultations/consultations/${consultationId}/rate/`, {
      rating,
      review_text: reviewText,
      is_anonymous: isAnonymous,
    });
    return response.data;
  },

  /**
   * Get expert dashboard (expert only).
   */
  async getExpertDashboard(): Promise<ExpertDashboard> {
    const response = await apiClient.get('/consultations/experts/dashboard/');
    return response.data;
  },

  /**
   * Update expert availability (expert only).
   */
  async updateExpertAvailability(availability: ExpertAvailability[]): Promise<{ message: string }> {
    const response = await apiClient.post('/consultations/experts/availability/update/', availability);
    return response.data;
  },

  /**
   * Get expert's consultations (expert only).
   */
  async getExpertConsultations(status?: string): Promise<ConsultationsResponse> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    
    const response = await apiClient.get(`/consultations/experts/consultations/?${params.toString()}`);
    return response.data;
  },
};

