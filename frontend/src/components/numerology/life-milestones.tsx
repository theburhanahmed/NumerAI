'use client';

import React, { useState, useEffect } from 'react';
import { predictiveNumerologyAPI } from '@/lib/numerology-api';
import { SpaceCard } from '@/components/space/space-card';
import { Loader2, Target } from 'lucide-react';
import { motion } from 'framer-motion';

export function LifeMilestones() {
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMilestones();
  }, []);

  const fetchMilestones = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await predictiveNumerologyAPI.getLifeMilestones(50);
      if (data.success && data.milestones) {
        setMilestones(data.milestones);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load life milestones');
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
        <h2 className="text-2xl font-bold text-white mb-2">Life Milestones</h2>
        <p className="text-white/70">Major life transitions and significant periods</p>
      </div>

      {milestones.length === 0 ? (
        <SpaceCard variant="elevated" className="p-6 text-center">
          <p className="text-white/70">No milestones identified in the forecast period.</p>
        </SpaceCard>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500 via-purple-500 to-pink-500"></div>
          
          <div className="space-y-6">
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative pl-20"
              >
                <div className="absolute left-6 w-4 h-4 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 border-2 border-gray-900"></div>
                <SpaceCard variant="elevated" className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="w-5 h-5 text-cyan-400" />
                        <h3 className="text-xl font-bold text-white">{milestone.year}</h3>
                        <span className="px-2 py-1 text-xs font-semibold rounded bg-cyan-500/20 text-cyan-400">
                          Age {milestone.age}
                        </span>
                      </div>
                      <h4 className="text-lg font-semibold text-purple-400 mb-2">{milestone.milestone_type}</h4>
                    </div>
                  </div>
                  <p className="text-white/80">{milestone.significance}</p>
                </SpaceCard>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

