'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CookieIcon, SettingsIcon } from 'lucide-react';
import { LandingNav } from '@/components/landing/landing-nav';
import { LandingFooter } from '@/components/landing/landing-footer';
import { GlassCard } from '@/components/glassmorphism/glass-card';
import { LiquidGlassHero } from '@/components/ui/liquid-glass-hero';
import { MagneticCard } from '@/components/magnetic/magnetic-card';
import { FloatingOrbs } from '@/components/ui/floating-orbs';
import { AmbientParticles } from '@/components/ui/ambient-particles';
export default function CookiePolicy() {
  const cookieTypes = [{
    title: 'Essential Cookies',
    icon: '🔒',
    description: 'These cookies are necessary for the website to function and cannot be switched off.',
    examples: ['Authentication and security', 'Session management', 'Load balancing', 'User preferences'],
    required: true
  }, {
    title: 'Analytics Cookies',
    icon: '📊',
    description: 'These cookies help us understand how visitors interact with our website.',
    examples: ['Page views and navigation', 'Time spent on pages', 'Error tracking', 'Performance metrics'],
    required: false
  }, {
    title: 'Functional Cookies',
    icon: '⚙️',
    description: 'These cookies enable enhanced functionality and personalization.',
    examples: ['Language preferences', 'Theme settings', 'Saved calculations', 'User interface preferences'],
    required: false
  }, {
    title: 'Marketing Cookies',
    icon: '🎯',
    description: 'These cookies track your activity to deliver relevant advertisements.',
    examples: ['Ad targeting', 'Campaign effectiveness', 'Social media integration', 'Retargeting'],
    required: false
  }];
  return <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 transition-colors duration-500 relative overflow-hidden">
      <AmbientParticles />
      <FloatingOrbs />
      <LandingNav />

      {/* Hero Section */}
      <LiquidGlassHero title="Cookie Policy" subtitle="Learn about how we use cookies and similar technologies on NumerAI" compact />

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 pb-16 relative z-10">
        {/* Introduction */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="mb-8">
          <MagneticCard variant="liquid-premium" className="p-6 md:p-8">
            <div className="liquid-glass-content">
              <div className="flex items-center gap-3 mb-4">
                <CookieIcon className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  What Are Cookies?
                </h2>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                Cookies are small text files that are placed on your device when
                you visit our website. They help us provide you with a better
                experience by remembering your preferences and understanding how
                you use our service.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                We use both session cookies (which expire when you close your
                browser) and persistent cookies (which stay on your device until
                deleted or expired).
              </p>
            </div>
          </MagneticCard>
        </motion.div>

        {/* Cookie Types */}
        <div className="space-y-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-6">
            Types of Cookies We Use
          </h2>
          {cookieTypes.map((type, index) => <motion.div key={index} initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: index * 0.1
        }}>
              <MagneticCard variant="liquid-premium" className="p-6 md:p-8">
                <div className="liquid-glass-content">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{type.icon}</div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {type.title}
                        </h3>
                        {type.required && <span className="inline-block px-2 py-1 bg-blue-500/20 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-full mt-1">
                            Required
                          </span>}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    {type.description}
                  </p>
                  <div className="bg-gradient-to-br from-gray-100/50 to-gray-200/50 dark:from-gray-800/50 dark:to-gray-700/50 rounded-xl p-4">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Examples:
                    </p>
                    <ul className="space-y-1">
                      {type.examples.map((example, i) => <li key={i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                          {example}
                        </li>)}
                    </ul>
                  </div>
                </div>
              </MagneticCard>
            </motion.div>)}
        </div>

        {/* Managing Cookies */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.5
      }} className="mb-8">
          <MagneticCard variant="liquid-premium" className="p-6 md:p-8">
            <div className="liquid-glass-content">
              <div className="flex items-center gap-3 mb-4">
                <SettingsIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Managing Your Cookie Preferences
                </h2>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                You have the right to decide whether to accept or reject
                cookies. You can exercise your cookie preferences by:
              </p>
              <ul className="space-y-3">
                {['Using our cookie consent banner when you first visit', 'Adjusting your browser settings to block or delete cookies', 'Using browser plugins or extensions for cookie management', 'Opting out of third-party advertising cookies'].map((item, i) => <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full flex-shrink-0 mt-2"></span>
                    <span>{item}</span>
                  </li>)}
              </ul>
              <div className="mt-6 p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
                <p className="text-sm text-gray-800 dark:text-gray-200">
                  <strong>Note:</strong> Blocking or deleting cookies may impact
                  your experience and some features may not function properly.
                </p>
              </div>
            </div>
          </MagneticCard>
        </motion.div>

        {/* Contact Section */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.6
      }}>
          <MagneticCard variant="liquid-premium" className="p-6 md:p-8 bg-gradient-to-br from-amber-100/50 to-orange-100/50 dark:from-amber-500/20 dark:to-orange-500/20">
            <div className="liquid-glass-content text-center">
              <CookieIcon className="w-12 h-12 text-amber-600 dark:text-amber-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Questions About Cookies?
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                If you have any questions about our use of cookies, please
                contact us at{' '}
                <a href="mailto:privacy@numerai.com" className="text-amber-600 dark:text-amber-400 hover:underline font-semibold">
                  privacy@numerai.com
                </a>
              </p>
            </div>
          </MagneticCard>
        </motion.div>
      </div>

      <LandingFooter />
    </div>;
}