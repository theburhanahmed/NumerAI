'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  Sun, 
  Moon as MoonIcon,
  Gem,
  Palette,
  Calendar,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { GlassCard } from '@/components/glassmorphism/glass-card';
import type { ZodiacNumerologyProfile } from '@/lib/numerology-api';

interface ZodiacPlanetCardProps {
  data: ZodiacNumerologyProfile;
}

const ELEMENT_COLORS: Record<string, { bg: string; text: string; gradient: string }> = {
  Fire: {
    bg: 'bg-orange-500/20',
    text: 'text-orange-400',
    gradient: 'from-orange-500/30 to-red-500/30',
  },
  Water: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
    gradient: 'from-blue-500/30 to-cyan-500/30',
  },
  Earth: {
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-400',
    gradient: 'from-emerald-500/30 to-green-500/30',
  },
  Air: {
    bg: 'bg-sky-500/20',
    text: 'text-sky-400',
    gradient: 'from-sky-500/30 to-indigo-500/30',
  },
};

export function ZodiacPlanetCard({ data }: ZodiacPlanetCardProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('zodiac');

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const elementStyle = ELEMENT_COLORS[data.zodiac.element] || ELEMENT_COLORS.Fire;

  const getCompatibilityColor = (score: number) => {
    if (score >= 75) return 'text-emerald-400';
    if (score >= 50) return 'text-cyan-400';
    return 'text-amber-400';
  };

  return (
    <GlassCard className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-gradient-to-br ${elementStyle.gradient}`}>
            <Star className={`w-5 h-5 ${elementStyle.text}`} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Zodiac & Planetary Influence</h3>
            <p className="text-sm text-slate-400">Astrological numerology insights</p>
          </div>
        </div>
      </div>

      {/* Zodiac Sign */}
      <div className="border-b border-slate-700/50">
        <button
          onClick={() => toggleSection('zodiac')}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${elementStyle.gradient} flex items-center justify-center`}>
              <span className="text-2xl">{data.zodiac.symbol}</span>
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">{data.zodiac.sign}</span>
                <span className={`px-2 py-0.5 rounded-full ${elementStyle.bg} ${elementStyle.text} text-xs font-medium`}>
                  {data.zodiac.element}
                </span>
              </div>
              <span className="text-sm text-slate-400">
                Ruling Planet: {data.zodiac.ruling_planet} • Number: {data.zodiac.ruling_number}
              </span>
            </div>
          </div>
          {expandedSection === 'zodiac' ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </button>
        
        <AnimatePresence>
          {expandedSection === 'zodiac' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-4 pb-4"
            >
              <div className="p-4 rounded-lg bg-slate-800/50 space-y-4">
                {/* Traits */}
                <div>
                  <span className="text-xs text-slate-500 uppercase">Key Traits</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {data.zodiac.traits.map((trait, idx) => (
                      <span key={idx} className={`px-2 py-1 rounded ${elementStyle.bg} ${elementStyle.text} text-xs`}>
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Compatible Numbers */}
                <div>
                  <span className="text-xs text-slate-500 uppercase">Compatible Numbers</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {data.zodiac.compatible_numbers.map((num, idx) => (
                      <span key={idx} className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-white text-sm font-medium">
                        {num}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Compatibility Analysis */}
                <div className="pt-3 border-t border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500 uppercase">Life Path Compatibility</span>
                    <span className={`font-bold ${getCompatibilityColor(data.compatibility.compatibility_score)}`}>
                      {data.compatibility.compatibility_score}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-700 overflow-hidden mb-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${data.compatibility.compatibility_score}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-full rounded-full ${
                        data.compatibility.compatibility_score >= 75 
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                          : data.compatibility.compatibility_score >= 50
                          ? 'bg-gradient-to-r from-cyan-500 to-cyan-400'
                          : 'bg-gradient-to-r from-amber-500 to-amber-400'
                      }`}
                    />
                  </div>
                  <p className="text-sm text-slate-400">
                    {data.compatibility.compatibility_level}
                    {data.compatibility.is_aligned && (
                      <span className="ml-2 text-emerald-400">✓ Perfect Alignment</span>
                    )}
                  </p>
                  <p className="text-sm text-slate-300 mt-2">
                    {data.compatibility.analysis}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Ruling Planets */}
      <div className="border-b border-slate-700/50">
        <button
          onClick={() => toggleSection('planets')}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/30 to-yellow-500/30 flex items-center justify-center">
              <Sun className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-left">
              <span className="font-semibold text-white">Ruling Planets</span>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span>{data.planets.life_path_planet.planet}</span>
                <span>•</span>
                <span>{data.planets.birth_day_planet.planet}</span>
              </div>
            </div>
          </div>
          {expandedSection === 'planets' ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </button>
        
        <AnimatePresence>
          {expandedSection === 'planets' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-4 pb-4"
            >
              <div className="space-y-3">
                {/* Life Path Planet */}
                <div className="p-4 rounded-lg bg-slate-800/50">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{data.planets.life_path_planet.symbol}</span>
                    <div>
                      <span className="font-semibold text-amber-300">{data.planets.life_path_planet.planet}</span>
                      <span className="text-sm text-slate-400 ml-2">(Life Path)</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {data.planets.life_path_planet.traits.map((trait, idx) => (
                      <span key={idx} className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 text-xs">
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Birth Day Planet */}
                <div className="p-4 rounded-lg bg-slate-800/50">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{data.planets.birth_day_planet.symbol}</span>
                    <div>
                      <span className="font-semibold text-violet-300">{data.planets.birth_day_planet.planet}</span>
                      <span className="text-sm text-slate-400 ml-2">(Birth Day)</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {data.planets.birth_day_planet.traits.map((trait, idx) => (
                      <span key={idx} className="px-2 py-1 rounded bg-violet-500/20 text-violet-300 text-xs">
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Lucky Elements */}
      <div className="border-b border-slate-700/50">
        <button
          onClick={() => toggleSection('lucky')}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/30 to-teal-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-left">
              <span className="font-semibold text-white">Lucky Elements</span>
              <span className="text-sm text-slate-400 block">Day, Color & Gemstone</span>
            </div>
          </div>
          {expandedSection === 'lucky' ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </button>
        
        <AnimatePresence>
          {expandedSection === 'lucky' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-4 pb-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-lg bg-slate-800/50 text-center">
                  <Calendar className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                  <span className="text-xs text-slate-500 uppercase block">Lucky Day</span>
                  <span className="text-white font-medium">{data.lucky_elements.day}</span>
                </div>
                <div className="p-4 rounded-lg bg-slate-800/50 text-center">
                  <Palette className="w-6 h-6 text-pink-400 mx-auto mb-2" />
                  <span className="text-xs text-slate-500 uppercase block">Lucky Color</span>
                  <span className="text-white font-medium">{data.lucky_elements.color}</span>
                </div>
                <div className="p-4 rounded-lg bg-slate-800/50 text-center">
                  <Gem className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <span className="text-xs text-slate-500 uppercase block">Gemstone</span>
                  <span className="text-white font-medium">{data.lucky_elements.gemstone}</span>
                </div>
                <div className="p-4 rounded-lg bg-slate-800/50 text-center">
                  <Star className={`w-6 h-6 ${elementStyle.text} mx-auto mb-2`} />
                  <span className="text-xs text-slate-500 uppercase block">Element</span>
                  <span className="text-white font-medium">{data.lucky_elements.element}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Current Planetary Period */}
      {data.planetary_periods && data.planetary_periods.length > 0 && (
        <div className="p-4">
          <button
            onClick={() => toggleSection('periods')}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500/30 to-purple-500/30 flex items-center justify-center">
                <MoonIcon className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="text-left">
                <span className="font-semibold text-white">Current Planetary Period</span>
                <span className="text-sm text-slate-400 block">
                  {data.planetary_periods.find(p => p.is_current)?.planet || 'Unknown'}
                </span>
              </div>
            </div>
            {expandedSection === 'periods' ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </button>
          
          <AnimatePresence>
            {expandedSection === 'periods' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4"
              >
                <div className="grid grid-cols-3 gap-2">
                  {data.planetary_periods.map((period, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg text-center transition-all ${
                        period.is_current 
                          ? 'bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-indigo-500/50 ring-2 ring-indigo-500/30' 
                          : 'bg-slate-800/50'
                      }`}
                    >
                      <span className="text-xl block mb-1">{period.symbol}</span>
                      <span className={`text-xs font-medium ${period.is_current ? 'text-indigo-300' : 'text-slate-400'}`}>
                        {period.planet}
                      </span>
                      {period.is_current && (
                        <span className="block text-[10px] text-indigo-400 mt-1">CURRENT</span>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </GlassCard>
  );
}

export default ZodiacPlanetCard;

