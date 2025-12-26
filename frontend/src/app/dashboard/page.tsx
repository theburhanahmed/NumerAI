'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { UserIcon, MessageSquareIcon, HeartIcon, BookOpenIcon, SparklesIcon, StarIcon, TrendingUpIcon, Users2Icon, CalendarIcon, ArrowRightIcon } from 'lucide-react';
import { AccessibleSpaceBackground } from '@/components/space/accessible-space-background';
import { SpaceCard } from '@/components/space/space-card';
import { SpaceButton } from '@/components/space/space-button';
import { TouchOptimizedButton } from '@/components/buttons/touch-optimized-button';
import { CosmicSkeletonLoader } from '@/components/cosmic/cosmic-skeleton-loader';
import { CosmicTooltip } from '@/components/cosmic/cosmic-tooltip';
import { FeatureHighlight } from '@/components/features/feature-highlight';
import { InteractiveTour } from '@/components/tours/interactive-tour';
import { CrystalNumerologyCube } from '@/components/3d/crystal-numerology-cube';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { useIsMobile } from '@/hooks/use-media-query';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useAIChat } from '@/contexts/ai-chat-context';
import { OnboardingModal } from '@/components/OnboardingModal';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useAuth } from '@/contexts/auth-context';
import { numerologyAPI, ChaldeanAnalysis, ZodiacNumerologyProfile, DetailedLoShuGrid } from '@/lib/numerology-api';
import { userAPI } from '@/lib/api-client';
import { toast } from 'sonner';
import { CosmicNavbar } from '@/components/navigation/cosmic-navbar';
import { ChaldeanInsightsCard } from '@/components/numerology/ChaldeanInsightsCard';
import { ZodiacPlanetCard } from '@/components/numerology/ZodiacPlanetCard';
import { LoShuGridVisualization } from '@/components/numerology/LoShuGridVisualization';

interface UserProfile {
  full_name?: string;
  date_of_birth?: string;
  email?: string;
}

