'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  HashIcon,
  ClockIcon,
  MessageSquareIcon,
  MoreHorizontalIcon,
} from 'lucide-react';
import { useAIChat } from '@/contexts/ai-chat-context';

const navItems = [
  { id: 'home', label: 'Home', icon: HomeIcon, path: '/dashboard' },
  { id: 'numbers', label: 'My Numbers', icon: HashIcon, path: '/my-numerology' },
  { id: 'timing', label: 'Timing', icon: ClockIcon, path: '/timing-cycles' },
  { id: 'chat', label: 'Chat', icon: MessageSquareIcon, action: true },
  { id: 'more', label: 'More', icon: MoreHorizontalIcon, path: '/dashboard' },
];

export function MobileBottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { openChat } = useAIChat();

  const handleClick = (item: typeof navItems[0]) => {
    if (item.action) {
      openChat();
    } else if (item.path) {
      router.push(item.path);
    }
  };

  const isActive = (item: typeof navItems[0]) => {
    if (item.id === 'home') {
      return pathname === '/dashboard';
    }
    if (item.id === 'numbers') {
      return pathname?.startsWith('/my-numerology') || pathname?.startsWith('/life-path') || pathname?.startsWith('/birth-chart');
    }
    if (item.id === 'timing') {
      return pathname?.startsWith('/timing-cycles') || pathname?.startsWith('/daily-reading');
    }
    return false;
  };

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
    >
      <div className="bg-[#1a2942]/95 backdrop-blur-xl border-t border-cyan-500/20 shadow-2xl">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            
            return (
              <motion.button
                key={item.id}
                onClick={() => handleClick(item)}
                className={`
                  flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl
                  transition-all min-w-[60px]
                  ${active
                    ? 'text-cyan-400 bg-cyan-500/10'
                    : 'text-white/70 hover:text-white'
                  }
                `}
                whileTap={{ scale: 0.9 }}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-cyan-400' : ''}`} />
                <span className={`text-xs font-medium ${active ? 'text-cyan-400' : ''}`}>
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}

