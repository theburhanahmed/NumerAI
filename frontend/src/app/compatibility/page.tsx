'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartIcon, SparklesIcon, CheckCircleIcon, AlertCircleIcon, UsersIcon } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { FloatingOrbs } from '@/components/ui/floating-orbs';
import { AmbientParticles } from '@/components/ui/ambient-particles';
import { MagneticCard } from '@/components/ui/magnetic-card';
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
  return <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 transition-colors duration-500 relative overflow-hidden">
      <AmbientParticles />
      <FloatingOrbs />
      <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-6 py-8">
        {/* Page Header */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div className="w-14 h-14 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg" animate={{
            rotate: [0, 5, -5, 0],
            scale: [1, 1.05, 1]
          }} transition={{
            duration: 3,
            repeat: Infinity
          }}>
              <HeartIcon className="w-8 h-8 text-white" />
            </motion.div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 dark:from-pink-400 dark:via-purple-400 dark:to-blue-400 bg-clip-text text-transparent mb-3">
            Compatibility Checker
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Discover the harmony between two souls through numerology
          </p>
        </motion.div>

        {/* Input Form */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.1
      }} className="mb-8">
          <GlassCard variant="liquid-premium" className="p-6 md:p-8">
            <div className="liquid-glass-content">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                Enter Your Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Person 1 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <UsersIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Person 1
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Name
                      </label>
                      <input type="text" value={person1.name} onChange={e => setPerson1({
                      ...person1,
                      name: e.target.value
                    })} className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border border-gray-300 dark:border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white/50" placeholder="Enter name" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Birth Date
                      </label>
                      <input type="date" value={person1.birthDate} onChange={e => setPerson1({
                      ...person1,
                      birthDate: e.target.value
                    })} className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border border-gray-300 dark:border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white" />
                    </div>
                  </div>
                </div>

                {/* Person 2 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <UsersIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    Person 2
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Name
                      </label>
                      <input type="text" value={person2.name} onChange={e => setPerson2({
                      ...person2,
                      name: e.target.value
                    })} className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border border-gray-300 dark:border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white/50" placeholder="Enter name" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Birth Date
                      </label>
                      <input type="date" value={person2.birthDate} onChange={e => setPerson2({
                      ...person2,
                      birthDate: e.target.value
                    })} className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border border-gray-300 dark:border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white" />
                    </div>
                  </div>
                </div>
              </div>
              <GlassButton variant="liquid" size="lg" className="w-full glass-glow" onClick={calculateCompatibility} disabled={isCalculating}>
                {isCalculating ? <motion.div className="flex items-center gap-2" animate={{
                opacity: [0.5, 1, 0.5]
              }} transition={{
                duration: 1.5,
                repeat: Infinity
              }}>
                    <motion.div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" animate={{
                  rotate: 360
                }} transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: 'linear'
                }} />
                    Calculating...
                  </motion.div> : 'Calculate Compatibility'}
              </GlassButton>
            </div>
          </GlassCard>
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {result && <SubscriptionGate feature="compatibility" requiredTier="premium" showPreview={tier === 'free'}>
            <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} exit={{
          opacity: 0,
          y: -20
        }}>
              <GlassCard variant="liquid-premium" className="p-6 md:p-8 mb-6 bg-gradient-to-br from-pink-500/20 to-purple-500/20 liquid-glass-iridescent">
                <div className="liquid-glass-content">
                  <div className="text-center mb-8">
                    <motion.div initial={{
                  scale: 0
                }} animate={{
                  scale: 1
                }} transition={{
                  type: 'spring',
                  stiffness: 200
                }} className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full text-white font-bold text-4xl shadow-2xl mb-4">
                      {result.score}%
                    </motion.div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {person1.name} & {person2.name}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      Life Path {result.lifePath1} + Life Path{' '}
                      {result.lifePath2}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <MagneticCard variant="liquid" className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10">
                      <div className="liquid-glass-content">
                        <div className="flex items-center gap-2 mb-4">
                          <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            Strengths
                          </h4>
                        </div>
                        <ul className="space-y-2">
                          {result.strengths.map((strength: string, index: number) => <motion.li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300" initial={{
                        opacity: 0,
                        x: -20
                      }} animate={{
                        opacity: 1,
                        x: 0
                      }} transition={{
                        delay: index * 0.1
                      }}>
                                <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></span>
                                {strength}
                              </motion.li>)}
                        </ul>
                      </div>
                    </MagneticCard>

                    <MagneticCard variant="liquid" className="p-6 bg-gradient-to-br from-amber-500/10 to-orange-500/10">
                      <div className="liquid-glass-content">
                        <div className="flex items-center gap-2 mb-4">
                          <AlertCircleIcon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            Challenges
                          </h4>
                        </div>
                        <ul className="space-y-2">
                          {result.challenges.map((challenge: string, index: number) => <motion.li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300" initial={{
                        opacity: 0,
                        x: 20
                      }} animate={{
                        opacity: 1,
                        x: 0
                      }} transition={{
                        delay: index * 0.1
                      }}>
                                <span className="w-2 h-2 bg-amber-500 rounded-full mt-1.5"></span>
                                {challenge}
                              </motion.li>)}
                        </ul>
                      </div>
                    </MagneticCard>
                  </div>

                  <GlassCard variant="liquid" className="p-6 mt-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                    <div className="liquid-glass-content">
                      <div className="flex items-center gap-2 mb-3">
                        <SparklesIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          Advice
                        </h4>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">
                        {result.advice}
                      </p>
                    </div>
                  </GlassCard>
                </div>
              </GlassCard>
            </motion.div>
          </SubscriptionGate>}
        </AnimatePresence>
      </div>
    </div>;
}