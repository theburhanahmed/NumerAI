'use client';

import React, { useState, useEffect } from 'react';
import { spiritualNumerologyAPI } from '@/lib/numerology-api';
import { SpaceCard } from '@/components/space/space-card';
import { Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export function RebirthCycles() {
  const [cycles, setCycles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCycles();
  }, []);

  const fetchCycles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await spiritualNumerologyAPI.getRebirthCycles();
      if (data.success && data.rebirth_cycles) {
        setCycles(data.rebirth_cycles);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load rebirth cycles');
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

  if (cycles.length === 0) {
    return (
      <SpaceCard variant="elevated" className="p-6 text-center">
        <p className="text-white/70">No rebirth cycles found.</p>
      </SpaceCard>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Rebirth Cycles</h2>
        <p className="text-white/70">Major life transformations and spiritual rebirth periods (27-year cycles)</p>
      </div>

      <div className="space-y-6">
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
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                    <Sparkles className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold text-white">
                        Rebirth Cycle {cycle.rebirth_number}
                      </h3>
                      {cycle.is_current && (
                        <span className="px-2 py-1 text-xs font-semibold rounded bg-cyan-500/20 text-cyan-400">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-white/70 text-sm">
                      {cycle.start_year} - {cycle.end_year} ({cycle.duration_years} years)
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-semibold text-white mb-2">Transformation Theme</h4>
                <p className="text-lg font-semibold text-cyan-400">{cycle.transformation_theme}</p>
              </div>

              {cycle.spiritual_growth && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-white mb-2">Spiritual Growth</h4>
                  <p className="text-white/80">{cycle.spiritual_growth}</p>
                </div>
              )}

              {cycle.preparation_steps && cycle.preparation_steps.length > 0 && (
                <div className="mb-4 pt-4 border-t border-white/10">
                  <h4 className="text-sm font-semibold text-white mb-2">Preparation Steps</h4>
                  <ul className="space-y-1">
                    {cycle.preparation_steps.map((step: string, i: number) => (
                      <li key={i} className="text-white/80 text-sm">• {step}</li>
                    ))}
                  </ul>
                </div>
              )}

              {cycle.transition_periods && cycle.transition_periods.length > 0 && (
                <div className="mb-4 pt-4 border-t border-white/10">
                  <h4 className="text-sm font-semibold text-white mb-2">Transition Periods</h4>
                  <div className="space-y-2">
                    {cycle.transition_periods.map((transition: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <AlertTriangle className="w-4 h-4 text-yellow-400" />
                        <span className="text-white/80">
                          {transition.year}: {transition.guidance}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {cycle.warning_signs && cycle.warning_signs.length > 0 && (
                <div className="pt-4 border-t border-white/10">
                  <h4 className="text-sm font-semibold text-yellow-400 mb-2">Warning Signs</h4>
                  <ul className="space-y-1">
                    {cycle.warning_signs.map((warning: string, i: number) => (
                      <li key={i} className="text-yellow-400/80 text-sm">• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </SpaceCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

