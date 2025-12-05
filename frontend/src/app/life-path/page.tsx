'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { StarIcon, SparklesIcon, TrendingUpIcon, HeartIcon, BriefcaseIcon, BookOpenIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AppNavbar } from '@/components/navigation/app-navbar';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { FloatingOrbs } from '@/components/ui/floating-orbs';
import { AmbientParticles } from '@/components/ui/ambient-particles';
import { MagneticCard } from '@/components/ui/magnetic-card';
import { numerologyAPI } from '@/lib/numerology-api';
import type { LifePathAnalysis } from '@/lib/numerology-api';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';

export default function LifePathAnalysis() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [selectedPath, setSelectedPath] = useState<number | null>(null);
  const [lifePathAnalysis, setLifePathAnalysis] = useState<LifePathAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=${encodeURIComponent('/life-path')}`);
    }
  }, [user, authLoading, router]);
  const lifePaths = [{
    number: 1,
    title: 'The Leader',
    description: 'Independent, ambitious, and pioneering',
    color: 'from-red-500 to-orange-600'
  }, {
    number: 2,
    title: 'The Peacemaker',
    description: 'Diplomatic, cooperative, and sensitive',
    color: 'from-blue-500 to-cyan-600'
  }, {
    number: 3,
    title: 'The Creative',
    description: 'Expressive, optimistic, and artistic',
    color: 'from-yellow-500 to-amber-600'
  }, {
    number: 4,
    title: 'The Builder',
    description: 'Practical, disciplined, and reliable',
    color: 'from-green-500 to-emerald-600'
  }, {
    number: 5,
    title: 'The Adventurer',
    description: 'Dynamic, freedom-loving, and versatile',
    color: 'from-purple-500 to-pink-600'
  }, {
    number: 6,
    title: 'The Nurturer',
    description: 'Caring, responsible, and harmonious',
    color: 'from-rose-500 to-pink-600'
  }, {
    number: 7,
    title: 'The Seeker',
    description: 'Analytical, spiritual, and introspective',
    color: 'from-indigo-500 to-purple-600'
  }, {
    number: 8,
    title: 'The Powerhouse',
    description: 'Ambitious, authoritative, and material success',
    color: 'from-gray-700 to-gray-900'
  }, {
    number: 9,
    title: 'The Humanitarian',
    description: 'Compassionate, idealistic, and generous',
    color: 'from-teal-500 to-cyan-600'
  }];

  useEffect(() => {
    const fetchUserLifePath = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const profile = await numerologyAPI.getProfile();
        if (profile?.life_path_number) {
          setSelectedPath(profile.life_path_number);
          // Fetch detailed analysis for user's life path
          try {
            setAnalysisLoading(true);
            const analysis = await numerologyAPI.getLifePathAnalysis();
            setLifePathAnalysis(analysis);
          } catch (error) {
            console.error('Failed to fetch life path analysis:', error);
          } finally {
            setAnalysisLoading(false);
          }
        }
      } catch (error) {
        console.error('Failed to fetch numerology profile:', error);
        toast.error('Failed to load your life path. Please calculate your profile first.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserLifePath();
  }, [user]);

  const handlePathChange = async (pathNumber: number) => {
    setSelectedPath(pathNumber);
    // If changing to user's actual path, fetch analysis
    if (user) {
      try {
        const profile = await numerologyAPI.getProfile();
        if (profile?.life_path_number === pathNumber) {
          setAnalysisLoading(true);
          const analysis = await numerologyAPI.getLifePathAnalysis();
          setLifePathAnalysis(analysis);
          setAnalysisLoading(false);
        } else {
          // For other paths, clear analysis
          setLifePathAnalysis(null);
        }
      } catch (error) {
        console.error('Failed to fetch analysis:', error);
        setLifePathAnalysis(null);
      }
    }
  };

  const selected = lifePaths.find(p => p.number === selectedPath);
  const currentAnalysis = lifePathAnalysis && selectedPath === lifePathAnalysis.number ? lifePathAnalysis : null;

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 transition-colors duration-500 relative overflow-hidden">
        <AmbientParticles />
        <FloatingOrbs />
        <AppNavbar />
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading your life path...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedPath) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 transition-colors duration-500 relative overflow-hidden">
        <AmbientParticles />
        <FloatingOrbs />
        <AppNavbar />
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-8">
          <GlassCard className="p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Please calculate your numerology profile first to see your life path.
            </p>
            <GlassButton onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </GlassButton>
          </GlassCard>
        </div>
      </div>
    );
  }

  return <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 transition-colors duration-500 relative overflow-hidden">
      <AmbientParticles />
      <FloatingOrbs />
      <AppNavbar />

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Hero Section */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.1
      }}>
          <GlassCard variant="liquid-premium" className={`p-8 mb-8 bg-gradient-to-br ${selected?.color} text-white relative overflow-hidden`}>
            <div className="liquid-glass-content">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="relative z-10">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  Life Path {selectedPath}
                </h1>
                <h2 className="text-2xl md:text-3xl mb-2">{selected?.title}</h2>
                <p className="text-xl text-white/90">{selected?.description}</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Life Path Numbers Grid */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.2
      }} className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Explore All Life Paths
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
            {lifePaths.map((path, index) => <motion.button key={path.number} onClick={() => handlePathChange(path.number)} className={`p-4 rounded-2xl backdrop-blur-xl border transition-all ${selectedPath === path.number ? 'bg-gradient-to-r ' + path.color + ' text-white border-white/30 shadow-xl scale-105' : 'bg-white/50 dark:bg-gray-800/50 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white'}`} initial={{
            opacity: 0,
            scale: 0.8
          }} animate={{
            opacity: 1,
            scale: 1
          }} transition={{
            delay: index * 0.05
          }} whileHover={{
            scale: 1.1,
            y: -4
          }} whileTap={{
            scale: 0.95
          }}>
                <div className="text-3xl font-bold mb-1">{path.number}</div>
                <div className="text-xs">{path.title.split(' ')[1]}</div>
              </motion.button>)}
          </div>
        </motion.div>

        {/* Detailed Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Characteristics */}
          <motion.div initial={{
          opacity: 0,
          x: -20
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          delay: 0.3
        }}>
            <MagneticCard variant="liquid-premium" className="p-6">
              <div className="liquid-glass-content">
                <div className="flex items-center gap-3 mb-6">
                  <SparklesIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Key Characteristics
                  </h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Strengths
                    </h4>
                    {analysisLoading ? (
                      <p className="text-sm text-gray-500">Loading...</p>
                    ) : currentAnalysis?.strengths && currentAnalysis.strengths.length > 0 ? (
                      <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        {currentAnalysis.strengths.map((strength, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full" />
                            {strength}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500 italic">Calculate your profile to see personalized strengths</p>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Challenges
                    </h4>
                    {analysisLoading ? (
                      <p className="text-sm text-gray-500">Loading...</p>
                    ) : currentAnalysis?.challenges && currentAnalysis.challenges.length > 0 ? (
                      <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        {currentAnalysis.challenges.map((challenge, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-amber-500 rounded-full" />
                            {challenge}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500 italic">Calculate your profile to see personalized challenges</p>
                    )}
                  </div>
                </div>
              </div>
            </MagneticCard>
          </motion.div>

          {/* Life Areas */}
          <motion.div initial={{
          opacity: 0,
          x: 20
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          delay: 0.4
        }}>
            <MagneticCard variant="liquid-premium" className="p-6">
              <div className="liquid-glass-content">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUpIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Life Areas
                  </h3>
                </div>
                <div className="space-y-4">
                  <GlassCard variant="liquid" className="p-4">
                    <div className="liquid-glass-content">
                      <div className="flex items-center gap-2 mb-2">
                        <HeartIcon className="w-5 h-5 text-pink-500" />
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          Relationships
                        </h4>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {currentAnalysis?.relationships || selected?.description || 'Calculate your profile to see personalized insights'}
                      </p>
                    </div>
                  </GlassCard>

                  <GlassCard variant="liquid" className="p-4">
                    <div className="liquid-glass-content">
                      <div className="flex items-center gap-2 mb-2">
                        <BriefcaseIcon className="w-5 h-5 text-blue-500" />
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          Career
                        </h4>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {currentAnalysis?.career && currentAnalysis.career.length > 0 
                          ? currentAnalysis.career.join(', ')
                          : selected?.description || 'Calculate your profile to see personalized career insights'}
                      </p>
                    </div>
                  </GlassCard>

                  <GlassCard variant="liquid" className="p-4">
                    <div className="liquid-glass-content">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpenIcon className="w-5 h-5 text-purple-500" />
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          Personal Growth
                        </h4>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {currentAnalysis?.advice || selected?.description || 'Calculate your profile to see personalized growth insights'}
                      </p>
                    </div>
                  </GlassCard>
                </div>
              </div>
            </MagneticCard>
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.5
      }}>
          <GlassCard variant="liquid-premium" className="p-8 text-center bg-gradient-to-br from-blue-500/20 to-purple-600/20 liquid-glass-iridescent">
            <div className="liquid-glass-content">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Want Your Complete Analysis?
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Get a detailed report with personalized insights and guidance
              </p>
              <GlassButton variant="liquid" size="lg" onClick={() => router.push('/numerology-report')} className="glass-glow">
                View Full Report
              </GlassButton>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>;
}