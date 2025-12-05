'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon, SendIcon, BotIcon, UserIcon, MessageSquareIcon } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { FloatingOrbs } from '@/components/ui/floating-orbs';
import { AmbientParticles } from '@/components/ui/ambient-particles';
import { MagneticCard } from '@/components/ui/magnetic-card';
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
      console.error('Failed to send message:', error);
      toast.error(error.response?.data?.error || 'Failed to get response. Please try again.');
      
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
  return <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 transition-colors duration-500 flex flex-col relative overflow-hidden">
      <AmbientParticles />
      <FloatingOrbs />
      {/* Page Header */}
      <div className="relative z-10 px-4 md:px-6 py-6 border-b border-gray-200 dark:border-white/10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <motion.div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg" animate={{
            rotate: [0, 5, -5, 0]
          }} transition={{
            duration: 2,
            repeat: Infinity
          }}>
              <SparklesIcon className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-white dark:via-purple-300 dark:to-blue-300 bg-clip-text text-transparent">
                AI Numerologist
              </h1>
              <div className="flex items-center gap-2">
                <motion.div className="w-2 h-2 bg-green-500 rounded-full" animate={{
                scale: [1, 1.2, 1],
                opacity: [1, 0.7, 1]
              }} transition={{
                duration: 2,
                repeat: Infinity
              }} />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Always here to guide you
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 md:py-8 relative z-10">
        {messages.length === 0 ? <div className="max-w-4xl mx-auto">
            <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }}>
              <GlassCard variant="liquid-premium" className="p-12 text-center">
                <div className="liquid-glass-content">
                  <motion.div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-3xl flex items-center justify-center text-white mb-6 mx-auto shadow-xl" animate={{
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              }} transition={{
                duration: 4,
                repeat: Infinity
              }}>
                    <MessageSquareIcon className="w-10 h-10" />
                  </motion.div>
                  <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                    Start a Conversation
                  </h2>
                  <p className="text-gray-600 dark:text-white/70 mb-6 max-w-md mx-auto">
                    Ask me anything about numerology, your life path, or get
                    personalized guidance for your journey.
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          </div> : <div className="space-y-6 max-w-4xl mx-auto">
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
                  <motion.div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${message.sender === 'ai' ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-gray-200 dark:border-white/20'}`} whileHover={{
              scale: 1.1,
              rotate: 5
            }}>
                    {message.sender === 'ai' ? <BotIcon className="w-5 h-5 md:w-6 md:h-6 text-white" /> : <UserIcon className="w-5 h-5 md:w-6 md:h-6 text-gray-700 dark:text-gray-300" />}
                  </motion.div>

                  {/* Message Bubble */}
                  <GlassCard variant={message.sender === 'ai' ? 'liquid-premium' : 'liquid'} className={`max-w-[85%] md:max-w-md p-4 md:p-5 ${message.sender === 'user' ? 'bg-gradient-to-r from-blue-500/90 to-purple-600/90' : ''}`}>
                    <div className="liquid-glass-content">
                      <p className={`leading-relaxed text-sm md:text-base ${message.sender === 'ai' ? 'text-gray-800 dark:text-gray-200' : 'text-white'}`}>
                        {message.content}
                      </p>
                      <p className={`text-xs mt-3 ${message.sender === 'ai' ? 'text-gray-500 dark:text-gray-400' : 'text-white/80'}`}>
                        {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                      </p>
                    </div>
                  </GlassCard>
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
                <GlassCard variant="liquid-premium" className="p-4 md:p-5">
                  <div className="liquid-glass-content flex gap-2">
                    <motion.div className="w-2 h-2 bg-gray-600 dark:bg-gray-400 rounded-full" animate={{
                y: [0, -8, 0]
              }} transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: 0
              }} />
                    <motion.div className="w-2 h-2 bg-gray-600 dark:bg-gray-400 rounded-full" animate={{
                y: [0, -8, 0]
              }} transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: 0.2
              }} />
                    <motion.div className="w-2 h-2 bg-gray-600 dark:bg-gray-400 rounded-full" animate={{
                y: [0, -8, 0]
              }} transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: 0.4
              }} />
                  </div>
                </GlassCard>
              </motion.div>}
          </div>}
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
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
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
                  <MagneticCard variant="liquid" className="p-4 text-left cursor-pointer group" onClick={() => handleSuggestedQuestion(question)}>
                    <div className="liquid-glass-content">
                      <p className="text-sm text-gray-800 dark:text-gray-200 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                        {question}
                      </p>
                    </div>
                  </MagneticCard>
                </motion.div>)}
            </div>
          </div>
        </motion.div>}

      {/* Input Area */}
      <motion.div initial={{
      y: 100,
      opacity: 0
    }} animate={{
      y: 0,
      opacity: 1
    }} className="relative z-10 backdrop-blur-2xl bg-white/50 dark:bg-gray-900/30 border-t border-gray-200 dark:border-white/10 px-4 md:px-6 py-4">
        <form onSubmit={handleSendMessage} className="flex gap-2 md:gap-3 max-w-4xl mx-auto">
          <input type="text" value={inputMessage} onChange={e => setInputMessage(e.target.value)} placeholder="Ask me anything about numerology..." className="flex-1 px-4 md:px-5 py-3 md:py-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-gray-300 dark:border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white/50 transition-all text-sm md:text-base" disabled={isTyping} />
          <GlassButton type="submit" variant="liquid" size="md" icon={<SendIcon className="w-4 h-4 md:w-5 md:h-5" />} disabled={isTyping || !inputMessage.trim()} className="glass-glow">
            <span className="hidden sm:inline">Send</span>
          </GlassButton>
        </form>
      </motion.div>
    </div>;
}