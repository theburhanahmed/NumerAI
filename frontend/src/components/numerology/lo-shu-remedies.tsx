'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Sparkles } from 'lucide-react';
import { SpaceCard } from '@/components/space/space-card';
import { TouchOptimizedButton } from '@/components/buttons/touch-optimized-button';
import { MissingNumberDetail } from '@/lib/numerology-api';

interface LoShuRemediesProps {
  remedies: {
    remedy_suggestions: string[];
    missing_numbers: number[];
    missing_number_details: MissingNumberDetail[];
    weakness_arrows: string[];
  };
}

export function LoShuRemedies({ remedies }: LoShuRemediesProps) {
  const [trackedRemedies, setTrackedRemedies] = useState<Set<string>>(new Set());

  const toggleRemedy = (remedy: string) => {
    const newTracked = new Set(trackedRemedies);
    if (newTracked.has(remedy)) {
      newTracked.delete(remedy);
    } else {
      newTracked.add(remedy);
    }
    setTrackedRemedies(newTracked);
  };

  return (
    <div className="space-y-6">
      {/* Missing Numbers Details */}
      {remedies.missing_number_details.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Karmic Lessons
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {remedies.missing_number_details.map((detail, index) => (
              <motion.div
                key={detail.number}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <SpaceCard variant="premium" className="p-5" glow>
                  <div className="text-center mb-4">
                    <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                      {detail.number}
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-1">
                      {detail.lesson}
                    </h4>
                    <span className="inline-block px-2 py-1 rounded-full text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {detail.element}
                    </span>
                  </div>
                  <p className="text-white/80 text-sm mb-3">
                    {detail.description}
                  </p>
                  <div className="bg-cyan-500/10 rounded-lg p-3 border border-cyan-500/20">
                    <p className="text-cyan-300 text-sm font-medium mb-1">Remedy:</p>
                    <p className="text-white/90 text-sm">{detail.remedy}</p>
                  </div>
                </SpaceCard>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Remedy Suggestions */}
      {remedies.remedy_suggestions.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Actionable Remedies</h3>
          <div className="space-y-3">
            {remedies.remedy_suggestions.map((remedy, index) => {
              const isTracked = trackedRemedies.has(remedy);
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <SpaceCard
                    variant="premium"
                    className={`p-4 cursor-pointer transition-all ${
                      isTracked ? 'border-2 border-green-500/50 bg-green-500/10' : ''
                    }`}
                    onClick={() => toggleRemedy(remedy)}
                    glow
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRemedy(remedy);
                        }}
                        className="flex-shrink-0 mt-1"
                      >
                        {isTracked ? (
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-white/40" />
                        )}
                      </button>
                      <p className="text-white/90 flex-1">{remedy}</p>
                    </div>
                  </SpaceCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Progress Summary */}
      {trackedRemedies.size > 0 && (
        <SpaceCard variant="premium" className="p-6" glow>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-white mb-1">Progress</h4>
              <p className="text-white/70 text-sm">
                {trackedRemedies.size} of {remedies.remedy_suggestions.length} remedies tracked
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-400">
                {Math.round((trackedRemedies.size / remedies.remedy_suggestions.length) * 100)}%
              </div>
            </div>
          </div>
          <div className="mt-4 h-2 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(trackedRemedies.size / remedies.remedy_suggestions.length) * 100}%` }}
              className="h-full bg-gradient-to-r from-green-500 to-emerald-600"
            />
          </div>
        </SpaceCard>
      )}
    </div>
  );
}

