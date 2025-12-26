'use client'

import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  SparklesIcon,
  SendIcon,
  BotIcon,
  UserIcon,
  MessageSquareIcon,
  XIcon,
  MinusIcon,
  MaximizeIcon,
} from 'lucide-react'
import { GlassCard } from '../glassmorphism/glass-card'
import { GlassButton } from '../glassmorphism/glass-button'
import { useAIChat } from '@/contexts/ai-chat-context'
import { toast } from 'sonner'

export function AIChatModal() {
  const { messages, isOpen, isTyping, addMessage, setIsTyping, closeChat } =
    useAIChat()
  const [inputMessage, setInputMessage] = useState('')
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim()) return

    const userMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user' as const,
      timestamp: new Date(),
    }
    addMessage(userMessage)
    setInputMessage('')
    setIsTyping(true)

    setTimeout(() => {
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        content:
          'Based on your Life Path Number 7, you have a natural inclination towards introspection and spiritual growth. This is a great time to trust your intuition and seek deeper understanding.',
        sender: 'ai' as const,
        timestamp: new Date(),
      }
      addMessage(aiMessage)
      setIsTyping(false)
    }, 1500)
  }

  const handleSuggestedQuestion = (question: string) => {
    setInputMessage(question)
    setTimeout(() => {
      const form = document.querySelector('form')
      if (form) {
        form.dispatchEvent(
          new Event('submit', {
            bubbles: true,
            cancelable: true,
          }),
        )
      }
    }, 100)
  }

  const suggestedQuestions = [
    'What does my Life Path number mean?',
    'How can I improve my relationships?',
    'What are my lucky numbers today?',
    'Tell me about my destiny number',
  ]

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        exit={{
          opacity: 0,
        }}
        className="fixed inset-0 z-50 lg:inset-auto lg:bottom-6 lg:right-6 lg:w-[420px] lg:h-[680px]"
      >
        {/* Mobile backdrop */}
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
          }}
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={closeChat}
        />

        {/* Modal container */}
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.9,
            y: 20,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            scale: 0.9,
            y: 20,
          }}
          transition={{
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1],
          }}
          className="relative h-full lg:h-auto flex flex-col bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border border-white/20 dark:border-gray-700/30 lg:rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-white/10 bg-gradient-to-r from-blue-500/10 to-purple-600/10">
            <div className="flex items-center gap-3">
              <motion.div
                className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg"
                animate={{
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                <SparklesIcon className="w-5 h-5 text-white" />
              </motion.div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">
                  AI Numerologist
                </h3>
                <div className="flex items-center gap-2">
                  <motion.div
                    className="w-2 h-2 bg-green-500 rounded-full"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [1, 0.7, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Online
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-2 rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
                whileHover={{
                  scale: 1.1,
                }}
                whileTap={{
                  scale: 0.95,
                }}
              >
                {isMinimized ? (
                  <MaximizeIcon className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                ) : (
                  <MinusIcon className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                )}
              </motion.button>
              <motion.button
                onClick={closeChat}
                className="p-2 rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
                whileHover={{
                  scale: 1.1,
                }}
                whileTap={{
                  scale: 0.95,
                }}
              >
                <XIcon className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </motion.button>
            </div>
          </div>

          {/* Messages Container */}
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {messages.length === 0 ? (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 20,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    className="text-center py-8"
                  >
                    <motion.div
                      className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto shadow-xl"
                      animate={{
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                      }}
                    >
                      <MessageSquareIcon className="w-8 h-8" />
                    </motion.div>
                    <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
                      Start a Conversation
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-white/70 mb-4">
                      Ask me anything about numerology
                    </p>

                    {/* Suggested Questions */}
                    <div className="space-y-2 mt-4">
                      {suggestedQuestions.map((question, index) => (
                        <motion.button
                          key={index}
                          initial={{
                            opacity: 0,
                            y: 10,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          transition={{
                            delay: index * 0.1,
                          }}
                          onClick={() => handleSuggestedQuestion(question)}
                          className="w-full text-left px-4 py-3 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all"
                        >
                          <p className="text-sm text-gray-800 dark:text-gray-200">
                            {question}
                          </p>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <>
                    {messages.map((message, index) => (
                      <motion.div
                        key={message.id}
                        initial={{
                          opacity: 0,
                          y: 20,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          delay: index * 0.05,
                        }}
                        className={`flex gap-2 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}
                      >
                        {/* Avatar */}
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                            message.sender === 'ai'
                              ? 'bg-gradient-to-r from-blue-500 to-purple-600'
                              : 'bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-gray-200 dark:border-white/20'
                          }`}
                        >
                          {message.sender === 'ai' ? (
                            <BotIcon className="w-4 h-4 text-white" />
                          ) : (
                            <UserIcon className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                          )}
                        </div>

                        {/* Message Bubble */}
                        <div
                          className={`max-w-[75%] px-3 py-2 rounded-2xl ${
                            message.sender === 'ai'
                              ? 'bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/30'
                              : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                          }`}
                        >
                          <p className="text-sm leading-relaxed">
                            {message.content}
                          </p>
                          <p
                            className={`text-xs mt-1 ${
                              message.sender === 'ai'
                                ? 'text-gray-500 dark:text-gray-400'
                                : 'text-white/80'
                            }`}
                          >
                            {message.timestamp.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </motion.div>
                    ))}

                    {/* Typing Indicator */}
                    {isTyping && (
                      <motion.div
                        initial={{
                          opacity: 0,
                          y: 20,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        className="flex gap-2"
                      >
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                          <BotIcon className="w-4 h-4 text-white" />
                        </div>
                        <div className="px-3 py-2 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/30">
                          <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                              <motion.div
                                key={i}
                                className="w-2 h-2 bg-gray-600 dark:bg-gray-400 rounded-full"
                                animate={{
                                  y: [0, -6, 0],
                                }}
                                transition={{
                                  duration: 0.6,
                                  repeat: Infinity,
                                  delay: i * 0.2,
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-200 dark:border-white/10 p-3 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask me anything..."
                    className="flex-1 px-3 py-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-gray-300 dark:border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white/50 text-sm"
                    disabled={isTyping}
                  />
                  <motion.button
                    type="submit"
                    disabled={isTyping || !inputMessage.trim()}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    whileHover={{
                      scale: 1.05,
                    }}
                    whileTap={{
                      scale: 0.95,
                    }}
                    transition={{
                      duration: 0.3,
                    }}
                  >
                    <SendIcon className="w-4 h-4" />
                  </motion.button>
                </form>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

