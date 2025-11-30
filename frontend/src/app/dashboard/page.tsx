'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Calendar, 
  MessageCircle, 
  User, 
  Star,
  Heart,
  TrendingUp,
  Users,
  ShieldCheck,
  LogOut,
  Settings,
  Activity,
  Zap
} from 'lucide-react';
import { GlassCard } from '@/components/glassmorphism/glass-card';
import { GlassButton } from '@/components/glassmorphism/glass-button';
import { DashboardWidget } from '@/components/dashboard/dashboard-widget';
import { InsightsPanel } from '@/components/dashboard/insights-panel';
import { CoPilotWidget } from '@/components/co-pilot/co-pilot-widget';
import { SmartCalendar } from '@/components/calendar/smart-calendar';
import { dashboardAPI, numerologyAPI, DashboardOverview, DailyReading, NumerologyProfile } from '@/lib/numerology-api';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardOverview | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      loadDashboard();
    }
  }, [user, loading, router]);

  const loadDashboard = async () => {
    try {
      setDashboardLoading(true);
      const data = await dashboardAPI.getOverview();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setDashboardLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (loading || dashboardLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !dashboardData) {
    return null;
  }

  const dailyReading = dashboardData.daily_reading;
  const numerologyProfile = dashboardData.numerology_profile;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            >
              Welcome back, {user.full_name}!
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-gray-600 dark:text-gray-400 mt-2"
            >
              {user.email || user.phone}
            </motion.p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <GlassButton 
              variant="secondary" 
              onClick={() => router.push('/profile')}
              icon={<Settings className="w-5 h-5" />}
            >
              Settings
            </GlassButton>
            <GlassButton 
              variant="secondary" 
              onClick={handleLogout}
              disabled={isLoggingOut}
              icon={<LogOut className="w-5 h-5" />}
            >
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </GlassButton>
          </motion.div>
        </div>

        {/* Today&apos;s Focus - Daily Reading */}
        {dailyReading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <DashboardWidget
              title="Today&apos;s Numerology Focus"
              icon={<Zap className="w-6 h-6" />}
              color="from-purple-500 to-pink-600"
              onClick={() => router.push('/daily-reading')}
            >
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                    {dailyReading.personal_day_number}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Personal Day Number
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(dailyReading.reading_date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Today&apos;s Affirmation
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                    &ldquo;{dailyReading.affirmation}&rdquo;
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Lucky Number: </span>
                    <span className="font-semibold text-gray-900 dark:text-white">{dailyReading.lucky_number}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Color: </span>
                    <span className="font-semibold text-gray-900 dark:text-white">{dailyReading.lucky_color}</span>
                  </div>
                </div>
              </div>
            </DashboardWidget>
          </motion.div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column - Insights & Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* AI Co-Pilot Widget */}
            <CoPilotWidget compact={false} />
            
            {/* Insights Panel */}
            <InsightsPanel />

            {/* Quick Actions */}
            <DashboardWidget
              title="Quick Actions"
              icon={<Zap className="w-6 h-6" />}
              color="from-blue-500 to-cyan-600"
            >
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/birth-chart')}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-3"
                >
                  <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">View Birth Chart</span>
                </button>
                <button
                  onClick={() => router.push('/compatibility')}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-3"
                >
                  <Heart className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Check Compatibility</span>
                </button>
                <button
                  onClick={() => router.push('/ai-chat')}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-3"
                >
                  <MessageCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Chat with AI</span>
                </button>
                <button
                  onClick={() => router.push('/remedies')}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-3"
                >
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">View Remedies</span>
                </button>
              </div>
            </DashboardWidget>
          </div>

          {/* Right Column - Main Features */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <GlassCard variant="elevated" className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Account Status</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {user.is_verified ? 'Verified' : 'Not Verified'}
                    </p>
                  </div>
                </div>
              </GlassCard>
              
              <GlassCard variant="elevated" className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Subscription</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {user.subscription_plan 
                        ? user.subscription_plan.charAt(0).toUpperCase() + user.subscription_plan.slice(1)
                        : 'Free'}
                    </p>
                  </div>
                </div>
              </GlassCard>

              {numerologyProfile && (
                <GlassCard variant="elevated" className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-pink-500 to-red-600 flex items-center justify-center">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">Life Path</p>
                      <p className="font-semibold text-gray-900 dark:text-white text-2xl">
                        {numerologyProfile.life_path_number}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              )}

              <GlassCard variant="elevated" className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-green-500 to-teal-600 flex items-center justify-center">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Total Readings</p>
                    <p className="font-semibold text-gray-900 dark:text-white text-2xl">
                      {dashboardData.stats.total_readings}
                    </p>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Features Grid */}
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Your Numerology Tools</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  {
                    title: "Birth Chart",
                    description: "View your numerology profile",
                    icon: <Sparkles className="w-6 h-6" />,
                    path: "/birth-chart",
                    color: "from-blue-500 to-purple-600"
                  },
                  {
                    title: "Daily Reading",
                    description: "Your personalized guidance",
                    icon: <Calendar className="w-6 h-6" />,
                    path: "/daily-reading",
                    color: "from-purple-500 to-pink-600"
                  },
                  {
                    title: "AI Numerologist",
                    description: "Chat with our AI expert",
                    icon: <MessageCircle className="w-6 h-6" />,
                    path: "/ai-chat",
                    color: "from-pink-500 to-red-600"
                  },
                  {
                    title: "Life Path Analysis",
                    description: "Deep dive into your purpose",
                    icon: <Star className="w-6 h-6" />,
                    path: "/life-path",
                    color: "from-indigo-500 to-purple-600"
                  },
                  {
                    title: "Compatibility Checker",
                    description: "Analyze relationships",
                    icon: <Heart className="w-6 h-6" />,
                    path: "/compatibility",
                    color: "from-red-500 to-pink-600"
                  },
                  {
                    title: "Personalized Remedies",
                    description: "Custom recommendations",
                    icon: <TrendingUp className="w-6 h-6" />,
                    path: "/remedies",
                    color: "from-green-500 to-teal-600"
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <DashboardWidget
                      title={feature.title}
                      icon={feature.icon}
                      color={feature.color}
                      onClick={() => router.push(feature.path)}
                    >
                      <p className="text-sm">{feature.description}</p>
                    </DashboardWidget>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        {dashboardData.recent_activities && dashboardData.recent_activities.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8"
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Recent Activity</h2>
            <GlassCard variant="default" className="p-6">
              <div className="space-y-4">
                {dashboardData.recent_activities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {activity.activity_type_display}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(activity.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </div>
  );
}
