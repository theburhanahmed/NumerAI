'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { MessageSquareIcon, SparklesIcon } from 'lucide-react'
import { useAIChat } from '@/contexts/ai-chat-context'

export function FloatingChatButton() {
  const { openChat, messages } = useAIChat()
  const hasUnreadMessages = messages.length > 0

  return (
    <motion.button
      onClick={openChat}
      className="fixed bottom-6 right-6 z-40 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-2xl flex items-center justify-center group"
      initial={{
        scale: 0,
        opacity: 0,
      }}
      animate={{
        scale: 1,
        opacity: 1,
      }}
      exit={{
        scale: 0,
        opacity: 0,
      }}
      whileHover={{
        scale: 1.1,
      }}
      whileTap={{
        scale: 0.95,
      }}
      transition={{
        duration: 0.3,
      }}
    >
      {/* Pulse animation */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Icon */}
      <motion.div
        className="relative z-10"
        animate={{
          rotate: [0, 10, -10, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <SparklesIcon className="w-7 h-7 text-white" />
      </motion.div>

      {/* Notification badge */}
      {hasUnreadMessages && (
        <motion.div
          initial={{
            scale: 0,
          }}
          animate={{
            scale: 1,
          }}
          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
            }}
            className="w-2 h-2 bg-white rounded-full"
          />
        </motion.div>
      )}
    </motion.button>
  )
}

