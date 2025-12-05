/**
 * TypeScript types for consultations and expert booking system.
 */

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
  verification_status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'suspended';
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Consultation {
  id: string;
  user: string;
  expert: Expert | string;
  consultation_type: 'video' | 'chat' | 'phone';
  scheduled_at: string;
  duration_minutes: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  notes: string;
  meeting_link?: string;
  meeting_room_id?: string;
  meeting_started_at?: string;
  meeting_ended_at?: string;
  price?: number;
  payment_status: 'pending' | 'paid' | 'refunded' | 'failed';
  cancellation_reason?: string;
  can_be_cancelled: boolean;
  can_be_rescheduled: boolean;
  created_at: string;
  updated_at: string;
}

export interface ConsultationDetail extends Consultation {
  user_name: string;
  user_email: string;
}

export interface ConsultationBookingRequest {
  expert_id: string;
  consultation_type: 'video' | 'chat' | 'phone';
  scheduled_at: string;
  duration_minutes: number;
  notes?: string;
}

export interface ConsultationRescheduleRequest {
  scheduled_at: string;
  duration_minutes?: number;
}

export interface ConsultationCancelRequest {
  cancellation_reason?: string;
}

export interface ConsultationReview {
  id: string;
  consultation: string;
  rating: number;
  review_text: string;
  is_anonymous: boolean;
  created_at: string;
}

export interface ExpertAvailability {
  id: string;
  expert: string;
  day_of_week: number; // 0-6 (Monday-Sunday)
  start_time: string;
  end_time: string;
  timezone: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface TimeSlot {
  datetime: string;
  available: boolean;
}

export interface ExpertApplication {
  id: string;
  user: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  name: string;
  email: string;
  phone?: string;
  specialty: string;
  experience_years: number;
  bio: string;
  application_notes?: string;
  rejection_reason?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  submitted_at: string;
  updated_at: string;
}

export interface ExpertVerificationDocument {
  id: string;
  expert?: string;
  application?: string;
  document_type: 'certificate' | 'license' | 'education' | 'experience' | 'id_proof' | 'other';
  document_name: string;
  description?: string;
  file: string;
  file_size?: number;
  is_verified: boolean;
  uploaded_at: string;
}

export interface ExpertDashboard {
  expert: Expert;
  upcoming_consultations: Consultation[];
  pending_confirmations: number;
  stats: {
    total_consultations: number;
    completed: number;
    rating: number;
  };
}

export interface MeetingLink {
  meeting_link: string;
  meeting_room_id: string;
}

// Chat Types

export interface ExpertChatConversation {
  id: string;
  user: string;
  user_name: string;
  expert: Expert | string;
  consultation?: string;
  status: 'active' | 'archived' | 'blocked' | 'closed';
  last_message_at?: string;
  last_message_preview?: string;
  unread_count_user: number;
  unread_count_expert: number;
  created_at: string;
  updated_at: string;
}

export interface ExpertChatMessage {
  id: string;
  conversation: string;
  sender_type: 'user' | 'expert' | 'system';
  sender_user?: string;
  sender_name?: string;
  message_content: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  file_attachment?: string;
  file_name?: string;
  file_size?: number;
  is_read: boolean;
  read_at?: string;
  is_edited: boolean;
  edited_at?: string;
  reply_to?: string;
  created_at: string;
}

export interface SendMessageRequest {
  message_content: string;
  message_type?: 'text' | 'image' | 'file' | 'system';
  reply_to?: string;
}

