/**
 * API client for expert verification and application.
 */
import apiClient from './api-client';
import type {
  ExpertApplication,
  ExpertVerificationDocument,
} from '@/types/consultations';

export interface VerificationStatus {
  verification_status: string;
  is_verified?: boolean;
  verified_at?: string;
  verification_notes?: string;
  application_status?: string;
  application_id?: string;
}

export const expertAPI = {
  /**
   * Apply as an expert.
   */
  async applyAsExpert(data: {
    name: string;
    email: string;
    phone?: string;
    specialty: string;
    experience_years: number;
    bio: string;
    application_notes?: string;
  }): Promise<ExpertApplication> {
    const response = await apiClient.post('/consultations/experts/apply/', data);
    return response.data;
  },

  /**
   * Get my application status.
   */
  async getMyApplication(): Promise<ExpertApplication> {
    const response = await apiClient.get('/consultations/experts/my-application/');
    return response.data;
  },

  /**
   * Upload verification document.
   */
  async uploadVerificationDocument(
    file: File,
    documentType: string,
    documentName: string,
    description?: string
  ): Promise<ExpertVerificationDocument> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);
    formData.append('document_name', documentName);
    if (description) formData.append('description', description);
    
    const response = await apiClient.post('/consultations/experts/upload-document/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Get verification status.
   */
  async getVerificationStatus(): Promise<VerificationStatus> {
    const response = await apiClient.get('/consultations/experts/verification-status/');
    return response.data;
  },

  /**
   * Update application (before review).
   */
  async updateApplication(data: Partial<ExpertApplication>): Promise<ExpertApplication> {
    const response = await apiClient.patch('/consultations/experts/my-application/', data);
    return response.data;
  },
};

