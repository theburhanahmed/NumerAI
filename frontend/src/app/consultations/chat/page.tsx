'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MessageSquare, Send, Paperclip } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { ChatMessageThread } from '@/components/consultations/chat/ChatMessageThread';
import { ChatInput } from '@/components/consultations/chat/ChatInput';
import { chatAPI } from '@/lib/chat-api';
import { consultationsAPI } from '@/lib/consultations-api';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import type { ExpertChatConversation, ExpertChatMessage, Expert } from '@/types/consultations';

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const expertId = searchParams.get('expert_id');
  const conversationId = searchParams.get('conversation_id');

  const [conversations, setConversations] = useState<ExpertChatConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<ExpertChatConversation | null>(null);
  const [messages, setMessages] = useState<ExpertChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadMessages = useCallback(async (convId: string, silent = false) => {
    try {
      const data = await chatAPI.getMessages(convId, { page_size: 50 });
      setMessages(data.results);
      // Mark as read
      if (!silent) {
        await chatAPI.markAsRead(convId);
      }
    } catch (error) {
      if (!silent) {
        toast.error('Failed to load messages');
      }
    }
  }, []);

  const loadConversations = useCallback(async () => {
    try {
      const data = await chatAPI.getConversations();
      setConversations(data.results);
    } catch (error) {
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, []);

  const createOrLoadConversation = useCallback(async (expertId: string) => {
    try {
      const conversation = await chatAPI.getOrCreateConversation(expertId);
      setActiveConversation(conversation);
      loadMessages(conversation.id);
      // Update conversations list
      setConversations(prev => {
        if (!prev.find(c => c.id === conversation.id)) {
          return [conversation, ...prev];
        }
        return prev;
      });
    } catch (error) {
      toast.error('Failed to create conversation');
    }
  }, [loadMessages]);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user, loadConversations]);

  useEffect(() => {
    if (conversationId) {
      const conv = conversations.find(c => c.id === conversationId);
      if (conv) {
        setActiveConversation(conv);
        loadMessages(conv.id);
      }
    } else if (expertId) {
      createOrLoadConversation(expertId);
    }
  }, [conversationId, expertId, conversations, loadMessages, createOrLoadConversation]);

  useEffect(() => {
    if (activeConversation) {
      // Poll for new messages
      pollIntervalRef.current = setInterval(() => {
        loadMessages(activeConversation.id, true);
      }, 3000); // Poll every 3 seconds

      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
      };
    }
  }, [activeConversation, loadMessages]);

  const handleSendMessage = async (content: string, file?: File) => {
    if (!activeConversation) return;

    setSending(true);
    try {
      if (file) {
        await chatAPI.uploadFile(activeConversation.id, file);
      } else {
        await chatAPI.sendMessage(activeConversation.id, {
          message_content: content,
          message_type: 'text',
        });
      }
      // Reload messages
      await loadMessages(activeConversation.id);
      // Reload conversations to update last message
      await loadConversations();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 p-8">
      <div className="max-w-6xl mx-auto h-[calc(100vh-4rem)]">
        <div className="grid grid-cols-3 gap-4 h-full">
          {/* Conversations List */}
          <GlassCard className="p-4 overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Conversations</h2>
            <div className="space-y-2">
              {conversations.map((conv) => {
                const expert = typeof conv.expert === 'object' ? conv.expert : null;
                return (
                  <button
                    key={conv.id}
                    onClick={() => {
                      setActiveConversation(conv);
                      loadMessages(conv.id);
                      router.push(`/consultations/chat?conversation_id=${conv.id}`);
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      activeConversation?.id === conv.id
                        ? 'bg-blue-100 dark:bg-blue-900'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="font-medium">{expert?.name || 'Expert'}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {conv.last_message_preview || 'No messages yet'}
                    </div>
                    {conv.unread_count_user > 0 && (
                      <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        {conv.unread_count_user} unread
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </GlassCard>

          {/* Chat Area */}
          <div className="col-span-2 flex flex-col">
            {activeConversation ? (
              <>
                <GlassCard className="p-4 mb-4">
                  <h3 className="text-lg font-semibold">
                    {typeof activeConversation.expert === 'object'
                      ? activeConversation.expert.name
                      : 'Expert'}
                  </h3>
                </GlassCard>
                <GlassCard className="flex-1 flex flex-col overflow-hidden">
                  <ChatMessageThread
                    messages={messages}
                    currentUserId={user?.id}
                  />
                  <ChatInput
                    onSendMessage={handleSendMessage}
                    disabled={sending}
                  />
                </GlassCard>
              </>
            ) : (
              <GlassCard className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Select a conversation to start chatting</p>
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

