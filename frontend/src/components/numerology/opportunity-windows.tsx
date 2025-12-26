'use client';

import React, { useState, useEffect } from 'react';
import { predictiveNumerologyAPI } from '@/lib/numerology-api';
import { SpaceCard } from '@/components/space/space-card';
import { Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export function OpportunityWindows() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await predictiveNumerologyAPI.getOpportunityPeriods(20);
      if (data.success && data.opportunity_periods) {
        setOpportunities(data.opportunity_periods);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load opportunity periods');
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
        <h2 className="text-2xl font-bold text-white mb-2">Opportunity Windows</h2>
        <p className="text-white/70">Favorable periods for growth and expansion</p>
      </div>

      {opportunities.length === 0 ? (
        <SpaceCard variant="elevated" className="p-6 text-center">
          <p className="text-white/70">No opportunity periods identified in the forecast period.</p>
        </SpaceCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {opportunities.map((opportunity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <SpaceCard variant="premium" className="p-6" glow>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2">{opportunity.year}</h3>
                    <h4 className="text-lg font-semibold text-cyan-400 mb-2">{opportunity.opportunity_type}</h4>
                    <p className="text-white/80 text-sm mb-3">{opportunity.description}</p>
                    {opportunity.action && (
                      <div className="pt-3 border-t border-white/10">
                        <p className="text-white font-semibold text-sm mb-1">Recommended Action:</p>
                        <p className="text-white/80 text-sm">{opportunity.action}</p>
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

