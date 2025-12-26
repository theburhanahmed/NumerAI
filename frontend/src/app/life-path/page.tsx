'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUpIcon, TargetIcon, CompassIcon, MapIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CosmicPageLayout } from '@/components/cosmic/cosmic-page-layout';
import { SpaceCard } from '@/components/space/space-card';
import { SpaceButton } from '@/components/space/space-button';
import { CrystalNumerologyCube } from '@/components/3d/crystal-numerology-cube';
import { CosmicTooltip } from '@/components/cosmic/cosmic-tooltip';
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
        } else {
          // Profile is null or doesn't have life_path_number
          setSelectedPath(null);
        }
      } catch (error) {
        console.error('Failed to fetch numerology profile:', error);
        setSelectedPath(null);
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
      <CosmicPageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
            <p className="text-white/70">Loading your life path...</p>
          </div>
        </div>
      </CosmicPageLayout>
    );
  }

  if (!selectedPath) {
    return (
      <CosmicPageLayout>
        <SpaceCard variant="premium" className="p-8 text-center">
          <p className="text-white/80 mb-4">
            Your life path is not available yet. Calculate your numerology
            profile first to discover your life path number and unlock
            personalized insights.
          </p>
          <SpaceButton onClick={() => router.push('/numerology-report')}>
            Calculate My Profile
          </SpaceButton>
        </SpaceCard>
      </CosmicPageLayout>
    );
  }

  const phases = [
    {
      age: '0-27',
      title: 'Foundation Phase',
      description:
        'Building your spiritual foundation and discovering your unique gifts. Focus on education and self-discovery.',
      icon: <CompassIcon className="w-6 h-6" />,
      color: 'from-cyan-400 to-blue-600',
    },
    {
      age: '28-54',
      title: 'Growth Phase',
      description:
        'Applying your wisdom and sharing your insights with others. Career and relationships flourish.',
      icon: <TrendingUpIcon className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-600',
    },
    {
      age: '55+',
      title: 'Mastery Phase',
      description:
        'Achieving spiritual mastery and becoming a guide for others. Legacy and wisdom sharing.',
      icon: <TargetIcon className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-600',
    },
  ];

  const strengths =
    currentAnalysis?.strengths && currentAnalysis.strengths.length > 0
      ? currentAnalysis.strengths
      : [
          'Deep spiritual insight and intuition',
          'Analytical and research-oriented mind',
          'Natural wisdom and philosophical thinking',
          'Strong connection to inner guidance',
          'Ability to see beyond surface appearances',
        ];

  const challenges =
    currentAnalysis?.challenges && currentAnalysis.challenges.length > 0
      ? currentAnalysis.challenges
      : [
          'Tendency toward isolation and overthinking',
          'Difficulty trusting others fully',
          'May struggle with practical matters',
          'Can be overly critical of self and others',
          'Need to balance solitude with connection',
        ];

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
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg">
            <MapIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-['Playfair_Display'] font-bold text-white">
              Life Path Analysis
            </h1>
            <p className="text-white/70">Understanding your cosmic journey</p>
          </div>
        </div>
      </motion.div>

      {/* Life Path Number */}
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
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0">
              <CrystalNumerologyCube
                number={selectedPath}
                size="lg"
                color="cyan"
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start mb-3">
                <h2 className="text-3xl font-['Playfair_Display'] font-bold text-white">
                  Life Path Number {selectedPath}
                </h2>
                <CosmicTooltip
                  content="Your most important numerology number"
                  icon
                />
              </div>
              <p className="text-xl text-white/80 leading-relaxed mb-4">
                {selected?.title}
              </p>
              <p className="text-white/70 leading-relaxed">
                {currentAnalysis?.description ||
                  selected?.description ||
                  `Your Life Path ${selectedPath} indicates a journey of spiritual growth, inner wisdom, and deep understanding. You are here to seek truth, develop your intuition, and share your insights with the world.`}
              </p>
            </div>
          </div>
        </SpaceCard>
      </motion.div>

      {/* Life Phases */}
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
          delay: 0.2,
        }}
        className="mb-8"
      >
        <h2 className="text-2xl font-['Playfair_Display'] font-bold text-white mb-6">
          Life Journey Phases
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {phases.map((phase, index) => (
            <motion.div
              key={phase.title}
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.3 + index * 0.1,
              }}
              whileHover={{
                y: -4,
              }}
            >
              <SpaceCard variant="default" className="p-6 h-full">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${phase.color} flex items-center justify-center text-white mb-4 shadow-lg`}
                >
                  {phase.icon}
                </div>
                <div className="mb-3">
                  <span className="text-sm font-semibold text-cyan-400">
                    {phase.age} years
                  </span>
                  <h3 className="text-xl font-['Playfair_Display'] font-bold text-white mt-1">
                    {phase.title}
                  </h3>
                </div>
                <p className="text-white/70 leading-relaxed">
                  {phase.description}
                </p>
              </SpaceCard>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Strengths & Challenges */}
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
        <div className="grid md:grid-cols-2 gap-6">
          {/* Strengths */}
          <SpaceCard variant="default" className="p-6">
            <h3 className="text-xl font-['Playfair_Display'] font-bold text-white mb-4">
              Your Strengths
            </h3>
            {analysisLoading ? (
              <p className="text-sm text-white/60">Loading...</p>
            ) : (
              <ul className="space-y-3">
                {strengths.map((strength, index) => (
                  <motion.li
                    key={index}
                    initial={{
                      opacity: 0,
                      x: -20,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      delay: 0.5 + index * 0.1,
                    }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-white/80">{strength}</span>
                  </motion.li>
                ))}
              </ul>
            )}
          </SpaceCard>

          {/* Challenges */}
          <SpaceCard variant="default" className="p-6">
            <h3 className="text-xl font-['Playfair_Display'] font-bold text-white mb-4">
              Growth Opportunities
            </h3>
            {analysisLoading ? (
              <p className="text-sm text-white/60">Loading...</p>
            ) : (
              <ul className="space-y-3">
                {challenges.map((challenge, index) => (
                  <motion.li
                    key={index}
                    initial={{
                      opacity: 0,
                      x: 20,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      delay: 0.5 + index * 0.1,
                    }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">!</span>
                    </div>
                    <span className="text-white/80">{challenge}</span>
                  </motion.li>
                ))}
              </ul>
            )}
          </SpaceCard>
        </div>
      </motion.div>
    </CosmicPageLayout>
  );
}