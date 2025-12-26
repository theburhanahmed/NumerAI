'use client';

import React, { useState, useEffect } from 'react';
import { spiritualNumerologyAPI } from '@/lib/numerology-api';
import { SpaceCard } from '@/components/space/space-card';
import { Loader2, Gift, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export function DivineGifts() {
  const [gifts, setGifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGifts();
  }, []);

  const fetchGifts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await spiritualNumerologyAPI.getDivineGifts();
      if (data.success && data.divine_gifts) {
        setGifts(data.divine_gifts);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load divine gifts');
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

  if (gifts.length === 0) {
    return (
      <SpaceCard variant="elevated" className="p-6 text-center">
        <p className="text-white/70">No divine gifts identified in your numerology profile.</p>
      </SpaceCard>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Your Divine Gifts</h2>
        <p className="text-white/70">Special spiritual abilities and gifts carried from your soul's journey</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {gifts.map((gift, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <SpaceCard variant="premium" className="p-6" glow>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                  {gift.number === 11 || gift.number === 22 || gift.number === 33 ? (
                    <Sparkles className="w-7 h-7 text-white" />
                  ) : (
                    <Gift className="w-7 h-7 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-3xl font-bold text-white">{gift.number}</span>
                    {gift.number === 11 || gift.number === 22 || gift.number === 33 && (
                      <span className="px-2 py-1 text-xs font-semibold rounded bg-purple-500/20 text-purple-400">
                        Master Number
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-cyan-400 mb-2">{gift.gift}</h3>
                  <p className="text-white/80 text-sm mb-3">{gift.description}</p>
                  <div className="pt-3 border-t border-white/10">
                    <p className="text-white/70 text-xs">
                      Source: <span className="text-cyan-400 capitalize">{gift.source.replace('_', ' ')}</span>
                    </p>
                  </div>
                </div>
              </div>
            </SpaceCard>
          </motion.div>
        ))}
      </div>

      {gifts.length > 0 && (
        <SpaceCard variant="elevated" className="p-6">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-cyan-400 mt-0.5" />
            <div>
              <h3 className="text-lg font-bold text-white mb-2">About Divine Gifts</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Your divine gifts are special abilities and qualities that your soul carries from previous lifetimes.
                These gifts, especially Master Numbers (11, 22, 33), indicate a higher spiritual purpose and
                enhanced abilities to serve humanity. Embrace and develop these gifts to fulfill your soul's mission.
              </p>
            </div>
          </div>
        </SpaceCard>
      )}
    </div>
  );
}

