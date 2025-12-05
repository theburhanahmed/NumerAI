'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PhoneIcon, SparklesIcon, ChevronRightIcon, InfoIcon } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { FloatingOrbs } from '@/components/ui/floating-orbs';
import { AmbientParticles } from '@/components/ui/ambient-particles';
import { MagneticCard } from '@/components/ui/magnetic-card';
import { SubscriptionGate } from '@/components/SubscriptionGate';
import { useSubscription } from '@/contexts/SubscriptionContext';
export default function PhoneNumerology() {
  const { tier } = useSubscription();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showResults, setShowResults] = useState(false);
  const phoneAnalysis = {
    number: phoneNumber || '+1 (555) 123-4567',
    reducedNumber: 6,
    energy: 'Harmony & Responsibility',
    interpretation: 'Number 6 brings nurturing, caring, and harmonious energy. This number attracts family-oriented connections, supportive relationships, and opportunities for service.',
    strengths: ['Attracts caring and supportive people', 'Good for family and home-related matters', 'Promotes harmony in communications', 'Ideal for service-based businesses'],
    challenges: ['May attract people seeking help constantly', 'Risk of being too accommodating', 'Need to maintain boundaries'],
    bestFor: ['Healthcare professionals', 'Teachers and counselors', 'Family businesses', 'Customer service roles', 'Hospitality industry']
  };
  const handleCalculate = () => {
    if (phoneNumber.trim()) {
      setShowResults(true);
    }
  };
  return <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 transition-colors duration-500 flex flex-col relative overflow-hidden">
      <AmbientParticles />
      <FloatingOrbs />
      <main className="flex-1 section-spacing px-4 md:px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} className="text-center mb-12">
            <motion.div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center text-white mb-6 mx-auto shadow-xl" animate={{
            rotate: [0, -5, 5, 0]
          }} transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut'
          }}>
              <PhoneIcon className="w-10 h-10" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 dark:from-green-300 dark:via-emerald-300 dark:to-teal-300 bg-clip-text text-transparent">
              Phone Number Numerology
            </h1>
            <p className="text-lg text-gray-600 dark:text-white/70 max-w-2xl mx-auto">
              Discover the vibrational energy of your phone number and what it
              attracts
            </p>
          </motion.div>

          {/* Calculator */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.1
        }} className="mb-8">
            <MagneticCard variant="liquid-premium" className="card-padding-lg">
              <div className="liquid-glass-content">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Phone Number Analysis
                </h2>
                <p className="text-gray-700 dark:text-white/90 mb-6">
                  Your phone number carries a specific vibration that influences
                  the type of calls, messages, and opportunities you attract.
                </p>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="+1 (555) 123-4567" className="w-full px-4 py-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-gray-300 dark:border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white placeholder-gray-500" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Enter your full phone number including country code
                  </p>
                </div>

                <GlassButton variant="liquid" size="lg" onClick={handleCalculate} className="w-full glass-glow" disabled={!phoneNumber.trim()}>
                  Analyze Phone Number
                </GlassButton>
              </div>
            </MagneticCard>
          </motion.div>

          {/* Results */}
          {showResults && <SubscriptionGate feature="phone-numerology" requiredTier="premium" showPreview={tier === 'free'}>
            <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} className="space-y-6">
              <MagneticCard variant="liquid-premium" className="card-padding-lg">
                <div className="liquid-glass-content">
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center text-white font-bold text-4xl mx-auto mb-4 shadow-xl">
                      {phoneAnalysis.reducedNumber}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {phoneAnalysis.energy}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {phoneAnalysis.number}
                    </p>
                    <p className="text-gray-700 dark:text-white/90">
                      {phoneAnalysis.interpretation}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 bg-green-500/10 rounded-2xl">
                      <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <SparklesIcon className="w-5 h-5 text-green-600" />
                        Strengths
                      </h4>
                      <ul className="space-y-2">
                        {phoneAnalysis.strengths.map((strength, index) => <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-white/90">
                            <ChevronRightIcon className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>{strength}</span>
                          </li>)}
                      </ul>
                    </div>

                    <div className="p-6 bg-amber-500/10 rounded-2xl">
                      <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <InfoIcon className="w-5 h-5 text-amber-600" />
                        Challenges
                      </h4>
                      <ul className="space-y-2">
                        {phoneAnalysis.challenges.map((challenge, index) => <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-white/90">
                            <ChevronRightIcon className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                            <span>{challenge}</span>
                          </li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              </MagneticCard>

              <MagneticCard variant="liquid" className="card-padding-lg">
                <div className="liquid-glass-content">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Best Uses for Number {phoneAnalysis.reducedNumber}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {phoneAnalysis.bestFor.map((use, index) => <motion.div key={index} initial={{
                  opacity: 0,
                  scale: 0.9
                }} animate={{
                  opacity: 1,
                  scale: 1
                }} transition={{
                  delay: index * 0.1
                }} className="px-4 py-3 bg-white/50 dark:bg-gray-800/50 rounded-xl text-center">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {use}
                        </p>
                      </motion.div>)}
                  </div>
                </div>
              </MagneticCard>

              <MagneticCard variant="liquid" className="card-padding">
                <div className="liquid-glass-content">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Phone Number Vibrations Guide
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-white/90">
                    <li className="flex items-start gap-2">
                      <ChevronRightIcon className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Number 1:</strong> Leadership calls, business
                        opportunities
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRightIcon className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Number 3:</strong> Creative collaborations,
                        social connections
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRightIcon className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Number 5:</strong> Dynamic opportunities,
                        travel, change
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRightIcon className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Number 6:</strong> Family matters, service,
                        harmony
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRightIcon className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Number 8:</strong> Financial matters, authority,
                        success
                      </span>
                    </li>
                  </ul>
                </div>
              </MagneticCard>
            </motion.div>
          </SubscriptionGate>}
        </div>
      </main>
    </div>;
}