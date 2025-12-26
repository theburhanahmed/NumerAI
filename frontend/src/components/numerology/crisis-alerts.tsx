'use client';

import React, { useState, useEffect } from 'react';
import { predictiveNumerologyAPI } from '@/lib/numerology-api';
import { SpaceCard } from '@/components/space/space-card';
import { Loader2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export function CrisisAlerts() {
  const [crises, setCrises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCrises();
  }, []);

  const fetchCrises = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await predictiveNumerologyAPI.getCrisisYears(20);
      if (data.success && data.crisis_years) {
        setCrises(data.crisis_years);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load crisis years');
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      default: return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Crisis Years</h2>
        <p className="text-white/70">Challenging periods requiring careful navigation</p>
      </div>

      {crises.length === 0 ? (
        <SpaceCard variant="elevated" className="p-6 text-center">
          <p className="text-white/70">No crisis years identified in the forecast period.</p>
        </SpaceCard>
      ) : (
        <div className="space-y-4">
          {crises.map((crisis, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <SpaceCard variant="elevated" className={`p-6 border-2 ${getSeverityColor(crisis.severity_level || 'medium')}`}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-2xl font-bold text-white">{crisis.year}</h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded capitalize ${getSeverityColor(crisis.severity_level || 'medium')}`}>
                        {crisis.severity_level || 'medium'} severity
                      </span>
                    </div>
                    <h4 className="text-lg font-semibold text-yellow-400 mb-2">{crisis.crisis_type}</h4>
                    <p className="text-white/80 text-sm mb-3">{crisis.description}</p>
                    <div className="pt-3 border-t border-white/10 mb-3">
                      <p className="text-white font-semibold text-sm mb-1">Guidance:</p>
                      <p className="text-white/80 text-sm">{crisis.guidance}</p>
                    </div>
                    {crisis.preparation_steps && crisis.preparation_steps.length > 0 && (
                      <div className="pt-3 border-t border-white/10">
                        <p className="text-white font-semibold text-sm mb-2">Preparation Steps:</p>
                        <ul className="space-y-1">
                          {crisis.preparation_steps.map((step: string, i: number) => (
                            <li key={i} className="text-white/80 text-sm">• {step}</li>
                          ))}
                        </ul>
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

