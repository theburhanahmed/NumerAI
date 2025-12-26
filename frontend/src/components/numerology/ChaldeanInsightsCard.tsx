'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Compass, 
  Cake, 
  ChevronDown, 
  ChevronUp,
  Heart,
  Sparkles
} from 'lucide-react';
import { GlassCard } from '@/components/glassmorphism/glass-card';
import type { ChaldeanAnalysis } from '@/lib/numerology-api';

interface ChaldeanInsightsCardProps {
  data: ChaldeanAnalysis;
}

export function ChaldeanInsightsCard({ data }: ChaldeanInsightsCardProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('driver');

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const getHarmonyColor = (score: number) => {
    if (score >= 75) return 'text-emerald-400';
    if (score >= 50) return 'text-cyan-400';
    if (score >= 25) return 'text-amber-400';
    return 'text-red-400';
  };

  const getHarmonyBg = (score: number) => {
    if (score >= 75) return 'from-emerald-500/20 to-emerald-500/5';
    if (score >= 50) return 'from-cyan-500/20 to-cyan-500/5';
    if (score >= 25) return 'from-amber-500/20 to-amber-500/5';
    return 'from-red-500/20 to-red-500/5';
  };

  return (
    <GlassCard className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20">
            <Sparkles className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Chaldean Insights</h3>
            <p className="text-sm text-slate-400">Driver, Conductor & Birthday Analysis</p>
          </div>
        </div>
      </div>

      {/* Driver Number */}
      <div className="border-b border-slate-700/50">
        <button
          onClick={() => toggleSection('driver')}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/30 to-cyan-500/30 flex items-center justify-center">
              <Brain className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">Driver Number</span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-sm font-bold">
                  {data.driver_number.number}
                </span>
              </div>
              <span className="text-sm text-slate-400">Your inner self & psychic nature</span>
            </div>
          </div>
          {expandedSection === 'driver' ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </button>
        
        <AnimatePresence>
          {expandedSection === 'driver' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-4 pb-4"
            >
              <div className="p-4 rounded-lg bg-slate-800/50 space-y-3">
                <h4 className="font-semibold text-cyan-300">
                  {data.driver_number.interpretation.title}
                </h4>
                <p className="text-sm text-slate-300">
                  {data.driver_number.interpretation.description}
                </p>
                {data.driver_number.interpretation.inner_nature && (
                  <div className="pt-2 border-t border-slate-700">
                    <span className="text-xs text-slate-500 uppercase">Inner Nature</span>
                    <p className="text-sm text-slate-300 mt-1">
                      {data.driver_number.interpretation.inner_nature}
                    </p>
                  </div>
                )}
                {data.driver_number.interpretation.motivation && (
                  <div className="pt-2 border-t border-slate-700">
                    <span className="text-xs text-slate-500 uppercase">Motivation</span>
                    <p className="text-sm text-slate-300 mt-1">
                      {data.driver_number.interpretation.motivation}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Conductor Number */}
      <div className="border-b border-slate-700/50">
        <button
          onClick={() => toggleSection('conductor')}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/30 to-violet-500/30 flex items-center justify-center">
              <Compass className="w-5 h-5 text-violet-400" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">Conductor Number</span>
                <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400 text-sm font-bold">
                  {data.conductor_number.number}
                </span>
              </div>
              <span className="text-sm text-slate-400">How others perceive you</span>
            </div>
          </div>
          {expandedSection === 'conductor' ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </button>
        
        <AnimatePresence>
          {expandedSection === 'conductor' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-4 pb-4"
            >
              <div className="p-4 rounded-lg bg-slate-800/50 space-y-3">
                <h4 className="font-semibold text-violet-300">
                  {data.conductor_number.interpretation.title}
                </h4>
                <p className="text-sm text-slate-300">
                  {data.conductor_number.interpretation.description}
                </p>
                {data.conductor_number.interpretation.life_direction && (
                  <div className="pt-2 border-t border-slate-700">
                    <span className="text-xs text-slate-500 uppercase">Life Direction</span>
                    <p className="text-sm text-slate-300 mt-1">
                      {data.conductor_number.interpretation.life_direction}
                    </p>
                  </div>
                )}
                {data.conductor_number.interpretation.public_image && (
                  <div className="pt-2 border-t border-slate-700">
                    <span className="text-xs text-slate-500 uppercase">Public Image</span>
                    <p className="text-sm text-slate-300 mt-1">
                      {data.conductor_number.interpretation.public_image}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Birthday Number */}
      <div className="border-b border-slate-700/50">
        <button
          onClick={() => toggleSection('birthday')}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500/30 to-rose-500/30 flex items-center justify-center">
              <Cake className="w-5 h-5 text-pink-400" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">Birthday Number</span>
                <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-400 text-sm font-bold">
                  {data.birthday_number.number}
                </span>
              </div>
              <span className="text-sm text-slate-400">Your inherent talents</span>
            </div>
          </div>
          {expandedSection === 'birthday' ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </button>
        
        <AnimatePresence>
          {expandedSection === 'birthday' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-4 pb-4"
            >
              <div className="p-4 rounded-lg bg-slate-800/50 space-y-3">
                <h4 className="font-semibold text-pink-300">
                  {data.birthday_number.interpretation.title}
                </h4>
                <p className="text-sm text-slate-300">
                  {data.birthday_number.interpretation.description}
                </p>
                {data.birthday_number.interpretation.talents && (
                  <div className="pt-2 border-t border-slate-700">
                    <span className="text-xs text-slate-500 uppercase">Natural Talents</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {data.birthday_number.interpretation.talents.map((talent, idx) => (
                        <span key={idx} className="px-2 py-1 rounded bg-pink-500/20 text-pink-300 text-xs">
                          {talent}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {data.birthday_number.interpretation.lucky_colors && (
                  <div className="pt-2 border-t border-slate-700">
                    <span className="text-xs text-slate-500 uppercase">Lucky Colors</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {data.birthday_number.interpretation.lucky_colors.map((color, idx) => (
                        <span key={idx} className="px-2 py-1 rounded bg-slate-700 text-slate-300 text-xs">
                          {color}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {data.birthday_number.interpretation.advice && (
                  <div className="pt-2 border-t border-slate-700">
                    <span className="text-xs text-slate-500 uppercase">Advice</span>
                    <p className="text-sm text-slate-300 mt-1 italic">
                      "{data.birthday_number.interpretation.advice}"
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Driver-Conductor Harmony */}
      <div className="p-4">
        <button
          onClick={() => toggleSection('harmony')}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getHarmonyBg(data.driver_conductor_compatibility.harmony_score)} flex items-center justify-center`}>
              <Heart className={`w-5 h-5 ${getHarmonyColor(data.driver_conductor_compatibility.harmony_score)}`} />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">Inner-Outer Harmony</span>
                <span className={`px-2 py-0.5 rounded-full bg-slate-800 text-sm font-bold ${getHarmonyColor(data.driver_conductor_compatibility.harmony_score)}`}>
                  {data.driver_conductor_compatibility.harmony_score}%
                </span>
              </div>
              <span className="text-sm text-slate-400">
                {data.driver_conductor_compatibility.harmony_level}
              </span>
            </div>
          </div>
          {expandedSection === 'harmony' ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </button>
        
        <AnimatePresence>
          {expandedSection === 'harmony' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4"
            >
              <div className="p-4 rounded-lg bg-slate-800/50">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1">
                    <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${data.driver_conductor_compatibility.harmony_score}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className={`h-full rounded-full ${
                          data.driver_conductor_compatibility.harmony_score >= 75 
                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                            : data.driver_conductor_compatibility.harmony_score >= 50
                            ? 'bg-gradient-to-r from-cyan-500 to-cyan-400'
                            : 'bg-gradient-to-r from-amber-500 to-amber-400'
                        }`}
                      />
                    </div>
                  </div>
                </div>
                <p className="text-sm text-slate-300">
                  {data.driver_conductor_compatibility.analysis}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GlassCard>
  );
}

export default ChaldeanInsightsCard;

