'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon, SendIcon, BotIcon, UserIcon, MessageSquareIcon } from 'lucide-react';
import { CosmicPageLayout } from '@/components/cosmic/cosmic-page-layout';
import { SpaceCard } from '@/components/space/space-card';
import { SpaceButton } from '@/components/space/space-button';
import { TouchOptimizedButton } from '@/components/buttons/touch-optimized-button';
import { numerologyAPI } from '@/lib/numerology-api';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export default function AIChatPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=${encodeURIComponent('/ai-chat')}`);
    }
  }, [user, authLoading, router]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isTyping) return;
    
    if (!user) {
      toast.error('Please log in to use AI chat');
      router.push('/login');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await numerologyAPI.aiChat(messageToSend);
      
      // Store conversation ID if this is the first message
      if (response.conversation_id && !conversationId) {
        setConversationId(response.conversation_id);
      }

      const aiMessage: Message = {
        id: response.message.id || (Date.now() + 1).toString(),
        content: response.message.content,
        sender: 'ai',
        timestamp: new Date(response.message.created_at || Date.now())
      };
      
      setMessages(prev => [...prev, aiMessage]);
      toast.success('Response received');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || error?.response?.data?.message || error?.message || 'Failed to get response. Please try again.';
      console.error('Failed to send message:', errorMessage, error);
      toast.error(errorMessage);
      
      // Remove the user message on error
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
    } finally {
      setIsTyping(false);
    }
  };
  const handleSuggestedQuestion = (question: string) => {
    setInputMessage(question);
    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) {
        form.dispatchEvent(new Event('submit', {
          bubbles: true,
          cancelable: true
        }));
      }
    }, 100);
  };
  const suggestedQuestions = ['What does my Life Path number mean?', 'How can I improve my relationships?', 'What are my lucky numbers today?', 'Tell me about my destiny number'];
  return (
    <CosmicPageLayout>
      {/* Header */}
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <SparklesIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-['Playfair_Display'] font-bold text-white">
              AI Numerologist
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <motion.div
                className="w-2 h-2 bg-green-400 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.7, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              />
              <p className="text-sm text-white/70">Always here to guide you</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto min-h-[60vh] mb-8">
        {messages.length === 0 ? (
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
            >
              <SpaceCard variant="premium" className="p-12 text-center">
                <motion.div
                  className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-3xl flex items-center justify-center text-white mb-6 mx-auto shadow-xl"
                  animate={{
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                  }}
                >
                  <MessageSquareIcon className="w-10 h-10" />
                </motion.div>
                <h2 className="text-2xl font-['Playfair_Display'] font-bold mb-3 text-white">
                  Start a Conversation
                </h2>
                <p className="text-white/70 mb-6 max-w-md mx-auto">
                  Ask me anything about numerology, your life path, or get
                  personalized guidance for your journey.
                </p>
              </SpaceCard>
            </motion.div>
          </div>
        ) : (
          <div className="space-y-6 max-w-4xl mx-auto">
            <AnimatePresence>
              {messages.map((message, index) => <motion.div key={message.id} initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} exit={{
            opacity: 0,
            y: -20
          }} transition={{
            delay: index * 0.05
          }} className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  <motion.div
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                      message.sender === 'ai'
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600'
                        : 'bg-[#1a2942]/60 backdrop-blur-xl border border-cyan-500/20'
                    }`}
                    whileHover={{
                      scale: 1.1,
                      rotate: 5,
                    }}
                  >
                    {message.sender === 'ai' ? (
                      <BotIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    ) : (
                      <UserIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    )}
                  </motion.div>

                  {/* Message Bubble */}
                  <SpaceCard
                    variant={message.sender === 'ai' ? 'default' : 'premium'}
                    className={`max-w-[85%] md:max-w-md p-4 md:p-5 ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-cyan-500/90 to-blue-600/90'
                        : ''
                    }`}
                  >
                    <p
                      className={`leading-relaxed text-sm md:text-base ${
                        message.sender === 'ai' ? 'text-white/90' : 'text-white'
                      }`}
                    >
                      {message.content}
                    </p>
                    <p
                      className={`text-xs mt-3 ${
                        message.sender === 'ai' ? 'text-white/60' : 'text-white/80'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </SpaceCard>
                </motion.div>)}
            </AnimatePresence>

            {/* Typing Indicator */}
            {isTyping && <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} exit={{
          opacity: 0
        }} className="flex gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <BotIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <SpaceCard variant="default" className="p-4 md:p-5">
                  <div className="flex gap-2">
                    <motion.div
                      className="w-2 h-2 bg-cyan-400 rounded-full"
                      animate={{
                        y: [0, -8, 0],
                      }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: 0,
                      }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-cyan-400 rounded-full"
                      animate={{
                        y: [0, -8, 0],
                      }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: 0.2,
                      }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-cyan-400 rounded-full"
                      animate={{
                        y: [0, -8, 0],
                      }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: 0.4,
                      }}
                    />
                  </div>
                </SpaceCard>
              </motion.div>}
          </div>
        )}
      </div>

      {/* Suggested Questions */}
      {messages.length === 0 && <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} className="px-4 md:px-6 pb-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <p className="text-sm font-semibold text-white/80 mb-3">
              Suggested questions:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {suggestedQuestions.map((question, index) => <motion.div key={index} initial={{
            opacity: 0,
            y: 10
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: index * 0.1
          }}>
                  <SpaceCard
                    variant="default"
                    className="p-4 text-left cursor-pointer group"
                    onClick={() => handleSuggestedQuestion(question)}
                  >
                    <p className="text-sm text-white/80 group-hover:text-cyan-400 transition-colors">
                      {question}
                    </p>
                  </SpaceCard>
                </motion.div>)}
            </div>
          </div>
        </motion.div>}

      {/* Input Area */}
      <motion.div
        initial={{
          y: 100,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        className="relative z-10 backdrop-blur-2xl bg-[#1a2942]/60 border-t border-cyan-500/20 px-4 md:px-6 py-4"
      >
        <form
          onSubmit={handleSendMessage}
          className="flex gap-2 md:gap-3 max-w-4xl mx-auto"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask me anything about numerology..."
            className="flex-1 px-4 md:px-5 py-3 md:py-4 bg-[#0a1628]/60 backdrop-blur-xl border border-cyan-500/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 transition-all text-sm md:text-base"
            disabled={isTyping}
          />
          <TouchOptimizedButton
            type="submit"
            variant="primary"
            size="md"
            icon={<SendIcon className="w-4 h-4 md:w-5 md:h-5" />}
            disabled={isTyping || !inputMessage.trim()}
            ariaLabel="Send message"
          >
            <span className="hidden sm:inline">Send</span>
          </TouchOptimizedButton>
        </form>
      </motion.div>
    </CosmicPageLayout>
  );
}