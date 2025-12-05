/**
 * API client for expert chat functionality.
 */
import apiClient from './api-client';
import type {
  ExpertChatConversation,
  ExpertChatMessage,
  SendMessageRequest,
} from '@/types/consultations';

export interface ConversationsResponse {
  count: number;
  page: number;
  page_size: number;
  results: ExpertChatConversation[];
}

export interface MessagesResponse {
  count: number;
  page: number;
  page_size: number;
  results: ExpertChatMessage[];
}

export const chatAPI = {
  /**
   * Get or create a chat conversation.
   */
  async getOrCreateConversation(expertId: string, consultationId?: string): Promise<ExpertChatConversation> {
    const data: any = { expert_id: expertId };
    if (consultationId) data.consultation_id = consultationId;
    
    const response = await apiClient.post('/consultations/chat/', data);
    return response.data;
  },

  /**
   * Get all conversations for user/expert.
   */
  async getConversations(filters?: {
    page?: number;
    page_size?: number;
    status?: string;
  }): Promise<ConversationsResponse> {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.page_size) params.append('page_size', filters.page_size.toString());
    if (filters?.status) params.append('status', filters.status);
    
    const response = await apiClient.get(`/consultations/chat/list/?${params.toString()}`);
    return response.data;
  },

  /**
   * Get messages in a conversation.
   */
  async getMessages(
    conversationId: string,
    options?: {
      page?: number;
      page_size?: number;
      since?: string;
    }
  ): Promise<MessagesResponse> {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.page_size) params.append('page_size', options.page_size.toString());
    if (options?.since) params.append('since', options.since);
    
    const response = await apiClient.get(`/consultations/chat/${conversationId}/messages/?${params.toString()}`);
    return response.data;
  },

  /**
   * Send a message.
   */
  async sendMessage(
    conversationId: string,
    data: SendMessageRequest,
    file?: File
  ): Promise<ExpertChatMessage> {
    const formData = new FormData();
    formData.append('message_content', data.message_content);
    if (data.message_type) formData.append('message_type', data.message_type);
    if (data.reply_to) formData.append('reply_to', data.reply_to);
    if (file) formData.append('file', file);
    
    const response = await apiClient.post(`/consultations/chat/${conversationId}/send/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Mark messages as read.
   */
  async markAsRead(conversationId: string): Promise<{ message: string }> {
    const response = await apiClient.post(`/consultations/chat/${conversationId}/read/`);
    return response.data;
  },

  /**
   * Upload file in chat.
   */
  async uploadFile(conversationId: string, file: File): Promise<ExpertChatMessage> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('message_content', file.name);
    formData.append('message_type', 'file');
    
    const response = await apiClient.post(`/consultations/chat/${conversationId}/send/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Delete a message.
   */
  async deleteMessage(messageId: string): Promise<void> {
    await apiClient.delete(`/consultations/chat/messages/${messageId}/`);
  },

  /**
   * Archive a conversation.
   */
  async archiveConversation(conversationId: string): Promise<{ message: string }> {
    const response = await apiClient.post(`/consultations/chat/${conversationId}/archive/`);
    return response.data;
  },

  /**
   * Block a conversation.
   */
  async blockConversation(conversationId: string): Promise<{ message: string }> {
    const response = await apiClient.post(`/consultations/chat/${conversationId}/block/`);
    return response.data;
  },

  /**
   * Get total unread count.
   */
  async getUnreadCount(): Promise<{ unread_count: number }> {
    const response = await apiClient.get('/consultations/chat/unread-count/');
    return response.data;
  },
};

