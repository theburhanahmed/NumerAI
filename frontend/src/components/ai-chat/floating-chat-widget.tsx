'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquareIcon, XIcon, SendIcon, BotIcon, Minimize2Icon } from 'lucide-react';
import { useAIChat } from '@/contexts/ai-chat-context';
import { useAuth } from '@/contexts/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { GlassCard } from '@/components/glassmorphism/glass-card';
import { GlassButton } from '@/components/glassmorphism/glass-button';
import { toast } from 'sonner';
import { numerologyAPI } from '@/lib/numerology-api';

export function FloatingChatWidget() {
  const { isOpen, messages, isTyping, openChat, closeChat, toggleChat, addMessage, removeMessage, setIsTyping, clearMessages } = useAIChat();
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [inputMessage, setInputMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Don't show on landing page or auth pages, but allow it if chat is explicitly opened
  const hideOnPages = ['/', '/login', '/register', '/reset-password'];
  const shouldHide = (hideOnPages.some(page => pathname.startsWith(page)) || !user) && !isOpen;

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Auto-focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isTyping) return;

    if (!user) {
      toast.error('Please log in to use AI chat');
      router.push('/login');
      return;
    }

    const userMessage = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      sender: 'user' as const,
      timestamp: new Date()
    };

    addMessage(userMessage);
    const messageToSend = inputMessage.trim();
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await numerologyAPI.aiChat(messageToSend);
      
      const aiMessage = {
        id: response.message.id || (Date.now() + 1).toString(),
        content: response.message.content,
        sender: 'ai' as const,
        timestamp: new Date(response.message.created_at || Date.now())
      };
      
      addMessage(aiMessage);
    } catch (error: any) {
      console.error('Failed to send message:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to get response. Please try again.';
      toast.error(errorMessage);
      
      // Remove the user message on error
      removeMessage(userMessage.id);
    } finally {
      setIsTyping(false);
    }
  };

  const handleOpenFullChat = () => {
    router.push('/ai-chat');
    closeChat();
  };

  // Reset minimized state when chat is opened
  useEffect(() => {
    if (isOpen) {
      setIsMinimized(false);
    }
  }, [isOpen]);

  if (shouldHide) {
    return null;
  }

  if (!isOpen || isMinimized) {
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <motion.button
          onClick={() => {
            setIsMinimized(false);
            openChat();
          }}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center relative group"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <MessageSquareIcon className="w-6 h-6" />
          {messages.length > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold"
            >
              {messages.length}
            </motion.div>
          )}
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-100 blur-xl -z-10"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />
        </motion.button>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]"
        >
          <GlassCard variant="liquid-premium" className="p-0 overflow-hidden">
            <div className="liquid-glass-content">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <BotIcon className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      AI Numerologist
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Always here to help
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={() => setIsMinimized(true)}
                    className="p-1.5 hover:bg-white/10 dark:hover:bg-white/5 rounded-lg transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Minimize2Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </motion.button>
                  <motion.button
                    onClick={closeChat}
                    className="p-1.5 hover:bg-white/10 dark:hover:bg-white/5 rounded-lg transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <XIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </motion.button>
                </div>
              </div>

              {/* Messages */}
              <div className="h-96 overflow-y-auto p-4 space-y-4 bg-white/30 dark:bg-white/5">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <motion.div
                      className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4"
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <MessageSquareIcon className="w-8 h-8 text-white" />
                    </motion.div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Start a conversation
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Ask me anything about numerology
                    </p>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl p-3 ${
                            message.sender === 'user'
                              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                              : 'bg-white/80 dark:bg-white/10 backdrop-blur-xl text-gray-900 dark:text-white'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                      </motion.div>
                    ))}
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                      >
                        <div className="bg-white/80 dark:bg-white/10 backdrop-blur-xl rounded-2xl p-3">
                          <div className="flex gap-1">
                            <motion.div
                              className="w-2 h-2 bg-gray-600 dark:bg-gray-400 rounded-full"
                              animate={{ y: [0, -8, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                            />
                            <motion.div
                              className="w-2 h-2 bg-gray-600 dark:bg-gray-400 rounded-full"
                              animate={{ y: [0, -8, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                            />
                            <motion.div
                              className="w-2 h-2 bg-gray-600 dark:bg-gray-400 rounded-full"
                              animate={{ y: [0, -8, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-white/10">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask me anything..."
                    className="flex-1 px-4 py-2 bg-white/50 dark:bg-white/10 backdrop-blur-xl border border-gray-300 dark:border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white/50 text-sm"
                    disabled={isTyping}
                  />
                  <GlassButton
                    type="submit"
                    variant="liquid"
                    size="sm"
                    disabled={!inputMessage.trim() || isTyping}
                    className="flex-shrink-0"
                  >
                    <SendIcon className="w-4 h-4" />
                  </GlassButton>
                </div>
                <button
                  type="button"
                  onClick={handleOpenFullChat}
                  className="mt-2 text-xs text-purple-600 dark:text-purple-400 hover:underline w-full text-center"
                >
                  Open full chat →
                </button>
              </form>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

