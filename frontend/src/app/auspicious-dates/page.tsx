'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { numerologyAPI } from '@/lib/numerology-api';
import { PageLayout } from '@/components/ui/page-layout';
import { GlassCard } from '@/components/glassmorphism/glass-card';
import { GlassButton } from '@/components/glassmorphism/glass-button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAuth } from '@/contexts/auth-context';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { SubscriptionGate } from '@/components/SubscriptionGate';
import { motion } from 'framer-motion';
import { Calendar, StarIcon, SparklesIcon, ClockIcon, TargetIcon, AlertCircleIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';

interface AuspiciousDate {
  date: string;
  personal_day_number: number;
  activity_type: string;
  reasoning: string;
  score: number;
}

export default function AuspiciousDatesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { tier } = useSubscription();
  const [dates, setDates] = useState<AuspiciousDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activityType, setActivityType] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState<string>(format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'));

  const fetchAuspiciousDates = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await numerologyAPI.getAuspiciousDates({
        activity_type: activityType || undefined,
        start_date: startDate,
        end_date: endDate,
      });
      // getAuspiciousDates always returns an array
      setDates(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Failed to fetch auspicious dates:', error);
      toast.error(error.response?.data?.error || 'Failed to load auspicious dates');
      setDates([]);
    } finally {
      setLoading(false);
    }
  }, [user, activityType, startDate, endDate]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchAuspiciousDates();
  }, [user, router, fetchAuspiciousDates]);

  const activityTypes = [
    { value: '', label: 'All Activities' },
    { value: 'business', label: 'Business & Career' },
    { value: 'romance', label: 'Romance & Relationships' },
    { value: 'health', label: 'Health & Wellness' },
    { value: 'travel', label: 'Travel & Adventure' },
    { value: 'education', label: 'Education & Learning' },
    { value: 'financial', label: 'Financial Decisions' },
    { value: 'creative', label: 'Creative Projects' },
  ];

  return (
    <SubscriptionGate feature="auspicious-dates" requiredTier="premium">
      <PageLayout>
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <motion.div
                className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <StarIcon className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Auspicious Dates
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Discover the perfect timing for your important activities
                </p>
              </div>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <GlassCard className="p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Activity Type
                  </label>
                  <select
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value)}
                    className="w-full px-4 py-2 bg-white/50 dark:bg-white/10 backdrop-blur-xl border border-gray-300 dark:border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                  >
                    {activityTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2 bg-white/50 dark:bg-white/10 backdrop-blur-xl border border-gray-300 dark:border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2 bg-white/50 dark:bg-white/10 backdrop-blur-xl border border-gray-300 dark:border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex items-end">
                  <GlassButton
                    variant="liquid"
                    onClick={fetchAuspiciousDates}
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'Search Dates'}
                  </GlassButton>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Results */}
          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <LoadingSpinner size="lg" message="Finding auspicious dates..." />
            </div>
          ) : dates.length === 0 ? (
            <GlassCard className="p-8 text-center">
              <AlertCircleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                No Auspicious Dates Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your filters or date range to find more dates.
              </p>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {dates.map((date, index) => (
                <motion.div
                  key={date.date}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GlassCard className="p-6 hover:scale-105 transition-transform">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-5 h-5 text-purple-600" />
                          <span className="font-bold text-lg text-gray-900 dark:text-white">
                            {format(parseISO(date.date), 'MMM dd, yyyy')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <SparklesIcon className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Personal Day {date.personal_day_number}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600">
                          {date.score || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">Score</div>
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TargetIcon className="w-4 h-4 text-blue-500" />
                        <span className="font-semibold text-gray-900 dark:text-white capitalize">
                          {date.activity_type ? date.activity_type.replace('_', ' ') : 'General Activity'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                        {date.reasoning}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <ClockIcon className="w-4 h-4" />
                      <span>Optimal timing for this activity</span>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </PageLayout>
    </SubscriptionGate>
  );
}

