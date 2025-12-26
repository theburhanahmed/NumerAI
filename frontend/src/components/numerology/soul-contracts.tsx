'use client';

import React, { useState, useEffect } from 'react';
import { spiritualNumerologyAPI } from '@/lib/numerology-api';
import { SpaceCard } from '@/components/space/space-card';
import { Loader2, Sparkles, CheckCircle2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export function SoulContracts() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await spiritualNumerologyAPI.getSoulContracts();
      if (data.success && data.contracts) {
        setContracts(data.contracts);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load soul contracts');
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

  if (contracts.length === 0) {
    return (
      <SpaceCard variant="elevated" className="p-6 text-center">
        <p className="text-white/70">No soul contracts found. Please calculate your spiritual profile first.</p>
      </SpaceCard>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Your Soul Contracts</h2>
        <p className="text-white/70">Discover the spiritual agreements your soul made before entering this lifetime</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {contracts.map((contract, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <SpaceCard variant="elevated" className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-white">
                      Contract {contract.contract_number}
                    </h3>
                    <span className="px-2 py-1 text-xs font-semibold rounded bg-cyan-500/20 text-cyan-400">
                      {contract.type}
                    </span>
                  </div>
                  <p className="text-white/70 text-sm">{contract.description}</p>
                </div>
              </div>

              {contract.lessons && contract.lessons.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-white mb-2">Lessons to Learn:</h4>
                  <ul className="space-y-1">
                    {contract.lessons.map((lesson: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-white/80 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                        <span>{lesson}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {contract.challenges && contract.challenges.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <h4 className="text-sm font-semibold text-white mb-2">Challenges:</h4>
                  <ul className="space-y-1">
                    {contract.challenges.map((challenge: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-white/70 text-sm">
                        <Clock className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <span>{challenge}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {contract.opportunities && contract.opportunities.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <h4 className="text-sm font-semibold text-white mb-2">Opportunities:</h4>
                  <ul className="space-y-1">
                    {contract.opportunities.map((opportunity: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-white/80 text-sm">
                        <Sparkles className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>{opportunity}</span>
                      </li>
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

