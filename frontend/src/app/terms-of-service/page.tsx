'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileTextIcon, CheckCircleIcon } from 'lucide-react';
import { LandingNav } from '@/components/landing/landing-nav';
import { LandingFooter } from '@/components/landing/landing-footer';
import { GlassCard } from '@/components/glassmorphism/glass-card';
import { LiquidGlassHero } from '@/components/ui/liquid-glass-hero';
import { MagneticCard } from '@/components/magnetic/magnetic-card';
import { FloatingOrbs } from '@/components/ui/floating-orbs';
import { AmbientParticles } from '@/components/ui/ambient-particles';
export default function TermsOfService() {
  const sections = [{
    title: '1. Acceptance of Terms',
    content: 'By accessing and using NumerAI, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our service.'
  }, {
    title: '2. Use License',
    content: 'Permission is granted to temporarily access the materials on NumerAI for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.',
    subsections: ['You may not modify or copy the materials', 'You may not use the materials for any commercial purpose', 'You may not attempt to decompile or reverse engineer any software', 'You may not remove any copyright or proprietary notations']
  }, {
    title: '3. User Accounts',
    content: 'When you create an account with us, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the Terms.',
    subsections: ['You are responsible for safeguarding your password', 'You must notify us immediately of any unauthorized use', 'We reserve the right to refuse service or terminate accounts']
  }, {
    title: '4. Subscriptions',
    content: 'Some parts of the Service are billed on a subscription basis. You will be billed in advance on a recurring and periodic basis.',
    subsections: ['Billing cycles are set on a monthly or annual basis', 'At the end of each billing cycle, your subscription will automatically renew', 'You can cancel your subscription at any time', 'Refunds are available within 7 days of purchase']
  }, {
    title: '5. Prohibited Uses',
    content: 'You may not use our service for any illegal or unauthorized purpose. You must not violate any laws in your jurisdiction.',
    subsections: ['Transmit any worms, viruses, or malicious code', 'Violate or infringe on the rights of others', 'Engage in any automated use of the system', 'Interfere with or disrupt the service']
  }, {
    title: '6. Intellectual Property',
    content: 'The Service and its original content, features, and functionality are owned by NumerAI and are protected by international copyright, trademark, and other intellectual property laws.'
  }, {
    title: '7. Limitation of Liability',
    content: 'In no event shall NumerAI, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages.'
  }, {
    title: '8. Changes to Terms',
    content: 'We reserve the right to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms on this page.'
  }];
  return <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 transition-colors duration-500 relative overflow-hidden">
      <AmbientParticles />
      <FloatingOrbs />
      <LandingNav />

      {/* Hero Section */}
      <LiquidGlassHero title="Terms of Service" subtitle="Please read these terms carefully before using NumerAI" compact />

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
              <FileTextIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
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
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {section.title}
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    {section.content}
                  </p>
                  {section.subsections && <ul className="space-y-2">
                      {section.subsections.map((item, i) => <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                          <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
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
        delay: 0.8
      }} className="mt-8">
          <MagneticCard variant="liquid-premium" className="p-6 md:p-8 bg-gradient-to-br from-purple-100/50 to-blue-100/50 dark:from-purple-500/20 dark:to-blue-500/20">
            <div className="liquid-glass-content text-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Questions About Our Terms?
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                If you have any questions about these Terms of Service, please
                contact us at{' '}
                <a href="mailto:legal@numerai.com" className="text-purple-600 dark:text-purple-400 hover:underline font-semibold">
                  legal@numerai.com
                </a>
              </p>
            </div>
          </MagneticCard>
        </motion.div>
      </div>

      <LandingFooter />
    </div>;
}