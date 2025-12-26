'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, X } from 'lucide-react';
import { SpaceCard } from '@/components/space/space-card';

interface LoShuGridInteractiveProps {
  gridData: {
    grid: Record<string, {
      number: number;
      count: number;
      is_present: boolean;
      strength: 'strong' | 'present' | 'missing';
      meaning: string;
    }>;
    position_grid?: Record<number, number>;
  };
  onCellClick?: (number: number, position: string) => void;
}

// Standard Lo Shu Grid layout
const GRID_LAYOUT = [
  [4, 9, 2],
  [3, 5, 7],
  [8, 1, 6],
];

const POSITION_NAMES: Record<number, string> = {
  4: 'top_left',
  9: 'top_center',
  2: 'top_right',
  3: 'middle_left',
  5: 'center',
  7: 'middle_right',
  8: 'bottom_left',
  1: 'bottom_center',
  6: 'bottom_right',
};

export function LoShuGridInteractive({ gridData, onCellClick }: LoShuGridInteractiveProps) {
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);

  const getCellData = (number: number) => {
    const position = POSITION_NAMES[number];
    return gridData.grid[position] || {
      number,
      count: 0,
      is_present: false,
      strength: 'missing' as const,
      meaning: '',
    };
  };

  const getCellColor = (number: number) => {
    const cellData = getCellData(number);
    
    if (cellData.strength === 'strong') {
      return 'bg-gradient-to-br from-green-500 to-emerald-600';
    } else if (cellData.strength === 'present') {
      return 'bg-gradient-to-br from-yellow-400 to-orange-500';
    } else {
      return 'bg-gradient-to-br from-gray-700 to-gray-800';
    }
  };

  const handleCellClick = (number: number) => {
    setSelectedCell(selectedCell === number ? null : number);
    if (onCellClick) {
      const position = POSITION_NAMES[number];
      onCellClick(number, position);
    }
  };

  const selectedCellData = selectedCell ? getCellData(selectedCell) : null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
        {GRID_LAYOUT.map((row, rowIndex) =>
          row.map((number) => {
            const cellData = getCellData(number);
            const isSelected = selectedCell === number;
            const isHovered = hoveredCell === number;

            return (
              <motion.button
                key={number}
                onClick={() => handleCellClick(number)}
                onMouseEnter={() => setHoveredCell(number)}
                onMouseLeave={() => setHoveredCell(null)}
                className={`
                  relative aspect-square rounded-xl p-4
                  ${getCellColor(number)}
                  ${isSelected ? 'ring-4 ring-cyan-400 ring-offset-2 ring-offset-[#0a0f1a]' : ''}
                  ${isHovered ? 'scale-105' : ''}
                  transition-all duration-300
                  flex flex-col items-center justify-center
                  shadow-lg
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="text-3xl font-bold text-white mb-1">
                  {number}
                </div>
                {cellData.count > 0 && (
                  <div className="text-xs text-white/90 font-semibold">
                    {cellData.count}x
                  </div>
                )}
                {cellData.strength === 'missing' && (
                  <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
                )}
              </motion.button>
            );
          })
        )}
      </div>

      <AnimatePresence>
        {selectedCellData && selectedCell && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="max-w-md mx-auto"
          >
            <SpaceCard variant="premium" className="p-6" glow>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Number {selectedCell}
                  </h3>
                  <p className="text-white/70 text-sm">
                    {POSITION_NAMES[selectedCell].replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCell(null)}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-white/70 text-sm mb-1">Count</p>
                  <p className="text-white font-semibold">{selectedCellData.count}</p>
                </div>
                <div>
                  <p className="text-white/70 text-sm mb-1">Status</p>
                  <span className={`
                    inline-block px-3 py-1 rounded-full text-xs font-semibold
                    ${selectedCellData.strength === 'strong' ? 'bg-green-500/20 text-green-300' : ''}
                    ${selectedCellData.strength === 'present' ? 'bg-yellow-500/20 text-yellow-300' : ''}
                    ${selectedCellData.strength === 'missing' ? 'bg-red-500/20 text-red-300' : ''}
                  `}>
                    {selectedCellData.strength.toUpperCase()}
                  </span>
                </div>
                {selectedCellData.meaning && (
                  <div>
                    <p className="text-white/70 text-sm mb-1">Meaning</p>
                    <p className="text-white">{selectedCellData.meaning}</p>
                  </div>
                )}
              </div>
            </SpaceCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

