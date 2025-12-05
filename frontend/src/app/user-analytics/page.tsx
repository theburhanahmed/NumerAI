'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUpIcon, TargetIcon, AwardIcon, ClockIcon, BarChart3Icon, CalendarIcon, CheckCircleIcon, StarIcon, ZapIcon, TrophyIcon, SparklesIcon } from 'lucide-react';
import { AppNavbar } from '@/components/navigation/app-navbar';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { FloatingOrbs } from '@/components/ui/floating-orbs';
import { AmbientParticles } from '@/components/ui/ambient-particles';
import { MagneticCard } from '@/components/ui/magnetic-card';
import { AnimatedNumber } from '@/components/ui/animated-number';
interface Goal {
  id: string;
  title: string;
  progress: number;
  target: number;
  category: string;
  deadline: string;
}
interface Milestone {
  id: string;
  title: string;
  description: string;
  date: string;
  icon: React.ReactNode;
  color: string;
}
interface UsageData {
  feature: string;
  usage: number;
  trend: 'up' | 'down' | 'stable';
}
export default function UserAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const stats = {
    totalReadings: 47,
    daysActive: 28,
    currentStreak: 12,
    goalsCompleted: 5
  };
  const goals: Goal[] = [{
    id: '1',
    title: 'Complete 50 Daily Readings',
    progress: 47,
    target: 50,
    category: 'Engagement',
    deadline: 'Feb 29, 2024'
  }, {
    id: '2',
    title: 'Maintain 30-Day Streak',
    progress: 12,
    target: 30,
    category: 'Consistency',
    deadline: 'Mar 15, 2024'
  }, {
    id: '3',
    title: 'Explore All Features',
    progress: 8,
    target: 12,
    category: 'Discovery',
    deadline: 'Mar 31, 2024'
  }];
  const milestones: Milestone[] = [{
    id: '1',
    title: 'First Reading',
    description: 'Completed your first numerology reading',
    date: 'Jan 1, 2024',
    icon: <StarIcon className="w-6 h-6" />,
    color: 'from-blue-500 to-cyan-500'
  }, {
    id: '2',
    title: 'Week Warrior',
    description: 'Maintained a 7-day streak',
    date: 'Jan 8, 2024',
    icon: <ZapIcon className="w-6 h-6" />,
    color: 'from-orange-500 to-red-500'
  }, {
    id: '3',
    title: 'Community Member',
    description: 'Made your first forum post',
    date: 'Jan 15, 2024',
    icon: <AwardIcon className="w-6 h-6" />,
    color: 'from-purple-500 to-pink-500'
  }, {
    id: '4',
    title: 'Goal Achiever',
    description: 'Completed your first goal',
    date: 'Jan 22, 2024',
    icon: <TrophyIcon className="w-6 h-6" />,
    color: 'from-amber-500 to-yellow-500'
  }];
  const usageData: UsageData[] = [{
    feature: 'Daily Readings',
    usage: 85,
    trend: 'up'
  }, {
    feature: 'AI Chat',
    usage: 62,
    trend: 'up'
  }, {
    feature: 'Birth Chart',
    usage: 45,
    trend: 'stable'
  }, {
    feature: 'Forum',
    usage: 38,
    trend: 'up'
  }, {
    feature: 'Forecasts',
    usage: 28,
    trend: 'down'
  }];
  const journeyTimeline = [{
    month: 'Jan',
    readings: 15,
    engagement: 60
  }, {
    month: 'Feb',
    readings: 32,
    engagement: 85
  }];
  const comparativeInsights = {
    readingsVsAverage: 142,
    streakRank: 'Top 15%',
    engagementLevel: 'High'
  };
  return <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 transition-colors duration-500 flex flex-col relative overflow-hidden">
      <AmbientParticles />
      <FloatingOrbs />
      <AppNavbar />

      <main className="flex-1 section-spacing px-4 md:px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} className="text-center mb-12">
            <motion.div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-3xl flex items-center justify-center text-white mb-6 mx-auto shadow-xl" animate={{
            rotate: [0, 5, -5, 0]
          }} transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut'
          }}>
              <BarChart3Icon className="w-10 h-10" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-white dark:via-purple-300 dark:to-blue-300 bg-clip-text text-transparent">
              Your Journey
            </h1>
            <p className="text-lg text-gray-600 dark:text-white/70 max-w-2xl mx-auto">
              Track your progress and celebrate your achievements
            </p>
          </motion.div>

          {/* Stats Overview */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.1
        }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <MagneticCard variant="liquid" className="card-padding text-center">
              <div className="liquid-glass-content">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white mb-3 mx-auto">
                  <BarChart3Icon className="w-6 h-6" />
                </div>
                <AnimatedNumber 
                  number={stats.totalReadings.toString()} 
                  label="Total Readings"
                />
              </div>
            </MagneticCard>

            <MagneticCard variant="liquid" className="card-padding text-center">
              <div className="liquid-glass-content">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white mb-3 mx-auto">
                  <CalendarIcon className="w-6 h-6" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {stats.daysActive}
                </div>
                <p className="text-sm text-gray-600 dark:text-white/70">
                  Days Active
                </p>
              </div>
            </MagneticCard>

            <MagneticCard variant="liquid" className="card-padding text-center">
              <div className="liquid-glass-content">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-white mb-3 mx-auto">
                  <ZapIcon className="w-6 h-6" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {stats.currentStreak}
                </div>
                <p className="text-sm text-gray-600 dark:text-white/70">
                  Day Streak
                </p>
              </div>
            </MagneticCard>

            <MagneticCard variant="liquid" className="card-padding text-center">
              <div className="liquid-glass-content">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white mb-3 mx-auto">
                  <TrophyIcon className="w-6 h-6" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {stats.goalsCompleted}
                </div>
                <p className="text-sm text-gray-600 dark:text-white/70">
                  Goals Completed
                </p>
              </div>
            </MagneticCard>
          </motion.div>

          {/* Progress Timeline */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.2
        }} className="mb-12">
            <MagneticCard variant="liquid-premium" className="card-padding-lg">
              <div className="liquid-glass-content">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Progress Timeline
                  </h2>
                  <div className="flex gap-2">
                    {(['week', 'month', 'year'] as const).map(period => <motion.button key={period} onClick={() => setSelectedPeriod(period)} className={`px-4 py-2 rounded-xl font-semibold capitalize transition-all ${selectedPeriod === period ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-gray-800/30'}`} whileHover={{
                    scale: 1.05
                  }} whileTap={{
                    scale: 0.95
                  }}>
                        {period}
                      </motion.button>)}
                  </div>
                </div>

                {/* Simple Bar Chart */}
                <div className="space-y-4">
                  {journeyTimeline.map((data, index) => <div key={data.month}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {data.month}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {data.readings} readings
                        </span>
                      </div>
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div className="h-full bg-gradient-to-r from-blue-500 to-purple-600" initial={{
                      width: 0
                    }} animate={{
                      width: `${data.engagement}%`
                    }} transition={{
                      duration: 1,
                      delay: index * 0.2
                    }} />
                      </div>
                    </div>)}
                </div>
              </div>
            </MagneticCard>
          </motion.div>

          {/* Goals Section */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.3
        }} className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Active Goals
              </h2>
              <GlassButton variant="liquid" size="sm" icon={<TargetIcon className="w-4 h-4" />}>
                New Goal
              </GlassButton>
            </div>

            <div className="space-y-4">
              {goals.map((goal, index) => <motion.div key={goal.id} initial={{
              opacity: 0,
              x: -20
            }} animate={{
              opacity: 1,
              x: 0
            }} transition={{
              delay: index * 0.1
            }}>
                  <MagneticCard variant="liquid" className="card-padding">
                    <div className="liquid-glass-content">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                            {goal.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-700 dark:text-purple-300 rounded-full text-xs font-semibold">
                              {goal.category}
                            </span>
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="w-3 h-3" />
                              {goal.deadline}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {Math.round(goal.progress / goal.target * 100)}%
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {goal.progress}/{goal.target}
                          </div>
                        </div>
                      </div>

                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div className="h-full bg-gradient-to-r from-green-500 to-emerald-500" initial={{
                      width: 0
                    }} animate={{
                      width: `${goal.progress / goal.target * 100}%`
                    }} transition={{
                      duration: 1,
                      delay: index * 0.2
                    }} />
                      </div>
                    </div>
                  </MagneticCard>
                </motion.div>)}
            </div>
          </motion.div>

          {/* Feature Usage & Milestones Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Feature Usage */}
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.4
          }}>
              <MagneticCard variant="liquid" className="card-padding h-full">
                <div className="liquid-glass-content">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                    Feature Usage
                  </h3>
                  <div className="space-y-4">
                    {usageData.map((data, index) => <div key={data.feature}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            {data.feature}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {data.usage}%
                            </span>
                            <TrendingUpIcon className={`w-4 h-4 ${data.trend === 'up' ? 'text-green-600' : data.trend === 'down' ? 'text-red-600' : 'text-gray-600'}`} />
                          </div>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <motion.div className="h-full bg-gradient-to-r from-blue-500 to-purple-600" initial={{
                        width: 0
                      }} animate={{
                        width: `${data.usage}%`
                      }} transition={{
                        duration: 1,
                        delay: index * 0.1
                      }} />
                        </div>
                      </div>)}
                  </div>
                </div>
              </MagneticCard>
            </motion.div>

            {/* Recent Milestones */}
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.5
          }}>
              <MagneticCard variant="liquid" className="card-padding h-full">
                <div className="liquid-glass-content">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                    Recent Milestones
                  </h3>
                  <div className="space-y-4">
                    {milestones.map((milestone, index) => <motion.div key={milestone.id} initial={{
                    opacity: 0,
                    x: -20
                  }} animate={{
                    opacity: 1,
                    x: 0
                  }} transition={{
                    delay: index * 0.1
                  }} className="flex items-start gap-3">
                        <div className={`w-12 h-12 bg-gradient-to-br ${milestone.color} rounded-xl flex items-center justify-center text-white flex-shrink-0`}>
                          {milestone.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {milestone.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-white/70 mb-1">
                            {milestone.description}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <ClockIcon className="w-3 h-3" />
                            {milestone.date}
                          </p>
                        </div>
                      </motion.div>)}
                  </div>
                </div>
              </MagneticCard>
            </motion.div>
          </div>

          {/* Comparative Insights */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.6
        }}>
            <MagneticCard variant="liquid-premium" className="card-padding-lg">
              <div className="liquid-glass-content">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  How You Compare
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-green-500/10 rounded-2xl">
                    <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                      +{comparativeInsights.readingsVsAverage}%
                    </div>
                    <p className="text-sm text-gray-700 dark:text-white/90">
                      More readings than average user
                    </p>
                  </div>
                  <div className="text-center p-6 bg-blue-500/10 rounded-2xl">
                    <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                      {comparativeInsights.streakRank}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-white/90">
                      Streak ranking among users
                    </p>
                  </div>
                  <div className="text-center p-6 bg-purple-500/10 rounded-2xl">
                    <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                      {comparativeInsights.engagementLevel}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-white/90">
                      Overall engagement level
                    </p>
                  </div>
                </div>
              </div>
            </MagneticCard>
          </motion.div>
        </div>
      </main>
    </div>;
}