'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TypeIcon, SparklesIcon, ChevronRightIcon } from 'lucide-react';
import { SpaceCard } from '@/components/space/space-card';
import { TouchOptimizedButton } from '@/components/buttons/touch-optimized-button';
import { CosmicPageLayout } from '@/components/cosmic/cosmic-page-layout';
import { MagneticCard } from '@/components/magnetic/magnetic-card';
import { SubscriptionGate } from '@/components/SubscriptionGate';
import { useSubscription } from '@/contexts/SubscriptionContext';
export default function NameNumerology() {
  const { tier } = useSubscription();
  const [name, setName] = useState('');
  const [showResults, setShowResults] = useState(false);
  const nameAnalysis = {
    name: name || '',
    expressionNumber: 7,
    soulUrgeNumber: 11,
    personalityNumber: 5,
    interpretation: {
      expression: 'Analytical, spiritual, and introspective. Natural researcher and truth-seeker.',
      soulUrge: 'Master number 11 - Spiritual messenger with intuitive gifts and high ideals.',
      personality: 'Dynamic, adventurous, and freedom-loving. Attracts others with magnetic energy.'
    }
  };
  const handleCalculate = () => {
    if (name.trim()) {
      setShowResults(true);
    }
  };
  return <CosmicPageLayout>
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
            <motion.div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-3xl flex items-center justify-center text-white mb-6 mx-auto shadow-xl" animate={{
            scale: [1, 1.05, 1]
          }} transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut'
          }}>
              <TypeIcon className="w-10 h-10" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-purple-600 bg-clip-text text-transparent">
              Name Numerology
            </h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Discover the vibrational energy and hidden meanings within your
              name
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
                <h2 className="text-2xl font-bold text-white mb-4">
                  Name Analysis Calculator
                </h2>
                <p className="text-white/80 mb-6">
                  Your name carries vibrational energy that influences your
                  personality, desires, and how others perceive you.
                </p>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your full name" className="w-full px-4 py-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-gray-300 dark:border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500" />
                </div>

                <TouchOptimizedButton variant="primary" size="lg" onClick={handleCalculate} className="w-full glass-glow" disabled={!name.trim()}>
                  Analyze Name
                </TouchOptimizedButton>
              </div>
            </MagneticCard>
          </motion.div>

          {/* Results */}
          {showResults && <SubscriptionGate feature="name-numerology" requiredTier="basic" showPreview={tier === 'free'}>
            <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <MagneticCard variant="primary" className="card-padding text-center">
                  <div className="liquid-glass-content">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg">
                      {nameAnalysis.expressionNumber}
                    </div>
                    <h3 className="font-bold text-white mb-2">
                      Expression Number
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-white/90">
                      {nameAnalysis.interpretation.expression}
                    </p>
                  </div>
                </MagneticCard>

                <MagneticCard variant="primary" className="card-padding text-center">
                  <div className="liquid-glass-content">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg">
                      {nameAnalysis.soulUrgeNumber}
                    </div>
                    <h3 className="font-bold text-white mb-2">
                      Soul Urge Number
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-white/90">
                      {nameAnalysis.interpretation.soulUrge}
                    </p>
                  </div>
                </MagneticCard>

                <MagneticCard variant="primary" className="card-padding text-center">
                  <div className="liquid-glass-content">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg">
                      {nameAnalysis.personalityNumber}
                    </div>
                    <h3 className="font-bold text-white mb-2">
                      Personality Number
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-white/90">
                      {nameAnalysis.interpretation.personality}
                    </p>
                  </div>
                </MagneticCard>
              </div>

              {/* Detailed Interpretation */}
              <MagneticCard variant="liquid-premium" className="card-padding-lg">
                <div className="liquid-glass-content">
                  <h3 className="text-xl font-bold text-white mb-6">
                    Understanding Your Name Numbers
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-indigo-500/10 rounded-xl">
                      <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                        <SparklesIcon className="w-5 h-5 text-indigo-600" />
                        Expression Number ({nameAnalysis.expressionNumber})
                      </h4>
                      <p className="text-sm text-gray-700 dark:text-white/90">
                        Represents your natural talents, abilities, and the path
                        you&apos;re meant to follow. This is who you are at your
                        core.
                      </p>
                    </div>

                    <div className="p-4 bg-pink-500/10 rounded-xl">
                      <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                        <SparklesIcon className="w-5 h-5 text-pink-600" />
                        Soul Urge Number ({nameAnalysis.soulUrgeNumber})
                      </h4>
                      <p className="text-sm text-gray-700 dark:text-white/90">
                        Reveals your inner desires, motivations, and what truly
                        drives you. This is what your heart yearns for.
                      </p>
                    </div>

                    <div className="p-4 bg-blue-500/10 rounded-xl">
                      <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                        <SparklesIcon className="w-5 h-5 text-blue-600" />
                        Personality Number ({nameAnalysis.personalityNumber})
                      </h4>
                      <p className="text-sm text-gray-700 dark:text-white/90">
                        Shows how others perceive you and the first impression
                        you make. This is your outer personality.
                      </p>
                    </div>
                  </div>
                </div>
              </MagneticCard>
            </motion.div>
          </SubscriptionGate>}
        </div>
      </main>
    </CosmicPageLayout>;
}