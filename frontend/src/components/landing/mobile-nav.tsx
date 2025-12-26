'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon } from 'lucide-react';
import { GlassButton } from '@/components/glassmorphism/glass-button';

interface MobileNavProps {
  navLinks: Array<{ label: string; href: string }>;
  onNavigate: (href: string) => void;
  onClose: () => void;
}

export function MobileNav({ navLinks, onNavigate, onClose }: MobileNavProps) {
  const router = useRouter();
  
  return (
    <AnimatePresence>
      <>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
        />
        
        {/* Menu Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed top-0 right-0 bottom-0 w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border-l border-white/20 dark:border-gray-700/30 z-50 md:hidden overflow-y-auto"
        >
          <div className="p-6">
            {/* Close Button */}
            <div className="flex justify-end mb-8">
              <motion.button
                onClick={onClose}
                className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Close menu"
              >
                <XIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </motion.button>
            </div>
            
            {/* Menu Items */}
            <nav className="space-y-2">
              {navLinks.map((item, index) => (
                <motion.button
                  key={item.label}
                  onClick={() => onNavigate(item.href)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-white/50 to-white/30 dark:from-gray-800/50 dark:to-gray-800/30 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 text-left transition-all hover:shadow-lg"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {item.label}
                  </span>
                </motion.button>
              ))}
            </nav>
            
            {/* Auth Buttons */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-3">
              <GlassButton
                variant="ghost"
                className="w-full"
                onClick={() => {
                  onClose();
                  router.push('/login');
                }}
              >
                Sign In
              </GlassButton>
              <GlassButton
                variant="liquid"
                className="w-full glass-glow"
                onClick={() => {
                  onClose();
                  router.push('/register');
                }}
              >
                Get Started
              </GlassButton>
            </div>
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  );
}

