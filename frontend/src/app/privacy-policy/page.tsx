'use client';

import React, { Children } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheckIcon, LockIcon } from 'lucide-react';
import { LandingNav } from '@/components/landing/landing-nav';
import { LandingFooter } from '@/components/landing/landing-footer';
import { GlassCard } from '@/components/glassmorphism/glass-card';
import { LiquidGlassHero } from '@/components/ui/liquid-glass-hero';
import { MagneticCard } from '@/components/magnetic/magnetic-card';
import { FloatingOrbs } from '@/components/ui/floating-orbs';
import { AmbientParticles } from '@/components/ui/ambient-particles';
export default function PrivacyPolicy() {
  const sections = [{
    title: '1. Information We Collect',
    icon: <LockIcon className="w-6 h-6" />,
    content: 'We collect information that you provide directly to us, including when you create an account, use our services, or communicate with us.',
    items: ['Personal information (name, email, birth date)', 'Account credentials and preferences', 'Payment information (processed securely)', 'Usage data and analytics', 'Device and browser information']
  }, {
    title: '2. How We Use Your Information',
    icon: <ShieldCheckIcon className="w-6 h-6" />,
    content: 'We use the information we collect to provide, maintain, and improve our services, and to communicate with you.',
    items: ['Generate personalized numerology reports', 'Process your transactions and subscriptions', 'Send you updates and marketing communications', 'Improve our services and develop new features', 'Protect against fraud and abuse']
  }, {
    title: '3. Information Sharing',
    icon: <ShieldCheckIcon className="w-6 h-6" />,
    content: 'We do not sell your personal information. We may share your information only in the following circumstances:',
    items: ['With your consent or at your direction', 'With service providers who assist our operations', 'To comply with legal obligations', 'To protect our rights and prevent fraud', 'In connection with a business transfer']
  }, {
    title: '4. Data Security',
    icon: <LockIcon className="w-6 h-6" />,
    content: 'We implement appropriate technical and organizational measures to protect your personal information.',
    items: ['Encryption of data in transit and at rest', 'Regular security assessments and updates', 'Access controls and authentication', 'Secure payment processing', 'Regular backups and disaster recovery']
  }, {
    title: '5. Your Rights and Choices',
    icon: <ShieldCheckIcon className="w-6 h-6" />,
    content: 'You have certain rights regarding your personal information, including:',
    items: ['Access and review your information', 'Correct or update your information', 'Delete your account and data', 'Opt-out of marketing communications', 'Export your data']
  }, {
    title: '6. Cookies and Tracking',
    icon: <LockIcon className="w-6 h-6" />,
    content: 'We use cookies and similar tracking technologies to collect information about your browsing activities.',
    items: ['Essential cookies for site functionality', 'Analytics cookies to understand usage', 'Preference cookies to remember settings', 'You can control cookies through browser settings']
  }, {
    title: "7. Children's Privacy",
    icon: <ShieldCheckIcon className="w-6 h-6" />,
    content: 'Our services are not intended for children under 13. We do not knowingly collect information from children.'
  }, {
    title: '8. International Data Transfers',
    icon: <LockIcon className="w-6 h-6" />,
    content: 'Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place.'
  }, {
    title: '9. Changes to This Policy',
    icon: <ShieldCheckIcon className="w-6 h-6" />,
    content: 'We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page.'
  }];
  return <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 transition-colors duration-500 relative overflow-hidden">
      <AmbientParticles />
      <FloatingOrbs />
      <LandingNav />

      {/* Hero Section */}
      <LiquidGlassHero title="Privacy Policy" subtitle="Your privacy is important to us. Learn how we collect, use, and protect your information." compact />

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 pb-16 relative z-10">
        {/* Last Updated */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="mb-8">
          <MagneticCard variant="liquid" className="p-4">
            <div className="liquid-glass-content flex items-center gap-3">
              <ShieldCheckIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Last Updated
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {new Date().toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
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
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                      {section.icon}
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                      {section.title}
                    </h2>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    {section.content}
                  </p>
                  {section.items && <ul className="space-y-2">
                      {section.items.map((item, i) => <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                          <span className="w-1.5 h-1.5 bg-purple-500 rounded-full flex-shrink-0 mt-2"></span>
                          <span>{item}</span>
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
        delay: 0.9
      }} className="mt-8">
          <MagneticCard variant="liquid-premium" className="p-6 md:p-8 bg-gradient-to-br from-green-100/50 to-emerald-100/50 dark:from-green-500/20 dark:to-emerald-500/20">
            <div className="liquid-glass-content text-center">
              <ShieldCheckIcon className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Questions About Your Privacy?
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                If you have any questions about this Privacy Policy or our data
                practices, please contact us at{' '}
                <a href="mailto:privacy@numerai.com" className="text-green-600 dark:text-green-400 hover:underline font-semibold">
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