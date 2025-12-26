'use client';

import React, { useState, useEffect } from 'react';
import { predictiveNumerologyAPI } from '@/lib/numerology-api';
import { SpaceCard } from '@/components/space/space-card';
import { Loader2, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export function NineYearCycleForecast() {
  const [cycles, setCycles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forecastYears, setForecastYears] = useState(20);

  useEffect(() => {
    fetchCycles();
  }, [forecastYears]);

  const fetchCycles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await predictiveNumerologyAPI.get9YearCycle(forecastYears);
      if (data.success && data.cycles) {
        setCycles(data.cycles);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load 9-year cycles');
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">9-Year Cycles</h2>
          <p className="text-white/70">Major life cycles that repeat every 9 years</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-white/70 text-sm">Forecast:</label>
          <select
            value={forecastYears}
            onChange={(e) => setForecastYears(Number(e.target.value))}
            className="px-3 py-1 bg-gray-800 border border-white/10 rounded text-white text-sm"
          >
            <option value={10}>10 years</option>
            <option value={20}>20 years</option>
            <option value={30}>30 years</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {cycles.map((cycle, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <SpaceCard
              variant={cycle.is_current ? "premium" : "elevated"}
              className="p-6"
              glow={cycle.is_current}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold text-white">Cycle {cycle.cycle_number}</h3>
                      {cycle.is_current && (
                        <span className="px-2 py-1 text-xs font-semibold rounded bg-cyan-500/20 text-cyan-400">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-white/70 text-sm">
                      {cycle.start_year} - {cycle.end_year}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-semibold text-white mb-2">Cycle Theme</h4>
                <p className="text-lg font-semibold text-cyan-400">{cycle.cycle_theme}</p>
              </div>

              {cycle.key_focus && (
                <div>
                  <h4 className="text-sm font-semibold text-white mb-2">Key Focus</h4>
                  <p className="text-white/80">{cycle.key_focus}</p>
                </div>
              )}
            </SpaceCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

