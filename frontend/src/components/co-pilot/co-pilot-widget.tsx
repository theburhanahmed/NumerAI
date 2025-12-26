'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, Sparkles, X, ChevronRight, Lightbulb } from 'lucide-react';
import { GlassCard } from '@/components/glassmorphism/glass-card';
import { GlassButton } from '@/components/glassmorphism/glass-button';
import { dashboardAPI, numerologyAPI } from '@/lib/numerology-api';
import { useRouter } from 'next/navigation';

interface CoPilotWidgetProps {
  className?: string;
  compact?: boolean;
}

export function CoPilotWidget({ className = '', compact = false }: CoPilotWidgetProps) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(!compact);
  const router = useRouter();

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      const data = await dashboardAPI.getInsights(5, true);
      setSuggestions(data);
    } catch (error) {
      console.error('Failed to load Co-Pilot suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    if (suggestion.action_url) {
      router.push(suggestion.action_url);
    }
  };

  if (compact && !isExpanded) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`fixed bottom-6 right-6 z-50 ${className}`}
      >
        <button
          onClick={() => setIsExpanded(true)}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
        >
          <Bot className="w-6 h-6" />
        </button>
      </motion.div>
    );
  }

  return (
    <GlassCard variant="default" className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI Co-Pilot
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Your numerology assistant
            </p>
          </div>
        </div>
        {compact && (
          <button
            onClick={() => setIsExpanded(false)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
        </div>
      ) : suggestions.length === 0 ? (
        <div className="text-center py-4">
          <Lightbulb className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No suggestions at the moment. Check back later!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {suggestions.slice(0, 3).map((suggestion) => (
            <motion.div
              key={suggestion.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-3 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors cursor-pointer"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                    {suggestion.title}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                    {suggestion.content}
                  </p>
                  {suggestion.action_text && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-indigo-600 dark:text-indigo-400">
                      <span>{suggestion.action_text}</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <GlassButton
          variant="secondary"
          onClick={() => router.push('/ai-chat')}
          className="w-full"
        >
          Chat with AI
        </GlassButton>
      </div>
    </GlassCard>
  );
}