export default function Dashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { isOnboardingComplete } = useOnboarding();
  const { openChat } = useAIChat();
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [statsRef, statsVisible] = useIntersectionObserver({
    threshold: 0.1,
  });
  const [hasSeenTour, setHasSeenTour] = useLocalStorage(
    'hasSeenDashboardTour',
    false,
  );
  const [showTour, setShowTour] = useState(false);

  // Update showOnboarding when isOnboardingComplete changes
  useEffect(() => {
    if (isOnboardingComplete) {
      setShowOnboarding(false);
    }
  }, [isOnboardingComplete]);

  // Show tour for first-time dashboard visitors
  useEffect(() => {
    if (!hasSeenTour) {
      const timer = setTimeout(() => setShowTour(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [hasSeenTour]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [numerologyProfile, setNumerologyProfile] = useState<any>(null);
  const [dailyReading, setDailyReading] = useState<any>(null);
  const [weeklyReport, setWeeklyReport] = useState<any>(null);
  const [chaldeanAnalysis, setChaldeanAnalysis] = useState<ChaldeanAnalysis | null>(null);
  const [zodiacNumerology, setZodiacNumerology] = useState<ZodiacNumerologyProfile | null>(null);
  const [detailedLoShuGrid, setDetailedLoShuGrid] = useState<DetailedLoShuGrid | null>(null);
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

        // Fetch Chaldean Analysis (DivineAPI-style)
        try {
          const chaldean = await numerologyAPI.getChaldeanAnalysis();
          setChaldeanAnalysis(chaldean);
        } catch (error) {
          console.error('Failed to fetch Chaldean analysis:', error);
        }

        // Fetch Zodiac Numerology (DivineAPI-style)
        try {
          const zodiac = await numerologyAPI.getZodiacNumerology();
          setZodiacNumerology(zodiac);
        } catch (error) {
          console.error('Failed to fetch zodiac numerology:', error);
        }

        // Fetch Detailed Lo Shu Grid (DivineAPI-style)
        try {
          const loShu = await numerologyAPI.getDetailedLoShuGrid();
          setDetailedLoShuGrid(loShu);
        } catch (error) {
          console.error('Failed to fetch detailed Lo Shu grid:', error);
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
  const tourSteps = [
    {
      target: 'dashboard',
      title: 'Welcome to Your Dashboard',
      content:
        'This is your cosmic command center. Access all your numerology insights from here.',
    },
    {
      target: 'numbers',
      title: 'Your Core Numbers',
      content:
        'These crystal cubes represent your Life Path, Destiny, Soul Urge, and Personality numbers.',
    },
    {
      target: 'actions',
      title: 'Quick Actions',
      content:
        'Use these shortcuts to access AI chat, daily readings, compatibility checks, and more.',
    },
  ];

  const quickActions = [
    {
      icon: <MessageSquareIcon className="w-6 h-6" />,
      title: 'AI Numerologist',
      description: 'Chat with AI for instant insights',
      action: openChat,
      color: 'from-cyan-400 to-blue-600',
      tooltip: 'Get personalized numerology guidance 24/7',
    },
    {
      icon: <CalendarIcon className="w-6 h-6" />,
      title: 'Daily Reading',
      description: 'Your cosmic guidance for today',
      action: () => router.push('/daily-reading'),
      color: 'from-purple-500 to-pink-600',
      tooltip: 'Discover what the numbers reveal for today',
    },
    {
      icon: <HeartIcon className="w-6 h-6" />,
      title: 'Compatibility',
      description: 'Check relationship compatibility',
      action: () => router.push('/compatibility'),
      color: 'from-pink-500 to-rose-600',
      tooltip: 'Analyze cosmic connections with others',
    },
    {
      icon: <TrendingUpIcon className="w-6 h-6" />,
      title: 'Life Path',
      description: 'Explore your life journey',
      action: () => router.push('/life-path'),
      color: 'from-green-500 to-emerald-600',
      tooltip: "Understand your life's purpose and direction",
    },
  ];

  const coreNumbers = numerologyProfile
    ? [
        {
          number: numerologyProfile.life_path_number || 0,
          label: 'Life Path',
          color: 'cyan' as const,
        },
        {
          number: numerologyProfile.destiny_number || 0,
          label: 'Destiny',
          color: 'purple' as const,
        },
        {
          number: numerologyProfile.soul_urge_number || 0,
          label: 'Soul Urge',
          color: 'blue' as const,
        },
        {
          number: numerologyProfile.personality_number || 0,
          label: 'Personality',
          color: 'pink' as const,
        },
      ].filter((item) => item.number > 0)
    : [];

  if (isLoading) {
    return (
      <div className="relative min-h-screen">
        <AccessibleSpaceBackground />
        <div className="flex items-center justify-center min-h-screen">
          <CosmicSkeletonLoader variant="card" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <AccessibleSpaceBackground />
      <CosmicNavbar />
      {showOnboarding && <OnboardingModal />}
      {showTour && (
        <InteractiveTour
          steps={tourSteps}
          onComplete={() => {
            setHasSeenTour(true);
            setShowTour(false);
          }}
          onSkip={() => {
            setHasSeenTour(true);
            setShowTour(false);
          }}
        />
      )}

      {/* Main Content - Added pt-28 to prevent navbar overlap */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 pt-28">
        {/* Welcome Section */}
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-['Playfair_Display'] font-bold text-white mb-2">
                Welcome Back, {getUserName()}
              </h1>
              <p className="text-white/70">Your cosmic dashboard awaits</p>
            </div>
            <div className="flex gap-3">
              <CosmicTooltip content="View your complete numerology profile">
                <TouchOptimizedButton
                  variant="secondary"
                  onClick={() => router.push('/numerology-report')}
                  ariaLabel="View full report"
                >
                  View Full Report
                </TouchOptimizedButton>
              </CosmicTooltip>
            </div>
          </div>
        </motion.div>

        {/* Core Numbers - with lazy loading */}
        <motion.div
          ref={statsRef}
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
          id="numbers"
        >
          <SpaceCard variant="premium" className="p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-['Playfair_Display'] font-bold text-white">
                Your Core Numbers
              </h2>
              <CosmicTooltip
                content="These numbers define your cosmic blueprint"
                icon
              />
            </div>

            {statsVisible && coreNumbers.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {coreNumbers.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{
                      opacity: 0,
                      scale: 0.9,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                    }}
                    transition={{
                      delay: 0.2 + index * 0.1,
                    }}
                    className="flex flex-col items-center"
                  >
                    <CrystalNumerologyCube
                      number={item.number}
                      size={isMobile ? 'sm' : 'md'}
                      color={item.color}
                    />
                    <p className="text-sm font-semibold text-white mt-3">
                      {item.label}
                    </p>
                  </motion.div>
                ))}
              </div>
            ) : numerologyProfile ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <CosmicSkeletonLoader variant="cube" count={4} />
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-white/80 mb-4">
                  Your numerology profile is not available yet. Calculate it to
                  see your numbers and unlock personalized insights.
                </p>
                <SpaceButton
                  variant="primary"
                  onClick={() => router.push('/numerology-report')}
                >
                  Calculate My Profile
                </SpaceButton>
              </div>
            )}
          </SpaceCard>
        </motion.div>

        {/* Featured: AI Chat */}
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
          <FeatureHighlight
            title="New: AI Numerologist Chat"
            description="Get instant answers to your numerology questions"
            badge="NEW"
          >
            <TouchOptimizedButton
              variant="primary"
              onClick={openChat}
              icon={<ArrowRightIcon className="w-5 h-5" />}
              ariaLabel="Start AI chat"
            >
              Start Chatting
            </TouchOptimizedButton>
          </FeatureHighlight>
        </motion.div>

        {/* Quick Actions */}
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
            delay: 0.3,
          }}
          id="actions"
        >
          <h2 className="text-2xl font-['Playfair_Display'] font-bold text-white mb-6">
            Quick Actions
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.4 + index * 0.1,
                }}
                whileHover={{
                  y: -4,
                }}
              >
                <SpaceCard
                  variant="default"
                  className="p-6 cursor-pointer group h-full"
                  onClick={action.action}
                  role="button"
                  tabIndex={0}
                  aria-label={action.title}
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform shadow-lg`}
                  >
                    {action.icon}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-white">{action.title}</h3>
                    <CosmicTooltip
                      content={action.tooltip}
                      icon
                      position="top"
                    />
                  </div>
                  <p className="text-sm text-white/70">{action.description}</p>
                </SpaceCard>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Today's Reading */}
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
          className="mt-8"
        >
          <SpaceCard variant="premium" className="p-6 md:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h3 className="text-xl md:text-2xl font-['Playfair_Display'] font-bold text-white">
                Today&apos;s Reading
              </h3>
              <motion.div
                className="px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 backdrop-blur-xl rounded-full border border-cyan-500/30"
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                <span className="text-xs md:text-sm font-semibold text-cyan-400">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </motion.div>
            </div>
            {dailyReading ? (
              <>
                <SpaceCard variant="default" className="p-5 md:p-6 mb-4 md:mb-6">
                  <div className="flex items-center gap-3 md:gap-4 mb-4">
                    <motion.div
                      className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl md:text-2xl shadow-xl"
                      animate={{
                        rotate: [0, 5, -5, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                    >
                      {dailyReading.personal_day_number || '-'}
                    </motion.div>
                    <div>
                      <p className="font-semibold text-base md:text-lg text-white">
                        Personal Day Number
                      </p>
                      {dailyReading.activity_recommendation && (
                        <p className="text-xs md:text-sm text-white/60">
                          {dailyReading.activity_recommendation.substring(0, 30)}
                          ...
                        </p>
                      )}
                    </div>
                  </div>
                  {dailyReading.actionable_tip && (
                    <p className="text-sm md:text-base text-white/80 leading-relaxed">
                      {dailyReading.actionable_tip}
                    </p>
                  )}
                </SpaceCard>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <SpaceCard variant="default" className="p-4">
                    <p className="text-xs md:text-sm font-semibold text-white/60 mb-2">
                      Lucky Number
                    </p>
                    <motion.p
                      className="text-3xl md:text-4xl font-bold text-cyan-400"
                      animate={{
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                      }}
                    >
                      {dailyReading.lucky_number || '-'}
                    </motion.p>
                  </SpaceCard>
                  <SpaceCard variant="default" className="p-4">
                    <p className="text-xs md:text-sm font-semibold text-white/60 mb-2">
                      Lucky Color
                    </p>
                    <div className="flex items-center gap-3">
                      <motion.div
                        className={`w-10 h-10 bg-gradient-to-r ${getLuckyColorStyle(dailyReading.lucky_color)} rounded-full shadow-lg`}
                        animate={{
                          rotate: 360,
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                      ></motion.div>
                      <p className="text-base md:text-lg font-semibold text-white capitalize">
                        {dailyReading.lucky_color || 'N/A'}
                      </p>
                    </div>
                  </SpaceCard>
                </div>
              </>
            ) : (
              <SpaceCard variant="default" className="p-5 md:p-6 mb-4 md:mb-6 text-center">
                <p className="text-white/70 mb-4">
                  {dataLoading
                    ? 'Loading your daily reading...'
                    : 'Your daily reading is not available yet. Calculate your numerology profile first to get personalized daily insights.'}
                </p>
                {!dataLoading && (
                  <SpaceButton
                    variant="primary"
                    size="sm"
                    onClick={() => router.push('/numerology-report')}
                  >
                    Calculate Profile
                  </SpaceButton>
                )}
              </SpaceCard>
            )}
          </SpaceCard>
        </motion.div>

        {/* DivineAPI-Style Insights Section */}
        {numerologyProfile && (chaldeanAnalysis || zodiacNumerology || detailedLoShuGrid) && (
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
            className="mt-8"
          >
            <h2 className="text-2xl font-['Playfair_Display'] font-bold text-white mb-6">
              Deep Numerology Insights
            </h2>
            
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Chaldean Insights Card */}
              {chaldeanAnalysis && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <ChaldeanInsightsCard data={chaldeanAnalysis} />
                </motion.div>
              )}

              {/* Zodiac Planet Card */}
              {zodiacNumerology && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <ZodiacPlanetCard data={zodiacNumerology} />
                </motion.div>
              )}
            </div>

            {/* Enhanced Lo Shu Grid */}
            {detailedLoShuGrid && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-6"
              >
                <LoShuGridVisualization 
                  gridData={detailedLoShuGrid} 
                  onUpgrade={() => router.push('/pricing')}
                />
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}