'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  SparklesIcon, 
  StarIcon, 
  TrendingUpIcon,
  BookOpenIcon,
  LightbulbIcon
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { GlassCard } from '@/components/glassmorphism/glass-card';
import { GlassButton } from '@/components/glassmorphism/glass-button';
import { useLifePathAnalysis } from '@/lib/hooks';
import { Suspense } from 'react';

function LifePathContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { analysis, loading, error } = useLifePathAnalysis();

  if (!user) {
    if (typeof window !== 'undefined') {
      router.push('/login');
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Life Path Analysis
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Discover your core purpose and life direction
              </p>
            </div>
            
            <GlassButton 
              variant="secondary" 
              onClick={() => router.push('/dashboard')}
            >
              Back to Dashboard
            </GlassButton>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <GlassCard variant="default" className="p-12 text-center">
              <StarIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error Loading Data</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {error}
              </p>
              <GlassButton 
                variant="primary" 
                onClick={() => router.push('/dashboard')}
              >
                Back to Dashboard
              </GlassButton>
            </GlassCard>
          ) : analysis ? (
            <div className="space-y-8">
              {/* Life Path Number */}
              <GlassCard variant="elevated" className="p-8 text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl font-bold text-white">{analysis.number}</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{analysis.title}</h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  {analysis.description}
                </p>
              </GlassCard>

              {/* Key Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassCard variant="default" className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
                      <TrendingUpIcon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Strengths</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {analysis.strengths.map((strength: string, index: number) => (
                      <div 
                        key={index} 
                        className="px-4 py-2 bg-white/50 dark:bg-gray-800/50 rounded-xl text-center text-sm font-medium text-gray-900 dark:text-white"
                      >
                        {strength}
                      </div>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard variant="default" className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                      <LightbulbIcon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Challenges</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {analysis.challenges.map((challenge: string, index: number) => (
                      <div 
                        key={index} 
                        className="px-4 py-2 bg-white/50 dark:bg-gray-800/50 rounded-xl text-center text-sm font-medium text-gray-900 dark:text-white"
                      >
                        {challenge}
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </div>

              {/* Career & Relationships */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassCard variant="default" className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <TrendingUpIcon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Career Paths</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {analysis.career.map((career: string, index: number) => (
                      <span 
                        key={index} 
                        className="px-3 py-1.5 bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                      >
                        {career}
                      </span>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard variant="default" className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-red-600 rounded-xl flex items-center justify-center">
                      <SparklesIcon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Relationships</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    {analysis.relationships}
                  </p>
                </GlassCard>
              </div>

              {/* Personal Advice */}
              <GlassCard variant="elevated" className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <BookOpenIcon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Personal Advice</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {analysis.advice}
                </p>
                <GlassButton 
                  variant="primary" 
                  onClick={() => router.push('/ai-chat')}
                  icon={<SparklesIcon className="w-5 h-5" />}
                >
                  Discuss with AI Numerologist
                </GlassButton>
              </GlassCard>
            </div>
          ) : (
            <GlassCard variant="default" className="p-12 text-center">
              <StarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Data Available</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We couldn&apos;t find your life path analysis. Please ensure your birth details are complete.
              </p>
              <GlassButton 
                variant="primary" 
                onClick={() => router.push('/birth-chart')}
              >
                Generate Birth Chart
              </GlassButton>
            </GlassCard>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function LifePathAnalysisPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LifePathContent />
    </Suspense>
  );
}