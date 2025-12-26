'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Info, TrendingUp, TrendingDown, Users } from 'lucide-react';
import { GlassCard } from '@/components/glassmorphism/glass-card';

interface LoShuGridProps {
  gridData: {
    grid: Record<string, { count: number; numbers: number[] }>;
    missing_numbers: number[];
    strong_numbers: number[];
    number_frequency: Record<number, number>;
    position_grid?: Record<number, number>;
    strength_arrows?: string[];
    weakness_arrows?: string[];
    interpretation?: string;
    personality_signature?: {
      dominant_numbers: Array<[number, number]>;
      signature_type: string;
    };
    remedy_suggestions?: string[];
  };
  showComparison?: boolean;
  comparisonData?: {
    compatibility_score: number;
    shared_strengths: string[];
    shared_weaknesses: string[];
    complementary_areas: string[];
  };
}

// Lo Shu Grid positions (3x3 grid)
const GRID_POSITIONS = [
  [4, 9, 2],
  [3, 5, 7],
  [8, 1, 6],
];

const ARROW_PATTERNS: Record<string, { positions: number[]; name: string; description: string }> = {
  'spiritual_plane': {
    positions: [1, 5, 9],
    name: 'Spiritual Plane',
    description: 'Strong spiritual connection and intuition',
  },
  'material_plane': {
    positions: [3, 5, 7],
    name: 'Material Plane',
    description: 'Strong material and physical focus',
  },
  'mental_plane': {
    positions: [2, 5, 8],
    name: 'Mental Plane',
    description: 'Strong mental and intellectual abilities',
  },
  'emotional_plane': {
    positions: [4, 5, 6],
    name: 'Emotional Plane',
    description: 'Strong emotional intelligence and empathy',
  },
  'physical_plane': {
    positions: [1, 2, 3],
    name: 'Physical Plane',
    description: 'Strong physical energy and vitality',
  },
  'practical_plane': {
    positions: [7, 8, 9],
    name: 'Practical Plane',
    description: 'Strong practical and organizational skills',
  },
  'will_plane': {
    positions: [1, 4, 7],
    name: 'Will Plane',
    description: 'Strong willpower and determination',
  },
  'action_plane': {
    positions: [3, 6, 9],
    name: 'Action Plane',
    description: 'Strong action-oriented and dynamic energy',
  },
};

