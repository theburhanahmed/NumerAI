'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ArrowRight, ArrowDownRight, ArrowDown, ArrowDownLeft } from 'lucide-react';
import { SpaceCard } from '@/components/space/space-card';

interface LoShuArrowsProps {
  arrows: {
    strength_arrows: string[];
    weakness_arrows: string[];
    arrow_interpretation: string;
    arrow_details: Array<{
      name: string;
      numbers: number[];
      meaning: string;
      type: 'strength' | 'weakness';
    }>;
  };
}

const ARROW_POSITIONS: Record<string, { positions: number[]; icon: any; direction: string }> = {
  'spiritual_arrow': { positions: [4, 5, 6], icon: ArrowDownRight, direction: 'diagonal' },
  'material_arrow': { positions: [2, 5, 8], icon: ArrowDownLeft, direction: 'diagonal' },
  'mental_arrow': { positions: [9, 5, 1], icon: ArrowDown, direction: 'vertical' },
  'emotional_arrow': { positions: [3, 5, 7], icon: ArrowRight, direction: 'horizontal' },
  'action_arrow': { positions: [4, 9, 2], icon: ArrowRight, direction: 'horizontal' },
  'stability_arrow': { positions: [8, 1, 6], icon: ArrowRight, direction: 'horizontal' },
  'creativity_arrow': { positions: [4, 3, 8], icon: ArrowDown, direction: 'vertical' },
  'expression_arrow': { positions: [2, 7, 6], icon: ArrowDown, direction: 'vertical' },
};

export function LoShuArrows({ arrows }: LoShuArrowsProps) {
  return (
    <div className="space-y-6">
      {/* Strength Arrows */}
      {arrows.strength_arrows.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Strength Arrows
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {arrows.arrow_details
              .filter(arrow => arrow.type === 'strength')
              .map((arrow, index) => {
                const Icon = ARROW_POSITIONS[arrow.name.toLowerCase().replace(/\s+/g, '_')]?.icon || ArrowRight;
                return (
                  <motion.div
                    key={arrow.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <SpaceCard variant="premium" className="p-4" glow>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-white mb-1">
                            {arrow.name}
                          </h4>
                          <p className="text-white/70 text-sm mb-2">
                            Numbers: {arrow.numbers.join(', ')}
                          </p>
                          <p className="text-white/90 text-sm">
                            {arrow.meaning}
                          </p>
                        </div>
                      </div>
                    </SpaceCard>
                  </motion.div>
                );
              })}
          </div>
        </div>
      )}

      {/* Weakness Arrows */}
      {arrows.weakness_arrows.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-red-400" />
            Areas to Develop
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {arrows.arrow_details
              .filter(arrow => arrow.type === 'weakness')
              .map((arrow, index) => {
                const Icon = ARROW_POSITIONS[arrow.name.toLowerCase().replace(/\s+/g, '_')]?.icon || ArrowRight;
                return (
                  <motion.div
                    key={arrow.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <SpaceCard variant="premium" className="p-4 border border-red-500/30" glow>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-white mb-1">
                            {arrow.name}
                          </h4>
                          <p className="text-white/70 text-sm mb-2">
                            Missing: {arrow.numbers.join(', ')}
                          </p>
                          <p className="text-white/90 text-sm">
                            {arrow.meaning}
                          </p>
                        </div>
                      </div>
                    </SpaceCard>
                  </motion.div>
                );
              })}
          </div>
        </div>
      )}

      {/* Overall Interpretation */}
      {arrows.arrow_interpretation && (
        <SpaceCard variant="premium" className="p-6" glow>
          <h3 className="text-xl font-bold text-white mb-3">Arrow Interpretation</h3>
          <p className="text-white/90 leading-relaxed">
            {arrows.arrow_interpretation}
          </p>
        </SpaceCard>
      )}
    </div>
  );
}

