'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { StarIcon, SparklesIcon, TrendingUpIcon, HeartIcon, BriefcaseIcon, CalendarIcon } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { FloatingOrbs } from '@/components/ui/floating-orbs';
import { AmbientParticles } from '@/components/ui/ambient-particles';
import { MagneticCard } from '@/components/ui/magnetic-card';
import { numerologyAPI } from '@/lib/numerology-api';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';

export default function DailyReadings() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [reading, setReading] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReading = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const data = await numerologyAPI.getDailyReading(selectedDate);
        setReading(data);
      } catch (error: any) {
        console.error('Failed to fetch daily reading:', error);
        toast.error('Failed to load daily reading. Using default content.');
      } finally {
        setLoading(false);
      }
    };

    fetchReading();
  }, [user, selectedDate]);

  const todayReading = reading ? {
    personalDay: reading.personal_day_number,
    theme: `Personal Day ${reading.personal_day_number}`,
    message: reading.llm_explanation || reading.actionable_tip || 'Your personalized reading for today.',
    luckyNumber: reading.lucky_number,
    luckyColor: reading.lucky_color,
    advice: [
      reading.actionable_tip,
      reading.activity_recommendation,
      reading.warning ? `Note: ${reading.warning}` : null,
      reading.affirmation
    ].filter(Boolean) as string[]
  } : {
    personalDay: 5,
    theme: 'Change and Adventure',
    message: 'Loading your personalized reading...',
    luckyNumber: 8,
    luckyColor: 'Gold',
    advice: ['Stay flexible and open to change', 'Try something new today', 'Connect with adventurous people', 'Trust your instincts']
  };
  const weeklyForecast = [{
    day: 'Mon',
    number: 3,
    energy: 'high'
  }, {
    day: 'Tue',
    number: 4,
    energy: 'medium'
  }, {
    day: 'Wed',
    number: 5,
    energy: 'high'
  }, {
    day: 'Thu',
    number: 6,
    energy: 'medium'
  }, {
    day: 'Fri',
    number: 7,
    energy: 'low'
  }, {
    day: 'Sat',
    number: 8,
    energy: 'high'
  }, {
    day: 'Sun',
    number: 9,
    energy: 'medium'
  }];
  return <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 transition-colors duration-500 relative overflow-hidden">
      <AmbientParticles />
      <FloatingOrbs />
      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 py-8">
        {/* Page Header */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <motion.div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg" animate={{
            rotate: [0, 5, -5, 0]
          }} transition={{
            duration: 3,
            repeat: Infinity
          }}>
              <CalendarIcon className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-white dark:via-purple-300 dark:to-blue-300 bg-clip-text text-transparent">
                Daily Readings
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Your personalized numerology insights for today
              </p>
            </div>
          </div>
        </motion.div>

        {/* Date Selector */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.1
      }} className="mb-8">
          <GlassCard variant="liquid-premium" className="p-6">
            <div className="liquid-glass-content">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Select Date
              </label>
              <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border border-gray-300 dark:border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white" />
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
      }} className="mb-8">
          <GlassCard variant="liquid-premium" className="p-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 liquid-glass-iridescent">
            <div className="liquid-glass-content">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  Today&apos;s Reading
                </h2>
                <motion.div className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-600/20 backdrop-blur-xl rounded-full border border-blue-500/30" animate={{
                scale: [1, 1.05, 1]
              }} transition={{
                duration: 2,
                repeat: Infinity
              }}>
                  <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                    {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}
                  </span>
                </motion.div>
              </div>

              <MagneticCard variant="liquid" className="p-6 mb-6">
                <div className="liquid-glass-content">
                  <div className="flex items-center gap-4 mb-4">
                    <motion.div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-xl" animate={{
                    rotate: [0, 5, -5, 0]
                  }} transition={{
                    duration: 2,
                    repeat: Infinity
                  }}>
                      {todayReading.personalDay}
                    </motion.div>
                    <div>
                      <p className="font-semibold text-lg text-gray-900 dark:text-white">
                        Personal Day Number
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {todayReading.theme}
                      </p>
                    </div>
                  </div>
                  {loading ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        {todayReading.message}
                      </p>
                      {reading?.llm_explanation && (
                        <div className="mt-4 p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
                          <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-2">AI-Generated Insight</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            {reading.llm_explanation}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </MagneticCard>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <MagneticCard variant="liquid" className="p-5">
                  <div className="liquid-glass-content">
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      Lucky Number
                    </p>
                    <motion.p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent" animate={{
                    scale: [1, 1.1, 1]
                  }} transition={{
                    duration: 1.5,
                    repeat: Infinity
                  }}>
                      {todayReading.luckyNumber}
                    </motion.p>
                  </div>
                </MagneticCard>

                <MagneticCard variant="liquid" className="p-5">
                  <div className="liquid-glass-content">
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      Lucky Color
                    </p>
                    <div className="flex items-center gap-3">
                      <motion.div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full shadow-lg" animate={{
                      rotate: 360
                    }} transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'linear'
                    }} />
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {todayReading.luckyColor}
                      </p>
                    </div>
                  </div>
                </MagneticCard>
              </div>

              <GlassCard variant="liquid" className="p-5">
                <div className="liquid-glass-content">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Today&apos;s Advice
                  </h3>
                  <ul className="space-y-2">
                    {todayReading.advice.map((item, index) => <motion.li key={index} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300" initial={{
                    opacity: 0,
                    x: -20
                  }} animate={{
                    opacity: 1,
                    x: 0
                  }} transition={{
                    delay: 0.3 + index * 0.1
                  }}>
                        <SparklesIcon className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                        {item}
                      </motion.li>)}
                  </ul>
                </div>
              </GlassCard>
            </div>
          </GlassCard>
        </motion.div>

        {/* Weekly Forecast */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.3
      }} className="mb-8">
          <GlassCard variant="liquid-premium" className="p-6">
            <div className="liquid-glass-content">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Weekly Forecast
              </h3>
              <div className="grid grid-cols-7 gap-2">
                {weeklyForecast.map((day, index) => <motion.div key={day.day} initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                delay: 0.4 + index * 0.05
              }}>
                    <MagneticCard variant="liquid" className={`p-3 text-center ${day.energy === 'high' ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20' : day.energy === 'low' ? 'bg-gradient-to-br from-gray-500/20 to-gray-600/20' : 'bg-gradient-to-br from-blue-500/20 to-purple-500/20'}`}>
                      <div className="liquid-glass-content">
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                          {day.day}
                        </p>
                        <motion.p className="text-2xl font-bold text-gray-900 dark:text-white" whileHover={{
                      scale: 1.2
                    }}>
                          {day.number}
                        </motion.p>
                        <div className="mt-2 flex justify-center">
                          {day.energy === 'high' && <TrendingUpIcon className="w-4 h-4 text-green-600 dark:text-green-400" />}
                          {day.energy === 'medium' && <StarIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                          {day.energy === 'low' && <HeartIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
                        </div>
                      </div>
                    </MagneticCard>
                  </motion.div>)}
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Life Areas Today */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.4
      }}>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Life Areas Today
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MagneticCard variant="liquid-premium" className="p-5">
              <div className="liquid-glass-content">
                <div className="flex items-center gap-2 mb-3">
                  <HeartIcon className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Love
                  </h4>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Open your heart to new connections and deepen existing bonds
                </p>
              </div>
            </MagneticCard>

            <MagneticCard variant="liquid-premium" className="p-5">
              <div className="liquid-glass-content">
                <div className="flex items-center gap-2 mb-3">
                  <BriefcaseIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Career
                  </h4>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Take calculated risks and explore new opportunities
                </p>
              </div>
            </MagneticCard>

            <MagneticCard variant="liquid-premium" className="p-5">
              <div className="liquid-glass-content">
                <div className="flex items-center gap-2 mb-3">
                  <SparklesIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Spiritual
                  </h4>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Trust your intuition and embrace inner guidance
                </p>
              </div>
            </MagneticCard>
          </div>
        </motion.div>
      </div>
    </div>;
}