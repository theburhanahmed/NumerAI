'use client';

import React, { useState, useEffect } from 'react';
import { spiritualNumerologyAPI } from '@/lib/numerology-api';
import { SpaceCard } from '@/components/space/space-card';
import { Loader2, Clock, Moon, Sun, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

export function MeditationTiming() {
  const [timingData, setTimingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [targetDate, setTargetDate] = useState<string>('');

  useEffect(() => {
    fetchTiming();
  }, [targetDate]);

  const fetchTiming = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await spiritualNumerologyAPI.getMeditationTiming(targetDate || undefined);
      if (data.success && data.meditation_timing) {
        setTimingData(data.meditation_timing);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load meditation timing');
    } finally {
      setLoading(false);
    }
  };

  const getTimeIcon = (time: string) => {
    if (time.includes('Morning') || time.includes('5-7')) return Sun;
    if (time.includes('Sunset') || time.includes('6-8')) return Sun;
    if (time.includes('Midnight') || time.includes('11 PM')) return Moon;
    return Clock;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-500" />
      </div>
    );
  }

  if (error) {
    return (
      <SpaceCard variant="elevated" className="p-6">
        <p className="text-red-400">{error}</p>
      </SpaceCard>
    );
  }

  if (!timingData) {
    return (
      <SpaceCard variant="elevated" className="p-6 text-center">
        <p className="text-white/70">No meditation timing data available.</p>
      </SpaceCard>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Meditation Timing</h2>
          <p className="text-white/70">Discover optimal times for meditation based on your numerology cycles</p>
        </div>
        <div>
          <label className="text-white/70 text-sm mr-2">Target Date:</label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="px-3 py-1 bg-gray-800 border border-white/10 rounded text-white text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <SpaceCard variant="outlined" className="p-4 text-center">
          <p className="text-white/70 text-sm mb-1">Personal Year</p>
          <p className="text-3xl font-bold text-white">{timingData.personal_year}</p>
        </SpaceCard>
        <SpaceCard variant="outlined" className="p-4 text-center">
          <p className="text-white/70 text-sm mb-1">Personal Month</p>
          <p className="text-3xl font-bold text-white">{timingData.personal_month}</p>
        </SpaceCard>
        <SpaceCard variant="outlined" className="p-4 text-center">
          <p className="text-white/70 text-sm mb-1">Personal Day</p>
          <p className="text-3xl font-bold text-white">{timingData.personal_day}</p>
        </SpaceCard>
      </div>

      {timingData.optimal_times && timingData.optimal_times.length > 0 && (
        <SpaceCard variant="premium" className="p-6" glow>
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-cyan-400" />
            <h3 className="text-xl font-bold text-white">Optimal Meditation Times</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {timingData.optimal_times.map((time: any, index: number) => {
              const Icon = getTimeIcon(time.time);
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg ${
                    time.priority === 'high'
                      ? 'bg-cyan-500/10 border border-cyan-500/30'
                      : 'bg-gray-800/50 border border-white/10'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`w-5 h-5 ${
                      time.priority === 'high' ? 'text-cyan-400' : 'text-white/60'
                    } mt-0.5`} />
                    <div className="flex-1">
                      <p className="font-semibold text-white mb-1">{time.time}</p>
                      <p className="text-white/70 text-sm">{time.reason}</p>
                      {time.priority && (
                        <span className={`mt-2 inline-block px-2 py-0.5 text-xs rounded ${
                          time.priority === 'high'
                            ? 'bg-cyan-500/20 text-cyan-400'
                            : 'bg-gray-700 text-white/70'
                        }`}>
                          {time.priority} priority
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </SpaceCard>
      )}

      {timingData.recommended_practices && timingData.recommended_practices.length > 0 && (
        <SpaceCard variant="elevated" className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-bold text-white">Recommended Practices</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {timingData.recommended_practices.map((practice: string, index: number) => (
              <div key={index} className="flex items-start gap-2 p-3 bg-gray-800/50 rounded-lg">
                <Sparkles className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                <span className="text-white/80 text-sm">{practice}</span>
              </div>
            ))}
          </div>
        </SpaceCard>
      )}

      {timingData.meditation_affirmations && timingData.meditation_affirmations.length > 0 && (
        <SpaceCard variant="elevated" className="p-6">
          <h3 className="text-lg font-bold text-white mb-4">Meditation Affirmations</h3>
          <div className="space-y-3">
            {timingData.meditation_affirmations.map((affirmation: string, index: number) => (
              <div key={index} className="p-4 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-lg border border-purple-500/20">
                <p className="text-white/90 italic">"{affirmation}"</p>
              </div>
            ))}
          </div>
        </SpaceCard>
      )}

      {timingData.crystal_recommendations && timingData.crystal_recommendations.length > 0 && (
        <SpaceCard variant="elevated" className="p-6">
          <h3 className="text-lg font-bold text-white mb-4">Crystal Recommendations</h3>
          <div className="flex flex-wrap gap-2">
            {timingData.crystal_recommendations.map((crystal: string, index: number) => (
              <span
                key={index}
                className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium"
              >
                {crystal}
              </span>
            ))}
          </div>
        </SpaceCard>
      )}
    </div>
  );
}

