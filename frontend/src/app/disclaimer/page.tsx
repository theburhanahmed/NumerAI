'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangleIcon, InfoIcon } from 'lucide-react';
import { LandingNav } from '@/components/landing/landing-nav';
import { LandingFooter } from '@/components/landing/landing-footer';
import { GlassCard } from '@/components/glassmorphism/glass-card';
import { LiquidGlassHero } from '@/components/ui/liquid-glass-hero';
import { MagneticCard } from '@/components/magnetic/magnetic-card';
import { FloatingOrbs } from '@/components/ui/floating-orbs';
import { AmbientParticles } from '@/components/ui/ambient-particles';
export default function Disclaimer() {
  const sections = [{
    title: 'General Information',
    icon: <InfoIcon className="w-6 h-6" />,
    content: 'NumerAI provides numerology readings and insights for entertainment and self-reflection purposes only. The information provided should not be considered as professional advice.'
  }, {
    title: 'Not Professional Advice',
    icon: <AlertTriangleIcon className="w-6 h-6" />,
    content: 'Our numerology readings are not a substitute for professional advice in legal, financial, medical, or psychological matters. Always consult qualified professionals for such guidance.',
    points: ['Not medical or mental health advice', 'Not financial or investment advice', 'Not legal advice', 'Not relationship counseling']
  }, {
    title: 'Accuracy and Reliability',
    icon: <InfoIcon className="w-6 h-6" />,
    content: 'While we strive to provide accurate and insightful numerology readings, we make no guarantees about the accuracy, completeness, or reliability of the information provided.',
    points: ['Readings are based on numerological principles', 'Results may vary based on interpretation', 'No guarantee of specific outcomes', 'Information is provided "as is"']
  }, {
    title: 'Personal Responsibility',
    icon: <AlertTriangleIcon className="w-6 h-6" />,
    content: 'You are solely responsible for any decisions or actions you take based on the information provided by NumerAI.',
    points: ['Use information at your own discretion', 'Make informed decisions independently', 'Verify important information from other sources', 'Consider multiple perspectives']
  }, {
    title: 'AI-Generated Content',
    icon: <InfoIcon className="w-6 h-6" />,
    content: 'Some content on NumerAI is generated using artificial intelligence. While we use advanced AI technology, the output should be considered as suggestions and insights rather than definitive answers.',
    points: ['AI responses are based on patterns and data', 'May not account for unique circumstances', 'Should be used as one of many resources', 'Human judgment is always recommended']
  }, {
    title: 'External Links',
    icon: <InfoIcon className="w-6 h-6" />,
    content: 'Our service may contain links to external websites. We are not responsible for the content, accuracy, or practices of these third-party sites.'
  }, {
    title: 'Changes to Service',
    icon: <AlertTriangleIcon className="w-6 h-6" />,
    content: 'We reserve the right to modify, suspend, or discontinue any aspect of our service at any time without prior notice.'
  }, {
    title: 'Limitation of Liability',
    icon: <AlertTriangleIcon className="w-6 h-6" />,
    content: 'To the fullest extent permitted by law, NumerAI shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our service.'
  }];
  return <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 transition-colors duration-500 relative overflow-hidden">
      <AmbientParticles />
      <FloatingOrbs />
      <LandingNav />

      {/* Hero Section */}
      <LiquidGlassHero title="Disclaimer" subtitle="Important information about using NumerAI services" compact />

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 pb-16 relative z-10">
        {/* Warning Banner */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="mb-8">
          <MagneticCard variant="liquid" className="p-6 bg-gradient-to-br from-amber-100/50 to-orange-100/50 dark:from-amber-500/20 dark:to-orange-500/20 border-amber-500/30">
            <div className="liquid-glass-content flex items-start gap-4">
              <AlertTriangleIcon className="w-8 h-8 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Please Read Carefully
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  By using NumerAI, you acknowledge that you have read,
                  understood, and agree to be bound by this disclaimer. If you
                  do not agree with any part of this disclaimer, please do not
                  use our services.
                </p>
              </div>
            </div>
          </MagneticCard>
        </motion.div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => <motion.div key={index} initial={{
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
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                      {section.icon}
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                      {section.title}
                    </h2>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    {section.content}
                  </p>
                  {section.points && <ul className="space-y-2">
                      {section.points.map((point, i) => <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0 mt-2"></span>
                          <span>{point}</span>
                        </li>)}
                    </ul>}
                </div>
              </MagneticCard>
            </motion.div>)}
        </div>

        {/* Contact Section */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.8
      }} className="mt-8">
          <MagneticCard variant="liquid-premium" className="p-6 md:p-8 bg-gradient-to-br from-blue-100/50 to-purple-100/50 dark:from-blue-500/20 dark:to-purple-500/20">
            <div className="liquid-glass-content text-center">
              <InfoIcon className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Questions or Concerns?
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                If you have any questions about this disclaimer, please contact
                us at{' '}
                <a href="mailto:support@numerai.com" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                  support@numerai.com
                </a>
              </p>
            </div>
          </MagneticCard>
        </motion.div>
      </div>

      <LandingFooter />
    </div>;
}