export function LoShuGrid({ gridData, showComparison, comparisonData }: LoShuGridProps) {
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [showArrows, setShowArrows] = useState(true);

  const getCellData = (position: number) => {
    const posKey = `pos_${position}`;
    return gridData.grid[posKey] || { count: 0, numbers: [] };
  };

  const getCellColor = (position: number) => {
    const cellData = getCellData(position);
    const count = cellData.count;
    
    if (count === 0) return 'bg-gray-200 dark:bg-gray-800';
    if (count === 1) return 'bg-blue-100 dark:bg-blue-900/30';
    if (count === 2) return 'bg-blue-300 dark:bg-blue-700/50';
    if (count >= 3) return 'bg-blue-500 dark:bg-blue-600';
    
    return 'bg-gray-100 dark:bg-gray-700';
  };

  const hasArrow = (arrowType: string) => {
    if (!showArrows) return false;
    const arrows = gridData.strength_arrows || [];
    return arrows.includes(arrowType);
  };

  const getArrowIcon = (arrowType: string) => {
    const pattern = ARROW_PATTERNS[arrowType];
    if (!pattern) return null;
    
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="flex flex-col items-center gap-1">
          <TrendingUp className="w-4 h-4 text-green-500" />
          <span className="text-xs text-green-600 dark:text-green-400 font-semibold">
            {pattern.name}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Grid Visualization */}
      <GlassCard variant="elevated" className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Lo Shu Grid
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowArrows(!showArrows)}
              className="px-3 py-1 text-sm rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {showArrows ? 'Hide' : 'Show'} Arrows
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
          {GRID_POSITIONS.map((row, rowIdx) =>
            row.map((position, colIdx) => {
              const cellData = getCellData(position);
              const isSelected = selectedCell === position;
              const hasStrength = hasArrow(`spiritual_plane`) || 
                                 hasArrow(`material_plane`) || 
                                 hasArrow(`mental_plane`) ||
                                 hasArrow(`emotional_plane`);

              return (
                <motion.div
                  key={`${rowIdx}-${colIdx}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (rowIdx * 3 + colIdx) * 0.05 }}
                  className={`
                    relative aspect-square rounded-lg border-2 transition-all cursor-pointer
                    ${getCellColor(position)}
                    ${isSelected ? 'ring-4 ring-purple-500 ring-offset-2' : 'border-gray-300 dark:border-gray-600'}
                    hover:scale-105 hover:shadow-lg
                  `}
                  onClick={() => setSelectedCell(isSelected ? null : position)}
                >
                  {/* Position Number */}
                  <div className="absolute top-1 left-1 text-xs font-semibold text-gray-600 dark:text-gray-400">
                    {position}
                  </div>

                  {/* Count Badge */}
                  {cellData.count > 0 && (
                    <div className="absolute top-1 right-1 bg-white dark:bg-gray-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold text-gray-900 dark:text-white shadow-sm">
                      {cellData.count}
                    </div>
                  )}

                  {/* Numbers in Cell */}
                  <div className="flex items-center justify-center h-full">
                    {cellData.numbers.length > 0 ? (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {cellData.numbers.join(', ')}
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-400 dark:text-gray-600 text-sm">Empty</div>
                    )}
                  </div>

                  {/* Arrow Indicators */}
                  {showArrows && hasStrength && getArrowIcon('spiritual_plane')}
                </motion.div>
              );
            })
          )}
        </div>

        {/* Legend */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-200 dark:bg-gray-800"></div>
            <span className="text-gray-600 dark:text-gray-400">Empty</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-100 dark:bg-blue-900/30"></div>
            <span className="text-gray-600 dark:text-gray-400">1 occurrence</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-300 dark:bg-blue-700/50"></div>
            <span className="text-gray-600 dark:text-gray-400">2 occurrences</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500 dark:bg-blue-600"></div>
            <span className="text-gray-600 dark:text-gray-400">3+ occurrences</span>
          </div>
        </div>
      </GlassCard>

      {/* Selected Cell Details */}
      {selectedCell && (
        <GlassCard variant="elevated" className="p-6">
          <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Position {selectedCell} Details
          </h4>
          {(() => {
            const cellData = getCellData(selectedCell);
            return (
              <div className="space-y-2">
                <div>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Count: </span>
                  <span className="text-gray-600 dark:text-gray-400">{cellData.count}</span>
                </div>
                {cellData.numbers.length > 0 && (
                  <div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Numbers: </span>
                    <span className="text-gray-600 dark:text-gray-400">{cellData.numbers.join(', ')}</span>
                  </div>
                )}
              </div>
            );
          })()}
        </GlassCard>
      )}

      {/* Missing Numbers */}
      {gridData.missing_numbers && gridData.missing_numbers.length > 0 && (
        <GlassCard variant="elevated" className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-5 h-5 text-orange-500" />
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              Missing Numbers
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {gridData.missing_numbers.map((num) => (
              <span
                key={num}
                className="px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 font-semibold"
              >
                {num}
              </span>
            ))}
          </div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            These numbers are not present in your grid. Consider remedies to balance your energy.
          </p>
        </GlassCard>
      )}

      {/* Strong Numbers */}
      {gridData.strong_numbers && gridData.strong_numbers.length > 0 && (
        <GlassCard variant="elevated" className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              Strong Numbers
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {gridData.strong_numbers.map((num) => (
              <span
                key={num}
                className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-semibold"
              >
                {num}
              </span>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Interpretation */}
      {gridData.interpretation && (
        <GlassCard variant="elevated" className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-blue-500" />
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              Interpretation
            </h4>
          </div>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {gridData.interpretation}
          </p>
        </GlassCard>
      )}

      {/* Personality Signature */}
      {gridData.personality_signature && (
        <GlassCard variant="elevated" className="p-6">
          <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Personality Signature
          </h4>
          <div className="space-y-2">
            <div>
              <span className="font-semibold text-gray-700 dark:text-gray-300">Type: </span>
              <span className="text-gray-600 dark:text-gray-400">
                {gridData.personality_signature.signature_type}
              </span>
            </div>
            {gridData.personality_signature.dominant_numbers.length > 0 && (
              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">Dominant Numbers: </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {gridData.personality_signature.dominant_numbers
                    .map(([num, count]) => `${num} (${count}x)`)
                    .join(', ')}
                </span>
              </div>
            )}
          </div>
        </GlassCard>
      )}

      {/* Comparison Data */}
      {showComparison && comparisonData && (
        <GlassCard variant="elevated" className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-purple-500" />
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              Compatibility Analysis
            </h4>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  Compatibility Score
                </span>
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {comparisonData.compatibility_score}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all"
                  style={{ width: `${comparisonData.compatibility_score}%` }}
                ></div>
              </div>
            </div>

            {comparisonData.shared_strengths.length > 0 && (
              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  Shared Strengths: 
                </span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {comparisonData.shared_strengths.map((strength, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm"
                    >
                      {strength}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {comparisonData.complementary_areas.length > 0 && (
              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  Complementary Areas: 
                </span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {comparisonData.complementary_areas.map((area, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </GlassCard>
      )}

      {/* Remedy Suggestions */}
      {gridData.remedy_suggestions && gridData.remedy_suggestions.length > 0 && (
        <GlassCard variant="elevated" className="p-6">
          <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Remedy Suggestions
          </h4>
          <ul className="space-y-2">
            {gridData.remedy_suggestions.map((remedy, idx) => (
              <li key={idx} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                <span className="text-purple-500 mt-1">•</span>
                <span>{remedy}</span>
              </li>
            ))}
          </ul>
        </GlassCard>
      )}
    </div>
  );
}
