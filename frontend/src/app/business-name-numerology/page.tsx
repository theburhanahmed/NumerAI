'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BriefcaseIcon, SparklesIcon, ChevronRightIcon, TrendingUpIcon } from 'lucide-react';
import { SpaceCard } from '@/components/space/space-card';
import { TouchOptimizedButton } from '@/components/buttons/touch-optimized-button';
import { CosmicPageLayout } from '@/components/cosmic/cosmic-page-layout';
import { MagneticCard } from '@/components/magnetic/magnetic-card';
export default function BusinessNameNumerology() {
  const [businessName, setBusinessName] = useState('');
  const [showResults, setShowResults] = useState(false);
  const businessAnalysis = {
    name: businessName || 'Quantum Innovations',
    number: 8,
    interpretation: 'Number 8 brings powerful energy for material success, authority, and abundance. Excellent for businesses focused on growth, leadership, and financial achievement.',
    strengths: ['Strong leadership presence', 'Attracts wealth and resources', 'Commands respect and authority', 'Excellent for scaling operations'],
    considerations: ['Balance ambition with ethics', 'Avoid becoming too controlling', 'Remember the human element'],
    bestFor: ['Finance and investment firms', 'Corporate consulting', 'Real estate development', 'Technology enterprises', 'Manufacturing and production']
  };
  const handleCalculate = () => {
    if (businessName.trim()) {
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
            <motion.div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl flex items-center justify-center text-white mb-6 mx-auto shadow-xl" animate={{
            rotate: [0, 5, -5, 0]
          }} transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut'
          }}>
              <BriefcaseIcon className="w-10 h-10" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 dark:from-amber-300 dark:via-orange-300 dark:to-red-300 bg-clip-text text-transparent">
              Business Name Numerology
            </h1>
            <p className="text-lg text-gray-600 dark:text-white/70 max-w-2xl mx-auto">
              Choose a business name that attracts success and aligns with your
              goals
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
                  Business Name Analysis
                </h2>
                <p className="text-gray-700 dark:text-white/90 mb-6">
                  The vibration of your business name influences its energy,
                  potential for success, and how customers perceive your brand.
                </p>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Business Name
                  </label>
                  <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="Enter your business name" className="w-full px-4 py-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-gray-300 dark:border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500" />
                </div>

                <TouchOptimizedButton variant="liquid" size="lg" onClick={handleCalculate} className="w-full glass-glow" disabled={!businessName.trim()}>
                  Analyze Business Name
                </TouchOptimizedButton>
              </div>
            </MagneticCard>
          </motion.div>

          {/* Results */}
          {showResults && <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} className="space-y-6">
              <MagneticCard variant="liquid-premium" className="card-padding-lg">
                <div className="liquid-glass-content">
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl flex items-center justify-center text-white font-bold text-4xl mx-auto mb-4 shadow-xl">
                      {businessAnalysis.number}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {businessAnalysis.name}
                    </h3>
                    <p className="text-gray-700 dark:text-white/90">
                      {businessAnalysis.interpretation}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 bg-green-500/10 rounded-2xl">
                      <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                        <TrendingUpIcon className="w-5 h-5 text-green-600" />
                        Strengths
                      </h4>
                      <ul className="space-y-2">
                        {businessAnalysis.strengths.map((strength, index) => <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-white/90">
                            <ChevronRightIcon className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>{strength}</span>
                          </li>)}
                      </ul>
                    </div>

                    <div className="p-6 bg-amber-500/10 rounded-2xl">
                      <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                        <SparklesIcon className="w-5 h-5 text-amber-600" />
                        Considerations
                      </h4>
                      <ul className="space-y-2">
                        {businessAnalysis.considerations.map((consideration, index) => <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-white/90">
                              <ChevronRightIcon className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                              <span>{consideration}</span>
                            </li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              </MagneticCard>

              <MagneticCard variant="liquid" className="card-padding-lg">
                <div className="liquid-glass-content">
                  <h4 className="font-semibold text-white mb-4">
                    Best Industries for Number {businessAnalysis.number}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {businessAnalysis.bestFor.map((industry, index) => <motion.div key={index} initial={{
                  opacity: 0,
                  scale: 0.9
                }} animate={{
                  opacity: 1,
                  scale: 1
                }} transition={{
                  delay: index * 0.1
                }} className="px-4 py-3 bg-white/50 dark:bg-gray-800/50 rounded-xl text-center">
                        <p className="text-sm font-semibold text-white">
                          {industry}
                        </p>
                      </motion.div>)}
                  </div>
                </div>
              </MagneticCard>

              <MagneticCard variant="liquid" className="card-padding">
                <div className="liquid-glass-content">
                  <h4 className="font-semibold text-white mb-4">
                    Business Name Number Guide
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-white/90">
                    <li className="flex items-start gap-2">
                      <ChevronRightIcon className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Number 1:</strong> Leadership, innovation,
                        pioneering spirit
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRightIcon className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Number 5:</strong> Dynamic, adaptable,
                        marketing-focused
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRightIcon className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Number 8:</strong> Material success, authority,
                        abundance
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRightIcon className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Number 9:</strong> Humanitarian, global reach,
                        service-oriented
                      </span>
                    </li>
                  </ul>
                </div>
              </MagneticCard>
            </motion.div>}
        </div>
      </main>
    </CosmicPageLayout>;
}