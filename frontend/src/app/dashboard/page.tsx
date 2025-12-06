'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { UserIcon, MessageSquareIcon, HeartIcon, BookOpenIcon, SparklesIcon, StarIcon, TrendingUpIcon } from 'lucide-react';
import { PageLayout } from '@/components/ui/page-layout';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { OnboardingModal } from '@/components/OnboardingModal';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useAuth } from '@/contexts/auth-context';
import { numerologyAPI } from '@/lib/numerology-api';
import { userAPI } from '@/lib/api-client';
import { toast } from 'sonner';

interface UserProfile {
  full_name?: string;
  date_of_birth?: string;
  email?: string;
}

export default function Dashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { isOnboardingComplete } = useOnboarding();
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Update showOnboarding when isOnboardingComplete changes
  useEffect(() => {
    if (isOnboardingComplete) {
      setShowOnboarding(false);
    }
  }, [isOnboardingComplete]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [numerologyProfile, setNumerologyProfile] = useState<any>(null);
  const [dailyReading, setDailyReading] = useState<any>(null);
  const [weeklyReport, setWeeklyReport] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=${encodeURIComponent('/dashboard')}`);
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setDataLoading(true);
        
        // Fetch user profile
        try {
          const profileResponse = await userAPI.getProfile();
          const profileData = profileResponse.data?.user || profileResponse.data;
          setUserProfile(profileData || {});
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
        }

        // Fetch numerology profile
        try {
          const numerologyData = await numerologyAPI.getProfile();
          setNumerologyProfile(numerologyData);
        } catch (error) {
          console.error('Failed to fetch numerology profile:', error);
        }

        // Fetch today's daily reading
        try {
          const today = new Date().toISOString().split('T')[0];
          const reading = await numerologyAPI.getDailyReading(today);
          setDailyReading(reading);
        } catch (error) {
          console.error('Failed to fetch daily reading:', error);
        }

        // Fetch weekly report
        try {
          const weekStart = new Date();
          const daysSinceSunday = weekStart.getDay();
          weekStart.setDate(weekStart.getDate() - daysSinceSunday);
          const weekStartStr = weekStart.toISOString().split('T')[0];
          const weekly = await numerologyAPI.getWeeklyReport(weekStartStr);
          setWeeklyReport(weekly);
        } catch (error: any) {
          const errorMessage = error?.response?.data?.error || error?.response?.data?.message || error?.message || 'Failed to fetch weekly report';
          console.error('Failed to fetch weekly report:', errorMessage, error);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setDataLoading(false);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  useEffect(() => {
    if (!isLoading && !dataLoading) {
      // Check if user needs onboarding
      if (user && !user.hasCompletedOnboarding && !isOnboardingComplete) {
        setShowOnboarding(true);
      } else if (user && userProfile) {
        const userName = userProfile.full_name || user.full_name || 'there';
        toast.success(`Welcome back, ${userName.split(' ')[0]}!`, {
          description: dailyReading ? 'Your daily reading is ready' : 'Welcome to your dashboard'
        });
      }
    }
  }, [isLoading, dataLoading, user, userProfile, dailyReading, isOnboardingComplete]);

  const formatBirthDate = (dateStr?: string) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    } catch {
      return null;
    }
  };

  const getUserName = () => {
    if (userProfile?.full_name) return userProfile.full_name.split(' ')[0];
    if (user?.full_name) return user.full_name.split(' ')[0];
    return 'there';
  };

  const getLuckyColorStyle = (color?: string) => {
    if (!color) return 'from-yellow-400 to-amber-500';
    const colorMap: Record<string, string> = {
      'red': 'from-red-400 to-red-600',
      'blue': 'from-blue-400 to-blue-600',
      'green': 'from-green-400 to-green-600',
      'yellow': 'from-yellow-400 to-yellow-600',
      'purple': 'from-purple-400 to-purple-600',
      'pink': 'from-pink-400 to-pink-600',
      'orange': 'from-orange-400 to-orange-600',
      'gold': 'from-yellow-400 to-amber-500',
      'silver': 'from-gray-300 to-gray-500',
      'white': 'from-gray-100 to-gray-300',
      'black': 'from-gray-700 to-gray-900',
    };
    return colorMap[color.toLowerCase()] || 'from-yellow-400 to-amber-500';
  };
  if (isLoading) {
    return <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" message="Loading your dashboard..." />
        </div>
      </PageLayout>;
  }
  return <PageLayout>
      {showOnboarding && <OnboardingModal />}

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Profile Hero Card */}
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.1
          }}>
              <GlassCard variant="elevated" className="p-6 md:p-8 bg-gradient-to-br from-blue-500/90 to-purple-600/90 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="relative z-10">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3 md:gap-4">
                      <motion.div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center border border-white/30" whileHover={{
                      scale: 1.1,
                      rotate: 5
                    }}>
                        <UserIcon className="w-8 h-8 md:w-10 md:h-10" />
                      </motion.div>
                      <div>
                        <motion.h2 className="text-2xl md:text-3xl font-bold mb-1" initial={{
                        opacity: 0,
                        x: -20
                      }} animate={{
                        opacity: 1,
                        x: 0
                      }} transition={{
                        delay: 0.2
                      }}>
                          Welcome, {getUserName()}
                        </motion.h2>
                        {userProfile?.date_of_birth && (
                          <p className="text-white/80 text-sm md:text-base">
                            Born: {formatBirthDate(userProfile.date_of_birth)}
                          </p>
                        )}
                      </div>
                    </div>
                    <GlassButton variant="secondary" size="sm" onClick={() => router.push('/profile')}>
                      Edit Profile
                    </GlassButton>
                  </div>
                  {numerologyProfile ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                      <AnimatedNumber number={numerologyProfile.life_path_number?.toString() || '-'} label="Life Path" delay={0.3} />
                      <AnimatedNumber number={numerologyProfile.destiny_number?.toString() || '-'} label="Destiny" delay={0.4} />
                      <AnimatedNumber number={numerologyProfile.soul_urge_number?.toString() || '-'} label="Soul Urge" delay={0.5} />
                      <AnimatedNumber number={numerologyProfile.personality_number?.toString() || '-'} label="Personality" delay={0.6} />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                      <div className="text-center">
                        <p className="text-white/60 text-sm">Calculate your profile to see your numbers</p>
                      </div>
                    </div>
                  )}
                </div>
              </GlassCard>
            </motion.div>

            {/* Today's Reading */}
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.2
          }}>
              <GlassCard variant="elevated" className="p-6 md:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Today&apos;s Reading
                  </h3>
                  <motion.div className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-600/20 backdrop-blur-xl rounded-full border border-blue-500/30" animate={{
                  scale: [1, 1.05, 1]
                }} transition={{
                  duration: 2,
                  repeat: Infinity
                }}>
                    <span className="text-xs md:text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {new Date().toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric'
                    })}
                    </span>
                  </motion.div>
                </div>
                {dailyReading ? (
                  <>
                    <GlassCard variant="subtle" className="p-5 md:p-6 mb-4 md:mb-6">
                      <div className="flex items-center gap-3 md:gap-4 mb-4">
                        <motion.div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl md:text-2xl shadow-xl" animate={{
                        rotate: [0, 5, -5, 0]
                      }} transition={{
                        duration: 2,
                        repeat: Infinity
                      }}>
                          {dailyReading.personal_day_number || '-'}
                        </motion.div>
                        <div>
                          <p className="font-semibold text-base md:text-lg text-gray-900 dark:text-white">
                            Personal Day Number
                          </p>
                          {dailyReading.activity_recommendation && (
                            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                              {dailyReading.activity_recommendation.substring(0, 30)}...
                            </p>
                          )}
                        </div>
                      </div>
                      {dailyReading.actionable_tip && (
                        <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                          {dailyReading.actionable_tip}
                        </p>
                      )}
                    </GlassCard>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                      <GlassCard variant="subtle" className="p-4">
                        <p className="text-xs md:text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                          Lucky Number
                        </p>
                        <motion.p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent" animate={{
                        scale: [1, 1.1, 1]
                      }} transition={{
                        duration: 1.5,
                        repeat: Infinity
                      }}>
                          {dailyReading.lucky_number || '-'}
                        </motion.p>
                      </GlassCard>
                      <GlassCard variant="subtle" className="p-4">
                        <p className="text-xs md:text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                          Lucky Color
                        </p>
                        <div className="flex items-center gap-3">
                          <motion.div className={`w-10 h-10 bg-gradient-to-r ${getLuckyColorStyle(dailyReading.lucky_color)} rounded-full shadow-lg`} animate={{
                          rotate: 360
                        }} transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: 'linear'
                        }}></motion.div>
                          <p className="text-base md:text-lg font-semibold text-gray-900 dark:text-white capitalize">
                            {dailyReading.lucky_color || 'N/A'}
                          </p>
                        </div>
                      </GlassCard>
                    </div>
                  </>
                ) : (
                  <GlassCard variant="subtle" className="p-5 md:p-6 mb-4 md:mb-6">
                    <p className="text-center text-gray-600 dark:text-gray-400">
                      {dataLoading ? 'Loading your daily reading...' : 'No daily reading available. Calculate your profile first.'}
                    </p>
                  </GlassCard>
                )}
              </GlassCard>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-4 md:space-y-6">
            {/* Quick Actions */}
            <motion.div initial={{
            opacity: 0,
            x: 20
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            delay: 0.3
          }}>
              <GlassCard variant="elevated" className="p-5 md:p-6">
                <h3 className="text-lg md:text-xl font-bold mb-4 text-gray-900 dark:text-white">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <ActionCard icon={<MessageSquareIcon className="w-5 h-5" />} label="Ask AI Numerologist" description="Get instant answers" onClick={() => router.push('/chat')} delay={0.4} />
                  <ActionCard icon={<SparklesIcon className="w-5 h-5" />} label="Get Remedies" description="Personalized guidance" onClick={() => router.push('/remedies')} delay={0.5} />
                  <ActionCard icon={<HeartIcon className="w-5 h-5" />} label="Check Compatibility" description="Relationship insights" onClick={() => router.push('/compatibility')} delay={0.6} />
                  <ActionCard icon={<BookOpenIcon className="w-5 h-5" />} label="View Full Report" description="Complete analysis" onClick={() => router.push('/numerology-report')} delay={0.7} />
                </div>
              </GlassCard>
            </motion.div>

            {/* Insights */}
            <motion.div initial={{
            opacity: 0,
            x: 20
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            delay: 0.4
          }}>
              <GlassCard variant="elevated" className="p-5 md:p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUpIcon className="w-5 h-5 md:w-6 md:h-6 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white">
                    This Week&apos;s Insights
                  </h3>
                </div>
                {weeklyReport ? (
                  <>
                    <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                      {weeklyReport.weekly_summary || weeklyReport.main_theme || 'Your numbers suggest a strong focus on personal growth and relationships this week.'}
                    </p>
                    <GlassButton variant="primary" size="sm" className="w-full" onClick={() => router.push('/weekly-report')}>
                      Learn More
                    </GlassButton>
                  </>
                ) : (
                  <>
                    <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                      {dataLoading ? 'Loading weekly insights...' : 'Calculate your profile to see weekly insights.'}
                    </p>
                    <GlassButton variant="primary" size="sm" className="w-full" onClick={() => router.push('/weekly-report')}>
                      View Weekly Report
                    </GlassButton>
                  </>
                )}
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </div>
    </PageLayout>;
}
function ActionCard({
  icon,
  label,
  description,
  onClick,
  delay
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick?: () => void;
  delay: number;
}) {
  return <motion.button onClick={onClick} className="w-full p-4 bg-gradient-to-r from-white/50 to-white/30 dark:from-gray-800/50 dark:to-gray-800/30 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/30 text-left flex items-center gap-3 transition-all hover:shadow-xl group" initial={{
    opacity: 0,
    x: -20
  }} animate={{
    opacity: 1,
    x: 0
  }} transition={{
    delay
  }} whileHover={{
    scale: 1.02,
    x: 4
  }} whileTap={{
    scale: 0.98
  }}>
      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-shadow">
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-gray-900 dark:text-white">{label}</p>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </div>
      <StarIcon className="w-5 h-5 text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.button>;
}