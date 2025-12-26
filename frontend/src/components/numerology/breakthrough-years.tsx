'use client';

import React, { useState, useEffect } from 'react';
import { predictiveNumerologyAPI } from '@/lib/numerology-api';
import { SpaceCard } from '@/components/space/space-card';
import { Loader2, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export function BreakthroughYears() {
  const [breakthroughs, setBreakthroughs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBreakthroughs();
  }, []);

  const fetchBreakthroughs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await predictiveNumerologyAPI.getBreakthroughYears(20);
      if (data.success && data.breakthrough_years) {
        setBreakthroughs(data.breakthrough_years);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load breakthrough years');
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
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Breakthrough Years</h2>
        <p className="text-white/70">Years of major progress and transformation</p>
      </div>

      {breakthroughs.length === 0 ? (
        <SpaceCard variant="elevated" className="p-6 text-center">
          <p className="text-white/70">No breakthrough years identified in the forecast period.</p>
        </SpaceCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {breakthroughs.map((breakthrough, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <SpaceCard variant="premium" className="p-6" glow>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-2xl font-bold text-white">{breakthrough.year}</h3>
                      {breakthrough.confidence_score && (
                        <span className="px-2 py-1 text-xs font-semibold rounded bg-green-500/20 text-green-400">
                          {breakthrough.confidence_score}% confidence
                        </span>
                      )}
                    </div>
                    <h4 className="text-lg font-semibold text-cyan-400 mb-2">{breakthrough.breakthrough_type}</h4>
                    <p className="text-white/80 text-sm mb-3">{breakthrough.description}</p>
                    {breakthrough.preparation && (
                      <div className="pt-3 border-t border-white/10">
                        <p className="text-white/70 text-xs mb-1">Preparation:</p>
                        <p className="text-white/80 text-sm">{breakthrough.preparation}</p>
                      </div>
                    )}
                  </div>
                </div>
              </SpaceCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

