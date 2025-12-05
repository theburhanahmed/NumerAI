'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertCircleIcon, TrendingUpIcon, SparklesIcon, BookOpenIcon } from 'lucide-react';
import { PageLayout } from '@/components/ui/page-layout';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { useAuth } from '@/contexts/auth-context';
import { numerologyAPI } from '@/lib/numerology-api';
import { userAPI } from '@/lib/api-client';
import { toast } from 'sonner';

export default function AdvancedNumerology() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'karmic' | 'pinnacle'>('karmic');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchData();
  }, [user, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [numerologyData, profileData] = await Promise.all([
        numerologyAPI.getProfile().catch(() => null),
        userAPI.getProfile().catch(() => null)
      ]);
      setProfile(numerologyData);
      setUserProfile(profileData?.data || profileData);
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate karmic lessons (missing numbers from birth date)
  const calculateKarmicLessons = () => {
    if (!userProfile) return [];

    const birthDate = userProfile?.date_of_birth || '';
    if (!birthDate) return [];

    const dateStr = birthDate.replace(/-/g, '');
    const presentNumbers = new Set<string>();
    
    for (const char of dateStr) {
      if (char >= '1' && char <= '9') {
        presentNumbers.add(char);
      }
    }

    const karmicLessons = [];
    for (let i = 1; i <= 9; i++) {
      if (!presentNumbers.has(i.toString())) {
        karmicLessons.push({
          number: i,
          lesson: getKarmicLessonDescription(i)
        });
      }
    }

    return karmicLessons;
  };

  const getKarmicLessonDescription = (number: number): string => {
    const descriptions: Record<number, string> = {
      1: 'Learn independence and leadership. Develop self-confidence and initiative.',
      2: 'Develop cooperation and diplomacy. Learn to work with others harmoniously.',
      3: 'Cultivate creativity and self-expression. Share your talents with the world.',
      4: 'Build structure and discipline. Learn organization and practical skills.',
      5: 'Embrace freedom and change. Develop adaptability and versatility.',
      6: 'Learn responsibility and service. Balance giving with self-care.',
      7: 'Develop spiritual awareness and inner wisdom. Trust your intuition.',
      8: 'Master material success and power. Learn to use authority wisely.',
      9: 'Cultivate compassion and universal love. Serve humanity selflessly.'
    };
    return descriptions[number] || 'Learn the lessons associated with this number.';
  };

  // Calculate Pinnacles and Challenges
  const calculatePinnacles = () => {
    if (!userProfile?.date_of_birth) return [];

    const birthDate = new Date(userProfile.date_of_birth);
    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();
    const year = birthDate.getFullYear();
    
    const reduce = (num: number): number => {
      while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
        num = Math.floor(num / 10) + (num % 10);
      }
      return num;
    };

    const p1 = reduce(month + day);
    const p2 = reduce(day + year);
    const p3 = reduce(p1 + p2);
    const p4 = reduce(p2 + p3);

    return [
      { number: p1, period: '0-28', title: 'First Pinnacle' },
      { number: p2, period: '29-56', title: 'Second Pinnacle' },
      { number: p3, period: '57+', title: 'Third Pinnacle' },
      { number: p4, period: 'Later Life', title: 'Fourth Pinnacle' }
    ];
  };

  const calculateChallenges = () => {
    if (!userProfile?.date_of_birth) return [];

    const birthDate = new Date(userProfile.date_of_birth);
    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();
    const year = birthDate.getFullYear();
    
    const reduce = (num: number): number => {
      while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
        num = Math.floor(num / 10) + (num % 10);
      }
      return num;
    };

    const c1 = reduce(Math.abs(month - day));
    const c2 = reduce(Math.abs(day - year));
    const c3 = reduce(Math.abs(c1 - c2));
    const c4 = reduce(Math.abs(c2 - c3));

    return [
      { number: c1, period: '0-28', title: 'First Challenge' },
      { number: c2, period: '29-56', title: 'Second Challenge' },
      { number: c3, period: '57+', title: 'Third Challenge' },
      { number: c4, period: 'Later Life', title: 'Fourth Challenge' }
    ];
  };

  const getPinnacleDescription = (number: number): string => {
    const descriptions: Record<number, string> = {
      1: 'A period of independence, leadership, and new beginnings. Time to take initiative.',
      2: 'A period of cooperation, partnership, and diplomacy. Focus on relationships.',
      3: 'A period of creativity, expression, and communication. Share your talents.',
      4: 'A period of building, structure, and hard work. Establish foundations.',
      5: 'A period of freedom, change, and adventure. Embrace new experiences.',
      6: 'A period of responsibility, service, and family. Focus on nurturing.',
      7: 'A period of spiritual growth, introspection, and inner wisdom.',
      8: 'A period of material success, power, and achievement. Focus on goals.',
      9: 'A period of completion, humanitarian service, and universal love.'
    };
    return descriptions[number] || 'A significant period in your life journey.';
  };

  const getChallengeDescription = (number: number): string => {
    const descriptions: Record<number, string> = {
      0: 'No major challenge. Smooth path ahead.',
      1: 'Challenge with independence and leadership. Learn to lead without being domineering.',
      2: 'Challenge with cooperation and sensitivity. Balance independence with partnership.',
      3: 'Challenge with self-expression. Overcome self-doubt and share your creativity.',
      4: 'Challenge with discipline and structure. Learn organization and patience.',
      5: 'Challenge with freedom and change. Balance adventure with responsibility.',
      6: 'Challenge with responsibility. Avoid over-giving and learn boundaries.',
      7: 'Challenge with trust and faith. Develop spiritual understanding.',
      8: 'Challenge with material success. Learn to use power wisely.',
      9: 'Challenge with completion and letting go. Learn detachment.'
    };
    return descriptions[number] || 'A lesson to learn during this period.';
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading advanced numerology...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!profile) {
    return (
      <PageLayout>
        <GlassCard className="p-8 text-center">
          <AlertCircleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Profile Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please calculate your numerology profile first.
          </p>
          <GlassButton onClick={() => router.push('/dashboard')}>
            Go to Dashboard
          </GlassButton>
        </GlassCard>
      </PageLayout>
    );
  }

  const karmicLessons = calculateKarmicLessons();
  const pinnacles = calculatePinnacles();
  const challenges = calculateChallenges();

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <SparklesIcon className="w-6 h-6 text-white" />
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-white dark:via-purple-300 dark:to-blue-300 bg-clip-text text-transparent">
              Advanced Numerology
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Deep insights into your karmic lessons and life cycles
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 justify-center mb-6">
          <GlassButton
            variant={activeTab === 'karmic' ? 'liquid' : 'ghost'}
            onClick={() => setActiveTab('karmic')}
            icon={<AlertCircleIcon className="w-4 h-4" />}
          >
            Karmic Lessons
          </GlassButton>
          <GlassButton
            variant={activeTab === 'pinnacle' ? 'liquid' : 'ghost'}
            onClick={() => setActiveTab('pinnacle')}
            icon={<TrendingUpIcon className="w-4 h-4" />}
          >
            Pinnacles & Challenges
          </GlassButton>
        </div>

        {/* Karmic Lessons Tab */}
        {activeTab === 'karmic' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <GlassCard className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <AlertCircleIcon className="w-8 h-8 text-purple-600" />
                <h2 className="text-2xl font-bold">Karmic Lessons</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Karmic lessons are numbers missing from your birth date. These represent areas where you need to grow and develop throughout your life.
              </p>

              {karmicLessons.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Congratulations! All numbers are present in your birth date.
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    You have a balanced numerological foundation.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {karmicLessons.map((lesson, index) => (
                    <motion.div
                      key={lesson.number}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <GlassCard variant="elevated" className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                            {lesson.number}
                          </div>
                          <h3 className="text-lg font-semibold">Missing Number {lesson.number}</h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {lesson.lesson}
                        </p>
                      </GlassCard>
                    </motion.div>
                  ))}
                </div>
              )}
            </GlassCard>
          </motion.div>
        )}

        {/* Pinnacles & Challenges Tab */}
        {activeTab === 'pinnacle' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* Pinnacles */}
            <GlassCard className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUpIcon className="w-8 h-8 text-blue-600" />
                <h2 className="text-2xl font-bold">Pinnacles</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Pinnacles represent the four major cycles of achievement and opportunity in your life.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pinnacles.map((pinnacle, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <GlassCard variant="elevated" className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold">{pinnacle.title}</h3>
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                          {pinnacle.number}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        Ages: {pinnacle.period}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {getPinnacleDescription(pinnacle.number)}
                      </p>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            </GlassCard>

            {/* Challenges */}
            <GlassCard className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <AlertCircleIcon className="w-8 h-8 text-amber-600" />
                <h2 className="text-2xl font-bold">Challenges</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Challenges represent the obstacles and lessons you&apos;ll face during each life cycle.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {challenges.map((challenge, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <GlassCard variant="elevated" className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold">{challenge.title}</h3>
                        <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                          {challenge.number}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        Ages: {challenge.period}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {getChallengeDescription(challenge.number)}
                      </p>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Back to Dashboard */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <GlassButton
            variant="secondary"
            onClick={() => router.push('/dashboard')}
            icon={<BookOpenIcon className="w-4 h-4" />}
          >
            Back to Dashboard
          </GlassButton>
        </motion.div>
      </div>
    </PageLayout>
  );
}

