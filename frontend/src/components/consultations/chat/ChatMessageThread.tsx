'use client';

import React, { useEffect, useRef } from 'react';
import { format } from 'date-fns';
import type { ExpertChatMessage } from '@/types/consultations';
import { User, Bot } from 'lucide-react';

interface ChatMessageThreadProps {
  messages: ExpertChatMessage[];
  currentUserId?: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export function ChatMessageThread({
  messages,
  currentUserId,
  onLoadMore,
  hasMore,
}: ChatMessageThreadProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom on new messages
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleScroll = () => {
    if (!containerRef.current || !onLoadMore || !hasMore) return;
    
    const { scrollTop } = containerRef.current;
    if (scrollTop === 0) {
      onLoadMore();
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 space-y-4"
      onScroll={handleScroll}
    >
      {messages.map((message) => {
        const isCurrentUser = message.sender_type === 'user';
        const isSystem = message.sender_type === 'system';

        if (isSystem) {
          return (
            <div key={message.id} className="flex justify-center">
              <div className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm px-3 py-1 rounded-full">
                {message.message_content}
              </div>
            </div>
          );
        }

        return (
          <div
            key={message.id}
            className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              isCurrentUser ? 'bg-blue-500' : 'bg-purple-500'
            } text-white`}>
              {isCurrentUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={`flex flex-col max-w-[70%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
              <div className={`rounded-lg px-4 py-2 ${
                isCurrentUser
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
              }`}>
                {message.reply_to && (
                  <div className="text-xs opacity-75 mb-1 border-l-2 pl-2">
                    Replying to: {message.reply_to}
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap">{message.message_content}</p>
                {message.file_attachment && (
                  <a
                    href={message.file_attachment}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs underline mt-1 block"
                  >
                    📎 {message.file_name || 'File'}
                  </a>
                )}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {format(new Date(message.created_at), 'HH:mm')}
                {message.is_read && isCurrentUser && ' ✓✓'}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}

