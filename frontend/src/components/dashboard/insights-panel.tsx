'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, X, ChevronRight, AlertCircle, TrendingUp, Calendar, Sparkles } from 'lucide-react';
import { GlassCard } from '@/components/glassmorphism/glass-card';
import { dashboardAPI, QuickInsight } from '@/lib/numerology-api';
import { useRouter } from 'next/navigation';

interface InsightsPanelProps {
  limit?: number;
  className?: string;
}

export function InsightsPanel({ limit = 5, className = '' }: InsightsPanelProps) {
  const [insights, setInsights] = useState<QuickInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadInsights = async () => {
    try {
      setLoading(true);
      const data = await dashboardAPI.getInsights(limit, true);
      setInsights(data);
    } catch (error) {
      console.error('Failed to load insights:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMarkRead = async (insightId: string) => {
    try {
      await dashboardAPI.markInsightRead(insightId);
      setInsights(prev => prev.filter(i => i.id !== insightId));
    } catch (error) {
      console.error('Failed to mark insight as read:', error);
    }
  };

  const handleAction = (insight: QuickInsight) => {
    if (insight.action_url) {
      router.push(insight.action_url);
      handleMarkRead(insight.id);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'daily_tip':
        return <Lightbulb className="w-5 h-5" />;
      case 'cycle_reminder':
        return <Calendar className="w-5 h-5" />;
      case 'pattern_discovery':
        return <TrendingUp className="w-5 h-5" />;
      case 'alert':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'daily_tip':
        return 'from-yellow-500 to-orange-600';
      case 'cycle_reminder':
        return 'from-blue-500 to-cyan-600';
      case 'pattern_discovery':
        return 'from-purple-500 to-pink-600';
      case 'alert':
        return 'from-red-500 to-pink-600';
      default:
        return 'from-indigo-500 to-purple-600';
    }
  };

  if (loading) {
    return (
      <GlassCard variant="default" className={`p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>
      </GlassCard>
    );
  }

  if (insights.length === 0) {
    return (
      <GlassCard variant="default" className={`p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white">
            <Lightbulb className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Insights
          </h3>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          No new insights at the moment. Check back later!
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard variant="default" className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white">
            <Lightbulb className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Insights
          </h3>
          {insights.length > 0 && (
            <span className="px-2 py-1 text-xs font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full">
              {insights.length}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {insights.map((insight) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="relative group"
            >
              <div
                className={`p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gradient-to-r ${getInsightColor(insight.insight_type)}/10 hover:bg-gradient-to-r ${getInsightColor(insight.insight_type)}/20 transition-all ${
                  insight.action_url ? 'cursor-pointer' : ''
                }`}
                onClick={() => handleAction(insight)}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${getInsightColor(insight.insight_type)} flex items-center justify-center text-white flex-shrink-0`}>
                    {getInsightIcon(insight.insight_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                        {insight.title}
                      </h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkRead(insight.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {insight.content}
                    </p>
                    {insight.action_url && insight.action_text && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction(insight);
                        }}
                        className="flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                      >
                        {insight.action_text}
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </GlassCard>
  );
}

