'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Star, Zap } from 'lucide-react';
import { GlassCard } from '@/components/glassmorphism/glass-card';
import { calendarAPI, DateInsight } from '@/lib/numerology-api';

interface DateInsightCardProps {
  date?: Date;
  className?: string;
}

export function DateInsightCard({ date, className = '' }: DateInsightCardProps) {
  const [insight, setInsight] = useState<DateInsight | null>(null);
  const [loading, setLoading] = useState(false);

  const loadInsight = useCallback(async () => {
    if (!date) return;
    try {
      setLoading(true);
      const dateStr = date.toISOString().split('T')[0];
      const data = await calendarAPI.getDateInsight(dateStr);
      setInsight(data);
    } catch (error) {
      console.error('Failed to load date insight:', error);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    if (date) {
      loadInsight();
    }
  }, [date, loadInsight]);

  if (loading) {
    return (
      <GlassCard variant="default" className={`p-6 ${className}`}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </GlassCard>
    );
  }

  if (!insight) {
    return null;
  }

  return (
    <GlassCard variant="default" className={`p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Numerology Insight
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {insight.date}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Day</p>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {insight.personal_day_number}
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Year</p>
            <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
              {insight.personal_year_number}
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-pink-50 dark:bg-pink-900/20">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Month</p>
            <p className="text-xl font-bold text-pink-600 dark:text-pink-400">
              {insight.personal_month_number}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800">
          <div className="flex items-start gap-2">
            <Star className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {insight.insight}
            </p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

