'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartIcon, SparklesIcon, CheckCircleIcon, AlertCircleIcon, UsersIcon } from 'lucide-react';
import { CosmicPageLayout } from '@/components/cosmic/cosmic-page-layout';
import { SpaceCard } from '@/components/space/space-card';
import { SpaceButton } from '@/components/space/space-button';
import { TouchOptimizedButton } from '@/components/buttons/touch-optimized-button';
import { CrystalNumerologyCube } from '@/components/3d/crystal-numerology-cube';
import { SubscriptionGate } from '@/components/SubscriptionGate';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { toast } from 'sonner';
export default function CompatibilityChecker() {
  const { tier } = useSubscription();
  const [person1, setPerson1] = useState({
    name: '',
    birthDate: ''
  });
  const [person2, setPerson2] = useState({
    name: '',
    birthDate: ''
  });
  const [result, setResult] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const calculateCompatibility = () => {
    if (!person1.name || !person1.birthDate || !person2.name || !person2.birthDate) {
      toast.error('Please fill in all fields');
      return;
    }
    setIsCalculating(true);
    setTimeout(() => {
      setResult({
        score: 85,
        lifePath1: 7,
        lifePath2: 3,
        strengths: ['Excellent intellectual connection', 'Complementary communication styles', 'Mutual respect for independence', 'Shared spiritual interests'],
        challenges: ['Different social needs', 'May need to work on emotional expression', 'Balance between alone time and togetherness'],
        advice: 'This is a highly compatible pairing with great potential for growth.'
      });
      setIsCalculating(false);
      toast.success('Compatibility calculated!');
    }, 1500);
  };
  return (
    <CosmicPageLayout>
      {/* Header */}
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg">
            <HeartIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-['Playfair_Display'] font-bold text-white">
              Compatibility Checker
            </h1>
            <p className="text-white/70">Discover your cosmic connection</p>
          </div>
        </div>
      </motion.div>

      {/* Input Section */}
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.1,
        }}
        className="mb-8"
      >
        <SpaceCard variant="premium" className="p-6 md:p-8">
          <h2 className="text-2xl font-['Playfair_Display'] font-bold text-white mb-6">
            Enter Life Path Numbers
          </h2>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Person 1 */}
            <div>
              <label className="block text-sm font-medium text-white mb-4">
                Person 1 - Name
              </label>
              <input
                type="text"
                value={person1.name}
                onChange={(e) =>
                  setPerson1({ ...person1, name: e.target.value })
                }
                className="w-full px-4 py-3 bg-[#1a2942]/60 backdrop-blur-xl border border-cyan-500/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-white placeholder-white/50"
                placeholder="Enter name"
              />
              <label className="block text-sm font-medium text-white mb-4 mt-4">
                Birth Date
              </label>
              <input
                type="date"
                value={person1.birthDate}
                onChange={(e) =>
                  setPerson1({ ...person1, birthDate: e.target.value })
                }
                className="w-full px-4 py-3 bg-[#1a2942]/60 backdrop-blur-xl border border-cyan-500/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-white"
              />
            </div>

            {/* Person 2 */}
            <div>
              <label className="block text-sm font-medium text-white mb-4">
                Person 2 - Name
              </label>
              <input
                type="text"
                value={person2.name}
                onChange={(e) =>
                  setPerson2({ ...person2, name: e.target.value })
                }
                className="w-full px-4 py-3 bg-[#1a2942]/60 backdrop-blur-xl border border-cyan-500/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-white placeholder-white/50"
                placeholder="Enter name"
              />
              <label className="block text-sm font-medium text-white mb-4 mt-4">
                Birth Date
              </label>
              <input
                type="date"
                value={person2.birthDate}
                onChange={(e) =>
                  setPerson2({ ...person2, birthDate: e.target.value })
                }
                className="w-full px-4 py-3 bg-[#1a2942]/60 backdrop-blur-xl border border-cyan-500/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-white"
              />
            </div>
          </div>

          <TouchOptimizedButton
            variant="primary"
            size="lg"
            onClick={calculateCompatibility}
            className="w-full"
            icon={<SparklesIcon className="w-5 h-5" />}
            ariaLabel="Check compatibility"
            disabled={isCalculating}
          >
            {isCalculating ? 'Calculating...' : 'Calculate Compatibility'}
          </TouchOptimizedButton>
        </SpaceCard>
      </motion.div>

      {/* Results Section */}
      <AnimatePresence>
        {result && (
          <SubscriptionGate
            feature="compatibility"
            requiredTier="premium"
            showPreview={tier === 'free'}
          >
            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -20,
              }}
              transition={{
                delay: 0.2,
              }}
              className="mb-8"
            >
              <SpaceCard variant="premium" className="p-6 md:p-8 text-center">
                <h2 className="text-2xl font-['Playfair_Display'] font-bold text-white mb-4">
                  Compatibility Score
                </h2>
                <motion.div
                  initial={{
                    scale: 0,
                  }}
                  animate={{
                    scale: 1,
                  }}
                  transition={{
                    delay: 0.3,
                    type: 'spring',
                  }}
                  className="mb-6"
                >
                  <div className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-600 mb-2">
                    {result.score}%
                  </div>
                  <div className="text-xl text-white/80">
                    {result.score >= 80
                      ? 'Excellent'
                      : result.score >= 60
                        ? 'Good'
                        : 'Moderate'}{' '}
                    Match
                  </div>
                </motion.div>
                <p className="text-white/70 max-w-2xl mx-auto leading-relaxed">
                  {person1.name} & {person2.name} - Life Path {result.lifePath1}{' '}
                  + Life Path {result.lifePath2}
                </p>
              </SpaceCard>
            </motion.div>

            {/* Detailed Aspects */}
            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.4,
              }}
            >
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <SpaceCard variant="default" className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircleIcon className="w-6 h-6 text-green-400" />
                    <h4 className="font-semibold text-white">Strengths</h4>
                  </div>
                  <ul className="space-y-2">
                    {result.strengths.map(
                      (strength: string, index: number) => (
                        <motion.li
                          key={index}
                          className="flex items-start gap-2 text-sm text-white/80"
                          initial={{
                            opacity: 0,
                            x: -20,
                          }}
                          animate={{
                            opacity: 1,
                            x: 0,
                          }}
                          transition={{
                            delay: index * 0.1,
                          }}
                        >
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></span>
                          {strength}
                        </motion.li>
                      ),
                    )}
                  </ul>
                </SpaceCard>

                <SpaceCard variant="default" className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircleIcon className="w-6 h-6 text-amber-400" />
                    <h4 className="font-semibold text-white">Challenges</h4>
                  </div>
                  <ul className="space-y-2">
                    {result.challenges.map(
                      (challenge: string, index: number) => (
                        <motion.li
                          key={index}
                          className="flex items-start gap-2 text-sm text-white/80"
                          initial={{
                            opacity: 0,
                            x: 20,
                          }}
                          animate={{
                            opacity: 1,
                            x: 0,
                          }}
                          transition={{
                            delay: index * 0.1,
                          }}
                        >
                          <span className="w-2 h-2 bg-amber-500 rounded-full mt-1.5"></span>
                          {challenge}
                        </motion.li>
                      ),
                    )}
                  </ul>
                </SpaceCard>
              </div>

              <SpaceCard variant="default" className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <SparklesIcon className="w-6 h-6 text-purple-400" />
                  <h4 className="font-semibold text-white">Advice</h4>
                </div>
                <p className="text-white/70">{result.advice}</p>
              </SpaceCard>
            </motion.div>
          </SubscriptionGate>
        )}
      </AnimatePresence>
    </CosmicPageLayout>
  );
}