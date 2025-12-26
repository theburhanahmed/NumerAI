'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { StarIcon, TrendingUpIcon, SparklesIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CosmicPageLayout } from '@/components/cosmic/cosmic-page-layout';
import { SpaceCard } from '@/components/space/space-card';
import { SpaceButton } from '@/components/space/space-button';
import { CrystalNumerologyCube } from '@/components/3d/crystal-numerology-cube';
import { OptimizedPremium3DPlanet } from '@/components/3d/optimized-premium-3d-planet';
import { CosmicTooltip } from '@/components/cosmic/cosmic-tooltip';
import { numerologyAPI } from '@/lib/numerology-api';
import { userAPI } from '@/lib/api-client';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import type { BirthChart } from '@/lib/numerology-api';

export default function BirthChart() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=${encodeURIComponent('/birth-chart')}`);
    }
  }, [user, authLoading, router]);
  const [loading, setLoading] = useState(true);
  const [birthChart, setBirthChart] = useState<BirthChart | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [pinnacles, setPinnacles] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch birth chart
        try {
          const chart = await numerologyAPI.getBirthChart();
          setBirthChart(chart);
        } catch (error) {
          console.error('Failed to fetch birth chart:', error);
          setBirthChart(null);
        }

        // Fetch user profile for name
        try {
          const profileResponse = await userAPI.getProfile();
          const profileData = profileResponse.data?.user || profileResponse.data;
          setUserProfile(profileData);
          
          // Calculate pinnacles and challenges if we have birth date
          if (profileData?.date_of_birth) {
            calculatePinnaclesAndChallenges(profileData.date_of_birth);
          }
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load birth chart');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const calculatePinnaclesAndChallenges = (birthDateStr: string) => {
    const birthDate = new Date(birthDateStr);
    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();
    const year = birthDate.getFullYear();
    
    const reduce = (num: number): number => {
      while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
        num = Math.floor(num / 10) + (num % 10);
      }
      return num;
    };

    // Calculate Pinnacles
    const p1 = reduce(month + day);
    const p2 = reduce(day + year);
    const p3 = reduce(p1 + p2);
    const p4 = reduce(p2 + p3);

    setPinnacles([
      { number: p1, period: 'First Pinnacle', age: '0-28' },
      { number: p2, period: 'Second Pinnacle', age: '29-56' },
      { number: p3, period: 'Third Pinnacle', age: '57+' },
      { number: p4, period: 'Fourth Pinnacle', age: 'Later Life' }
    ]);

    // Calculate Challenges
    const c1 = reduce(Math.abs(month - day));
    const c2 = reduce(Math.abs(day - year));
    const c3 = reduce(Math.abs(c1 - c2));
    const c4 = reduce(Math.abs(c2 - c3));

    setChallenges([
      { number: c1, name: 'First Challenge', age: '0-28' },
      { number: c2, name: 'Second Challenge', age: '29-56' },
      { number: c3, name: 'Third Challenge', age: '57+' },
      { number: c4, name: 'Fourth Challenge', age: 'Later Life' }
    ]);
  };

  const getNumberColor = (label: string) => {
    const colorMap: Record<string, string> = {
      'Life Path': 'from-blue-500 to-cyan-600',
      'Destiny': 'from-purple-500 to-pink-600',
      'Soul Urge': 'from-yellow-500 to-amber-600',
      'Personality': 'from-green-500 to-emerald-600',
      'Birth Day': 'from-pink-500 to-rose-600',
      'Attitude': 'from-indigo-500 to-purple-600',
      'Maturity': 'from-teal-500 to-cyan-600',
      'Balance': 'from-orange-500 to-red-600',
    };
    return colorMap[label] || 'from-blue-500 to-purple-600';
  };

  const getNumberPosition = (index: number, total: number) => {
    const positions = [
      'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
      'top-1/4 left-1/2 -translate-x-1/2',
      'top-1/2 left-1/4 -translate-y-1/2',
      'top-1/2 right-1/4 -translate-y-1/2',
      'bottom-1/4 left-1/2 -translate-x-1/2',
    ];
    return positions[index % positions.length];
  };

  const getUserName = () => {
    if (userProfile?.full_name) return userProfile.full_name.split(' ')[0];
    if (user?.full_name) return user.full_name.split(' ')[0];
    return 'You';
  };

  if (loading) {
    return (
      <CosmicPageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
            <p className="text-white/70">Loading your birth chart...</p>
          </div>
        </div>
      </CosmicPageLayout>
    );
  }

  if (!birthChart?.profile) {
    return (
      <CosmicPageLayout>
        <SpaceCard variant="premium" className="p-8 text-center">
          <p className="text-white/80 mb-4">
            Your birth chart is not available yet. Calculate your numerology
            profile first to see your personalized birth chart with all your core
            numbers.
          </p>
          <SpaceButton onClick={() => router.push('/numerology-report')}>
            Calculate My Profile
          </SpaceButton>
        </SpaceCard>
      </CosmicPageLayout>
    );
  }

  const profile = birthChart.profile;
  const coreNumbers = [
    { label: 'Life Path', number: profile.life_path_number },
    { label: 'Destiny', number: profile.destiny_number },
    { label: 'Soul Urge', number: profile.soul_urge_number },
    { label: 'Personality', number: profile.personality_number },
    { label: 'Birth Day', number: profile.personality_number }, // Using personality as placeholder, should be calculated from birth date
  ].filter(n => n.number != null);
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
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <StarIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-['Playfair_Display'] font-bold text-white">
              Birth Chart
            </h1>
            <p className="text-white/70">
              Your complete numerological blueprint
            </p>
          </div>
        </div>
      </motion.div>

      {/* Page Description */}
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
        <SpaceCard variant="premium" className="p-6">
          <p className="text-white/80 leading-relaxed">
            Your birth chart is a comprehensive visual representation of your
            complete numerology profile. It displays all your core numbers
            including Life Path, Destiny, Soul Urge, Personality, and more,
            along with detailed interpretations.
          </p>
        </SpaceCard>
      </motion.div>

      {/* Cosmic Chart Visualization */}
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
        <SpaceCard variant="premium" className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-['Playfair_Display'] font-bold text-white">
              Cosmic Alignment
            </h2>
            <CosmicTooltip content="Your numbers in cosmic harmony" icon />
          </div>

          {/* Chart Visualization */}
          <div className="relative aspect-square max-w-2xl mx-auto mb-8">
            {/* Central Planet */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <OptimizedPremium3DPlanet
                type="earth"
                size="md"
                withRings={true}
                withMoons={false}
              />
            </div>

            {/* Orbiting Numbers */}
            {coreNumbers.map((num, index) => {
              const colors = {
                'Life Path': 'cyan' as const,
                'Destiny': 'purple' as const,
                'Soul Urge': 'blue' as const,
                'Personality': 'pink' as const,
                'Birth Day': 'cyan' as const,
              };
              const color = colors[num.label as keyof typeof colors] || 'cyan';
              const positions = [
                'top-1/4 left-1/2',
                'top-1/2 right-1/4',
                'bottom-1/4 left-1/4',
                'bottom-1/4 right-1/3',
                'top-1/3 left-1/4',
              ];
              return (
                <motion.div
                  key={num.label}
                  className={`absolute ${positions[index % positions.length]} -translate-x-1/2 -translate-y-1/2`}
                  initial={{
                    opacity: 0,
                    scale: 0,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  transition={{
                    delay: 0.3 + index * 0.2,
                    type: 'spring',
                  }}
                >
                  <div className="text-center">
                    <CrystalNumerologyCube
                      number={num.number || 0}
                      size="sm"
                      color={color}
                    />
                    <p className="text-xs font-semibold text-white mt-2">
                      {num.label}
                    </p>
                  </div>
                </motion.div>
              );
            })}

            {/* Connecting Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
              <motion.circle
                cx="50%"
                cy="50%"
                r="30%"
                fill="none"
                stroke="url(#gradient1)"
                strokeWidth="1"
                initial={{
                  pathLength: 0,
                }}
                animate={{
                  pathLength: 1,
                }}
                transition={{
                  duration: 2,
                  delay: 0.5,
                }}
              />
              <motion.circle
                cx="50%"
                cy="50%"
                r="40%"
                fill="none"
                stroke="url(#gradient2)"
                strokeWidth="1"
                initial={{
                  pathLength: 0,
                }}
                animate={{
                  pathLength: 1,
                }}
                transition={{
                  duration: 2,
                  delay: 0.7,
                }}
              />
              <defs>
                <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00d4ff" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
                <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <p className="text-center text-white/70 max-w-2xl mx-auto">
            Your birth chart reveals the cosmic energies that influence your
            life journey. Each number represents a different aspect of your
            personality and destiny.
          </p>
        </SpaceCard>
      </motion.div>

      {/* Additional Numbers */}
      {coreNumbers.length > 0 && (
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
            delay: 0.5,
          }}
        >
          <h2 className="text-2xl font-['Playfair_Display'] font-bold text-white mb-6">
            Additional Influences
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {coreNumbers.map((num, index) => (
              <motion.div
                key={num.label}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.6 + index * 0.1,
                }}
                whileHover={{
                  y: -4,
                }}
              >
                <SpaceCard variant="default" className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white flex-shrink-0">
                      <StarIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-white">{num.label}</h3>
                        <span className="text-2xl font-bold text-cyan-400">
                          {num.number}
                        </span>
                      </div>
                      <p className="text-sm text-white/70">
                        Core numerology number
                      </p>
                    </div>
                  </div>
                </SpaceCard>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
      </CosmicPageLayout>
    );
  }