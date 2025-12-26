'use client';

import React, { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

export interface HubTab {
  id: string;
  label: string;
  path: string;
  icon?: LucideIcon;
}

interface HubLayoutProps {
  title: string;
  description?: string;
  tabs: HubTab[];
  children: ReactNode;
  defaultTab?: string;
}

export function HubLayout({ title, description, tabs, children, defaultTab }: HubLayoutProps) {
  const pathname = usePathname();
  const activeTab = tabs.find(tab => pathname === tab.path || pathname.startsWith(tab.path + '/'))?.id || defaultTab || tabs[0]?.id;

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
            {title}
          </h1>
          {description && (
            <p className="text-white/70 text-lg">
              {description}
            </p>
          )}
        </motion.div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 border-b border-cyan-500/20 pb-4">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.location.href = tab.path;
                    }
                  }}
                  className={`
                    px-6 py-3 rounded-xl font-medium transition-all
                    flex items-center gap-2
                    ${isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'text-white/70 hover:text-white hover:bg-[#1a2942]/60'
                    }
                  `}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{tab.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}

