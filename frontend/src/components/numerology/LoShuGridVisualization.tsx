'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Info, 
  TrendingUp, 
  TrendingDown, 
  ArrowRight,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Lock
} from 'lucide-react';
import { GlassCard } from '@/components/glassmorphism/glass-card';
import type { 
  DetailedLoShuGrid, 
  PersonalityArrow, 
  MissingNumberDetail, 
  RepeatingNumberDetail 
} from '@/lib/numerology-api';

interface LoShuGridVisualizationProps {
  gridData: DetailedLoShuGrid;
  onUpgrade?: () => void;
}

// Lo Shu Grid positions (3x3 grid)
// 4 9 2
// 3 5 7
// 8 1 6
const GRID_LAYOUT = [
  [4, 9, 2],
  [3, 5, 7],
  [8, 1, 6],
];

const POSITION_TO_KEY: Record<number, string> = {
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

const ARROW_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  present: {
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-400',
    border: 'border-emerald-500/50',
  },
  absent: {
    bg: 'bg-amber-500/20',
    text: 'text-amber-400',
    border: 'border-amber-500/50',
  },
};

export function LoShuGridVisualization({ gridData, onUpgrade }: LoShuGridVisualizationProps) {
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    arrows: true,
    missing: true,
    repeating: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const getCellData = (position: number) => {
    const key = POSITION_TO_KEY[position];
    return gridData.grid[key] || { number: position, count: 0, is_present: false, strength: 'missing', meaning: '' };
  };

  const getCellColor = (position: number) => {
    const cellData = getCellData(position);
    const count = cellData.count;
    
    if (count === 0) return 'bg-slate-800/50 border-slate-700';
    if (count === 1) return 'bg-cyan-900/40 border-cyan-700/50';
    if (count === 2) return 'bg-cyan-700/50 border-cyan-500/50';
    if (count >= 3) return 'bg-cyan-500/60 border-cyan-400/70';
    
    return 'bg-slate-800/50 border-slate-700';
  };

  const getIntensityGlow = (count: number) => {
    if (count === 0) return '';
    if (count === 1) return 'shadow-cyan-500/10';
    if (count === 2) return 'shadow-cyan-500/30 shadow-lg';
    if (count >= 3) return 'shadow-cyan-400/50 shadow-xl';
    return '';
  };

  return (
    <div className="space-y-6">
      {/* Main Grid */}
      <GlassCard className="p-6 bg-slate-900/80 backdrop-blur-xl border border-slate-700/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Lo Shu Grid</h3>
              <p className="text-sm text-slate-400">Your numerological energy map</p>
            </div>
          </div>
        </div>

        {/* Grid Visualization */}
        <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto mb-6">
          {GRID_LAYOUT.map((row, rowIdx) =>
            row.map((position, colIdx) => {
              const cellData = getCellData(position);
              const isSelected = selectedCell === position;

              return (
                <motion.div
                  key={`${rowIdx}-${colIdx}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (rowIdx * 3 + colIdx) * 0.05 }}
                  className={`
                    relative aspect-square rounded-xl border-2 transition-all cursor-pointer
                    ${getCellColor(position)}
                    ${getIntensityGlow(cellData.count)}
                    ${isSelected ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-slate-900' : ''}
                    hover:scale-105 hover:brightness-110
                  `}
                  onClick={() => setSelectedCell(isSelected ? null : position)}
                >
                  {/* Position Number (small) */}
                  <div className="absolute top-1.5 left-2 text-xs font-medium text-slate-500">
                    {position}
                  </div>

                  {/* Count Badge */}
                  {cellData.count > 0 && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-1 right-1 bg-slate-800 border border-slate-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold text-cyan-400"
                    >
                      {cellData.count}
                    </motion.div>
                  )}

                  {/* Main Number Display */}
                  <div className="flex items-center justify-center h-full">
                    <span className={`text-3xl font-bold ${cellData.count > 0 ? 'text-white' : 'text-slate-600'}`}>
                      {position}
                    </span>
                  </div>

                  {/* Strength Indicator */}
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
                    {cellData.count === 0 && (
                      <span className="text-[10px] text-slate-500">missing</span>
                    )}
                    {cellData.count >= 3 && (
                      <span className="text-[10px] text-cyan-400 font-medium">strong</span>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-slate-800/50 border border-slate-700"></div>
            <span className="text-slate-400">Missing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-cyan-900/40 border border-cyan-700/50"></div>
            <span className="text-slate-400">Present (1x)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-cyan-700/50 border border-cyan-500/50"></div>
            <span className="text-slate-400">Strong (2x)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-cyan-500/60 border border-cyan-400/70"></div>
            <span className="text-slate-400">Very Strong (3+)</span>
          </div>
        </div>
      </GlassCard>

      {/* Selected Cell Details */}
      <AnimatePresence>
        {selectedCell && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <GlassCard className="p-5 bg-slate-900/80 backdrop-blur-xl border border-slate-700/50">
              <h4 className="text-lg font-semibold text-white mb-3">
                Number {selectedCell} Details
              </h4>
              <p className="text-slate-300 text-sm">
                {getCellData(selectedCell).meaning}
              </p>
              <div className="mt-3 flex items-center gap-4 text-sm">
                <span className="text-slate-400">
                  Frequency: <span className="text-cyan-400 font-medium">{gridData.number_frequency[selectedCell] || 0}x</span>
                </span>
                <span className="text-slate-400">
                  Status: <span className={`font-medium ${getCellData(selectedCell).count > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {getCellData(selectedCell).strength}
                  </span>
                </span>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Personality Arrows */}
      {gridData.personality_arrows && gridData.personality_arrows.length > 0 && (
        <GlassCard className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 overflow-hidden">
          <button
            onClick={() => toggleSection('arrows')}
            className="w-full p-5 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <ArrowRight className="w-5 h-5 text-purple-400" />
              <h4 className="text-lg font-semibold text-white">
                Personality Arrows
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-xs font-medium">
                {gridData.personality_arrows.length} detected
              </span>
            </div>
            {expandedSections.arrows ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </button>
          
          <AnimatePresence>
            {expandedSections.arrows && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-5 pb-5"
              >
                <div className="space-y-3">
                  {gridData.personality_arrows.map((arrow, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border ${ARROW_COLORS[arrow.status].bg} ${ARROW_COLORS[arrow.status].border}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {arrow.is_strength ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-amber-400" />
                          )}
                          <span className={`font-semibold capitalize ${ARROW_COLORS[arrow.status].text}`}>
                            {arrow.name.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 uppercase">
                          {arrow.type} • {arrow.position}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-300">
                        {arrow.meaning}
                      </p>
                      <div className="mt-2 flex gap-2">
                        {arrow.numbers.map(num => (
                          <span key={num} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs">
                            {num}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      )}

      {/* Missing Numbers with Karmic Lessons */}
      {gridData.missing_number_details && gridData.missing_number_details.length > 0 && (
        <GlassCard className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 overflow-hidden">
          <button
            onClick={() => toggleSection('missing')}
            className="w-full p-5 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <TrendingDown className="w-5 h-5 text-amber-400" />
              <h4 className="text-lg font-semibold text-white">
                Missing Numbers (Karmic Lessons)
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium">
                {gridData.missing_numbers.length}
              </span>
            </div>
            {expandedSections.missing ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </button>
          
          <AnimatePresence>
            {expandedSections.missing && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-5 pb-5"
              >
                <div className="space-y-4">
                  {gridData.missing_number_details.map((detail, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
                          {detail.number}
                        </span>
                        <div>
                          <span className="font-semibold text-amber-300">{detail.lesson}</span>
                          <span className="ml-2 text-xs text-slate-500">({detail.element} Element)</span>
                        </div>
                      </div>
                      <p className="text-sm text-slate-300 mb-3">
                        {detail.description}
                      </p>
                      <div className="p-3 rounded bg-slate-800/50 border border-slate-700">
                        <span className="text-xs text-slate-400 uppercase tracking-wide">Remedy</span>
                        <p className="text-sm text-slate-200 mt-1">{detail.remedy}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Premium Upgrade CTA */}
                {gridData.premium_preview && gridData.upgrade_message && (
                  <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30">
                    <div className="flex items-center gap-3">
                      <Lock className="w-5 h-5 text-purple-400" />
                      <div className="flex-1">
                        <p className="text-sm text-slate-300">{gridData.upgrade_message}</p>
                      </div>
                      {onUpgrade && (
                        <button
                          onClick={onUpgrade}
                          className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-medium hover:brightness-110 transition-all"
                        >
                          Upgrade
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      )}

      {/* Repeating Numbers (Strengths/Overemphasis) */}
      {gridData.repeating_number_details && gridData.repeating_number_details.length > 0 && (
        <GlassCard className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 overflow-hidden">
          <button
            onClick={() => toggleSection('repeating')}
            className="w-full p-5 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h4 className="text-lg font-semibold text-white">
                Strong Numbers (Repeating)
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                {gridData.repeating_number_details.length}
              </span>
            </div>
            {expandedSections.repeating ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </button>
          
          <AnimatePresence>
            {expandedSections.repeating && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-5 pb-5"
              >
                <div className="space-y-4">
                  {gridData.repeating_number_details.map((detail, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                            {detail.number}
                          </span>
                          <span className="font-semibold text-emerald-300">{detail.strength}</span>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          detail.intensity === 'very_strong' 
                            ? 'bg-emerald-500/30 text-emerald-300' 
                            : detail.intensity === 'strong'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-emerald-500/10 text-emerald-500'
                        }`}>
                          {detail.count}x ({detail.intensity.replace('_', ' ')})
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="p-2 rounded bg-slate-800/50">
                          <span className="text-slate-400">Potential Overemphasis: </span>
                          <span className="text-slate-300">{detail.overemphasis}</span>
                        </div>
                        <div className="p-2 rounded bg-emerald-900/20">
                          <span className="text-emerald-400">Balance Tip: </span>
                          <span className="text-slate-300">{detail.balance_tip}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      )}

      {/* Overall Interpretation */}
      {gridData.interpretation && (
        <GlassCard className="p-5 bg-slate-900/80 backdrop-blur-xl border border-slate-700/50">
          <div className="flex items-center gap-3 mb-4">
            <Info className="w-5 h-5 text-cyan-400" />
            <h4 className="text-lg font-semibold text-white">
              Overall Interpretation
            </h4>
          </div>
          <p className="text-slate-300 leading-relaxed">
            {gridData.interpretation}
          </p>
        </GlassCard>
      )}
    </div>
  );
}

export default LoShuGridVisualization;

