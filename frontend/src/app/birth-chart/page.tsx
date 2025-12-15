'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { StarIcon, TrendingUpIcon, SparklesIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { FloatingOrbs } from '@/components/ui/floating-orbs';
import { AmbientParticles } from '@/components/ui/ambient-particles';
import { MagneticCard } from '@/components/ui/magnetic-card';
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
      <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 transition-colors duration-500 relative overflow-hidden">
        <AmbientParticles />
        <FloatingOrbs />
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading your birth chart...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!birthChart?.profile) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 transition-colors duration-500 relative overflow-hidden">
        <AmbientParticles />
        <FloatingOrbs />
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-8">
          <GlassCard className="p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Your birth chart is not available yet. Calculate your numerology profile first to see your personalized birth chart with all your core numbers.
            </p>
            <GlassButton onClick={() => router.push('/numerology-report')}>
              Calculate My Profile
            </GlassButton>
          </GlassCard>
        </div>
      </div>
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
  return <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 transition-colors duration-500 relative overflow-hidden">
      <AmbientParticles />
      <FloatingOrbs />
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Page Header */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <motion.div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg" animate={{
            rotate: [0, 5, -5, 0]
          }} transition={{
            duration: 3,
            repeat: Infinity
          }}>
              <StarIcon className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-white dark:via-purple-300 dark:to-blue-300 bg-clip-text text-transparent">
                Birth Chart
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Visual representation of your numerology profile
              </p>
            </div>
          </div>
        </motion.div>

        {/* Chart Visualization */}
        <motion.div initial={{
        opacity: 0,
        scale: 0.9
      }} animate={{
        opacity: 1,
        scale: 1
      }} transition={{
        delay: 0.1
      }} className="mb-8">
          <GlassCard variant="liquid-premium" className="p-8 bg-gradient-to-br from-blue-500/10 to-purple-600/10 liquid-glass-iridescent">
            <div className="liquid-glass-content">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                Your Numerology Chart
              </h2>
              <div className="relative w-full max-w-2xl mx-auto" style={{
              aspectRatio: '1/1'
            }}>
                {/* Center Circle */}
                <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl" animate={{
                rotate: 360
              }} transition={{
                duration: 20,
                repeat: Infinity,
                ease: 'linear'
              }}>
                  <div className="text-center text-white">
                    <p className="text-xs mb-1">{getUserName()}</p>
                    <p className="text-2xl font-bold">{profile.life_path_number || '-'}</p>
                  </div>
                </motion.div>

                {/* Orbiting Numbers */}
                {coreNumbers.map((num, index) => <motion.div key={num.label} className={`absolute ${getNumberPosition(index, coreNumbers.length)}`} initial={{
                opacity: 0,
                scale: 0
              }} animate={{
                opacity: 1,
                scale: 1
              }} transition={{
                delay: 0.2 + index * 0.1,
                type: 'spring'
              }}>
                    <motion.div className={`w-24 h-24 bg-gradient-to-r ${getNumberColor(num.label)} rounded-2xl flex flex-col items-center justify-center text-white shadow-xl`} whileHover={{
                  scale: 1.1,
                  rotate: 5
                }}>
                      <p className="text-xs mb-1">{num.label}</p>
                      <p className="text-3xl font-bold">{num.number}</p>
                    </motion.div>
                  </motion.div>)}

                {/* Connecting Lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <motion.circle cx="50%" cy="50%" r="30%" fill="none" stroke="currentColor" strokeWidth="1" className="text-purple-300/30 dark:text-purple-500/30" initial={{
                  pathLength: 0
                }} animate={{
                  pathLength: 1
                }} transition={{
                  duration: 2,
                  delay: 0.5
                }} />
                  <motion.circle cx="50%" cy="50%" r="20%" fill="none" stroke="currentColor" strokeWidth="1" className="text-blue-300/30 dark:text-blue-500/30" initial={{
                  pathLength: 0
                }} animate={{
                  pathLength: 1
                }} transition={{
                  duration: 2,
                  delay: 0.7
                }} />
                </svg>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Life Cycles */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.3
      }} className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Life Cycles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pinnacles.slice(0, 3).map((pinnacle, index) => <motion.div key={pinnacle.period} initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.4 + index * 0.1
          }}>
                <MagneticCard variant="liquid-premium" className="p-6">
                  <div className="liquid-glass-content">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        {pinnacle.period}
                      </h3>
                      <motion.div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg" whileHover={{
                    scale: 1.1,
                    rotate: 5
                  }}>
                        {pinnacle.number}
                      </motion.div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Ages {pinnacle.age}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      {pinnacle.period.replace('Pinnacle', 'Cycle')}
                    </p>
                  </div>
                </MagneticCard>
              </motion.div>)}
          </div>
        </motion.div>

        {/* Challenges & Lessons */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.5
      }} className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Life Challenges & Lessons
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {challenges.slice(0, 3).map((challenge, index) => <motion.div key={challenge.name} initial={{
            opacity: 0,
            x: -20
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            delay: 0.6 + index * 0.1
          }}>
                <MagneticCard variant="liquid-premium" className="p-6 bg-gradient-to-br from-amber-500/10 to-orange-500/10">
                  <div className="liquid-glass-content">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                        {challenge.number}
                      </div>
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        {challenge.name}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {challenge.description}
                    </p>
                  </div>
                </MagneticCard>
              </motion.div>)}
          </div>
        </motion.div>

        {/* Pinnacles */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.7
      }}>
          <GlassCard variant="liquid-premium" className="p-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 liquid-glass-iridescent">
            <div className="liquid-glass-content">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUpIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Your Pinnacles
                </h2>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Pinnacles represent the major themes and opportunities in
                different periods of your life.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MagneticCard variant="liquid" className="p-5">
                  <div className="liquid-glass-content">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Current Pinnacle
                    </h3>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        5
                      </div>
                      <div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          Freedom & Change
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                      {pinnacles[0]?.age || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </MagneticCard>

            {pinnacles[1] && (
              <MagneticCard variant="liquid" className="p-5">
                <div className="liquid-glass-content">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Next Pinnacle
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      {pinnacles[1].number}
                    </div>
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {pinnacles[1].period}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {pinnacles[1].age}
                      </p>
                    </div>
                  </div>
                </div>
              </MagneticCard>
            )}
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>;
}