'use client';

import { motion } from 'framer-motion';
import { Grid3x3, Info, ArrowRight, ArrowDown, ArrowDownRight, ArrowDownLeft } from 'lucide-react';
import { GlassCard } from '@/components/glassmorphism/glass-card';

interface LoShuGridProps {
  gridData: {
    grid: {
      [key: string]: {
        number: number;
        count: number;
        is_present: boolean;
        strength: 'strong' | 'present' | 'missing';
        meaning: string;
      };
    };
    missing_numbers: number[];
    strong_numbers: number[];
    interpretation: string;
    arrows?: {
      strength_arrows: Array<{
        name: string;
        type: string;
        positions: string[];
        numbers: number[];
        strength: string;
        meaning: string;
      }>;
      weakness_arrows: Array<{
        name: string;
        type: string;
        positions: string[];
        numbers: number[];
        strength: string;
        meaning: string;
      }>;
      partial_arrows: Array<{
        name: string;
        type: string;
        positions: string[];
        numbers: number[];
        strength: string;
        meaning: string;
      }>;
    };
    arrow_interpretation?: string;
    enhanced_interpretation?: string;
  };
  className?: string;
  showArrows?: boolean;
}

export function LoShuGrid({ gridData, className = '', showArrows = true }: LoShuGridProps) {
  const { grid, missing_numbers, strong_numbers, interpretation, arrows, arrow_interpretation, enhanced_interpretation } = gridData;

  // Standard Lo Shu Grid layout
  const gridLayout = [
    ['top_left', 'top_center', 'top_right'],
    ['middle_left', 'center', 'middle_right'],
    ['bottom_left', 'bottom_center', 'bottom_right'],
  ];

  // Get arrow paths for visualization
  const getArrowPath = (arrow: { name: string; type: string; positions: string[] }) => {
    const positionCoords: Record<string, { row: number; col: number }> = {
      'top_left': { row: 0, col: 0 },
      'top_center': { row: 0, col: 1 },
      'top_right': { row: 0, col: 2 },
      'middle_left': { row: 1, col: 0 },
      'center': { row: 1, col: 1 },
      'middle_right': { row: 1, col: 2 },
      'bottom_left': { row: 2, col: 0 },
      'bottom_center': { row: 2, col: 1 },
      'bottom_right': { row: 2, col: 2 },
    };

    const coords = arrow.positions.map(pos => positionCoords[pos]);
    if (coords.length < 2) return null;

    const start = coords[0];
    const end = coords[coords.length - 1];
    
    // Calculate SVG path
    const cellSize = 100; // Approximate cell size
    const startX = start.col * cellSize + cellSize / 2;
    const startY = start.row * cellSize + cellSize / 2;
    const endX = end.col * cellSize + cellSize / 2;
    const endY = end.row * cellSize + cellSize / 2;

    return { startX, startY, endX, endY, type: arrow.type };
  };

  // Get all arrow paths
  const allArrows = [
    ...(arrows?.strength_arrows || []).map(a => ({ ...a, color: 'green' })),
    ...(arrows?.weakness_arrows || []).map(a => ({ ...a, color: 'red' })),
    ...(arrows?.partial_arrows || []).map(a => ({ ...a, color: 'yellow' })),
  ];

  const getCellColor = (strength: string) => {
    switch (strength) {
      case 'strong':
        return 'bg-gradient-to-br from-green-500 to-emerald-600 text-white';
      case 'present':
        return 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white';
      case 'missing':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-400';
    }
  };

  const getCellBorder = (strength: string) => {
    switch (strength) {
      case 'strong':
        return 'border-2 border-green-400';
      case 'present':
        return 'border-2 border-blue-400';
      default:
        return 'border border-gray-300 dark:border-gray-700';
    }
  };

  return (
    <GlassCard variant="default" className={`p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center text-white">
          <Grid3x3 className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Lo Shu Grid
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Magic Square Numerology
          </p>
        </div>
      </div>

      {/* Grid Visualization */}
      <div className="mb-6">
        <div className="relative grid grid-cols-3 gap-2 max-w-md mx-auto">
          {/* Arrow overlay SVG */}
          {showArrows && arrows && allArrows.length > 0 && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
              viewBox="0 0 300 300"
              preserveAspectRatio="none"
            >
              {allArrows.map((arrow, idx) => {
                const path = getArrowPath(arrow);
                if (!path) return null;
                
                const colorMap: Record<string, string> = {
                  green: '#10b981',
                  red: '#ef4444',
                  yellow: '#eab308'
                };
                
                return (
                  <g key={`arrow-${idx}`}>
                    <line
                      x1={path.startX}
                      y1={path.startY}
                      x2={path.endX}
                      y2={path.endY}
                      stroke={colorMap[arrow.color] || '#6b7280'}
                      strokeWidth="3"
                      strokeDasharray={arrow.color === 'yellow' ? '5,5' : '0'}
                      markerEnd="url(#arrowhead)"
                      opacity="0.7"
                    />
                  </g>
                );
              })}
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3, 0 6" fill="#6b7280" />
                </marker>
              </defs>
            </svg>
          )}
          
          {gridLayout.map((row, rowIdx) =>
            row.map((position, colIdx) => {
              const cell = grid[position];
              const isCenter = position === 'center';
              
              // Check if this position is part of an arrow
              const isInArrow = showArrows && arrows && allArrows.some(a => 
                a.positions.includes(position)
              );
              
              return (
                <motion.div
                  key={position}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (rowIdx * 3 + colIdx) * 0.05 }}
                  className={`
                    aspect-square flex flex-col items-center justify-center rounded-lg relative z-20
                    ${getCellColor(cell.strength)}
                    ${getCellBorder(cell.strength)}
                    ${isCenter ? 'ring-2 ring-yellow-400 ring-offset-2' : ''}
                    ${isInArrow ? 'ring-1 ring-offset-1' : ''}
                    transition-all duration-300
                    hover:scale-105 cursor-pointer
                  `}
                  title={cell.meaning}
                >
                  <span className="text-2xl font-bold">{cell.number}</span>
                  {cell.count > 0 && (
                    <span className="text-xs opacity-80 mt-1">
                      {cell.count}x
                    </span>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
        
        {/* Arrow Legend */}
        {showArrows && arrows && (arrows.strength_arrows.length > 0 || arrows.weakness_arrows.length > 0 || arrows.partial_arrows.length > 0) && (
          <div className="mt-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Arrow Patterns:</p>
            <div className="flex flex-wrap gap-3 text-xs">
              {arrows.strength_arrows.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 bg-green-500"></div>
                  <span className="text-gray-600 dark:text-gray-400">
                    {arrows.strength_arrows.length} Strong
                  </span>
                </div>
              )}
              {arrows.weakness_arrows.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 bg-red-500"></div>
                  <span className="text-gray-600 dark:text-gray-400">
                    {arrows.weakness_arrows.length} Weak
                  </span>
                </div>
              )}
              {arrows.partial_arrows.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 bg-yellow-500 border-dashed"></div>
                  <span className="text-gray-600 dark:text-gray-400">
                    {arrows.partial_arrows.length} Partial
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mb-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-green-500 to-emerald-600"></div>
          <span className="text-gray-600 dark:text-gray-400">Strong (2+)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-blue-500 to-cyan-600"></div>
          <span className="text-gray-600 dark:text-gray-400">Present</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-200 dark:bg-gray-700"></div>
          <span className="text-gray-600 dark:text-gray-400">Missing</span>
        </div>
      </div>

      {/* Interpretation */}
      <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800">
        <div className="flex items-start gap-2 mb-2">
          <Info className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
          <h4 className="font-semibold text-gray-900 dark:text-white">Interpretation</h4>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
          {enhanced_interpretation || interpretation}
        </p>
        
        {arrow_interpretation && (
          <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-800">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Arrow Analysis:
            </p>
            <p className="text-xs text-gray-700 dark:text-gray-300">
              {arrow_interpretation}
            </p>
          </div>
        )}
        
        {strong_numbers.length > 0 && (
          <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-800">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Strong Numbers:
            </p>
            <div className="flex gap-2">
              {strong_numbers.map((num) => (
                <span
                  key={num}
                  className="px-2 py-1 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold"
                >
                  {num}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {missing_numbers.length > 0 && (
          <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-800">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Missing Numbers (Areas to Develop):
            </p>
            <div className="flex gap-2">
              {missing_numbers.map((num) => (
                <span
                  key={num}
                  className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-semibold"
                >
                  {num}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
}

