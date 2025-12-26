'use client';

import React, { useState, useEffect } from 'react';
import { spiritualNumerologyAPI } from '@/lib/numerology-api';
import { SpaceCard } from '@/components/space/space-card';
import { Loader2, Calendar, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export function KarmicTimeline() {
  const [timelineData, setTimelineData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forecastYears, setForecastYears] = useState(50);

  useEffect(() => {
    fetchTimeline();
  }, [forecastYears]);

  const fetchTimeline = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await spiritualNumerologyAPI.getKarmicTimeline(forecastYears);
      if (data.success && data.timeline) {
        setTimelineData(data.timeline);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load karmic timeline');
    } finally {
      setLoading(false);
    }
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

  if (!timelineData) {
    return (
      <SpaceCard variant="elevated" className="p-6 text-center">
        <p className="text-white/70">No timeline data available.</p>
      </SpaceCard>
    );
  }

  const currentCycle = timelineData.current_cycle;
  const upcomingTransitions = timelineData.upcoming_transitions || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Karmic Timeline</h2>
          <p className="text-white/70">Explore your karmic cycles and spiritual journey through time</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-white/70 text-sm">Forecast:</label>
          <select
            value={forecastYears}
            onChange={(e) => setForecastYears(Number(e.target.value))}
            className="px-3 py-1 bg-gray-800 border border-white/10 rounded text-white text-sm"
          >
            <option value={30}>30 years</option>
            <option value={50}>50 years</option>
            <option value={75}>75 years</option>
            <option value={100}>100 years</option>
          </select>
        </div>
      </div>

      {currentCycle && (
        <SpaceCard variant="premium" className="p-6" glow>
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-6 h-6 text-cyan-400" />
            <h3 className="text-xl font-bold text-white">Current Karmic Cycle</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-white/70 text-sm mb-1">Cycle Number</p>
              <p className="text-2xl font-bold text-white">{currentCycle.cycle_number}</p>
            </div>
            <div>
              <p className="text-white/70 text-sm mb-1">Period</p>
              <p className="text-lg font-semibold text-white">
                {currentCycle.start_year} - {currentCycle.end_year}
              </p>
            </div>
            <div>
              <p className="text-white/70 text-sm mb-1">Theme</p>
              <p className="text-lg font-semibold text-cyan-400">{currentCycle.karmic_theme}</p>
            </div>
          </div>
          {currentCycle.lessons && currentCycle.lessons.length > 0 && (
            <div className="mt-4 pt-4 border-t border-cyan-500/20">
              <p className="text-white/70 text-sm mb-2">Karmic Lessons:</p>
              <ul className="space-y-1">
                {currentCycle.lessons.map((lesson: string, i: number) => (
                  <li key={i} className="text-white/80 text-sm">• {lesson}</li>
                ))}
              </ul>
            </div>
          )}
        </SpaceCard>
      )}

      {upcomingTransitions.length > 0 && (
        <SpaceCard variant="elevated" className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-bold text-white">Upcoming Transitions</h3>
          </div>
          <div className="space-y-4">
            {upcomingTransitions.map((transition: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4 p-4 bg-gray-800/50 rounded-lg"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-white">{transition.year}</p>
                    <span className="px-2 py-0.5 text-xs rounded bg-yellow-500/20 text-yellow-400">
                      {transition.type === 'cycle_start' ? 'Cycle Start' : 'Cycle End'}
                    </span>
                  </div>
                  {transition.cycle && (
                    <p className="text-white/70 text-sm">{transition.cycle.karmic_theme}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </SpaceCard>
      )}

      {timelineData.cycles && timelineData.cycles.length > 0 && (
        <SpaceCard variant="elevated" className="p-6">
          <h3 className="text-lg font-bold text-white mb-4">All Karmic Cycles</h3>
          <div className="space-y-4">
            {timelineData.cycles.map((cycle: any, index: number) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  cycle.is_current
                    ? 'bg-cyan-500/10 border-cyan-500/30'
                    : 'bg-gray-800/50 border-white/10'
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-white/70 text-sm">Cycle {cycle.cycle_number}</p>
                    <p className="text-lg font-bold text-white">{cycle.start_year} - {cycle.end_year}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-white/90 font-semibold">{cycle.karmic_theme}</p>
                  </div>
                  {cycle.is_current && (
                    <div className="text-right">
                      <span className="px-2 py-1 text-xs font-semibold rounded bg-cyan-500/20 text-cyan-400">
                        Current
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </SpaceCard>
      )}
    </div>
  );
}

