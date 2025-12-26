'use client';

import React from 'react';
import { SpaceCard } from '@/components/space/space-card';
import { Calendar, TrendingUp, TrendingDown } from 'lucide-react';

interface HealthCyclesProps {
  cycles: Array<{
    year: number;
    personal_year: number;
    health_score: number;
    risk_level: string;
    vitality_level: string;
    stress_level: string;
    recommendations: string[];
  }>;
}

export function HealthCycles({ cycles }: HealthCyclesProps) {
  return (
    <div className="space-y-4">
      {cycles.map((cycle, index) => (
        <SpaceCard key={index} variant="premium" className="p-6" glow>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white">Year {cycle.year}</h4>
                <p className="text-white/70 text-sm">Personal Year {cycle.personal_year}</p>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold mb-1 ${
                cycle.health_score >= 75 ? 'text-green-400' :
                cycle.health_score >= 60 ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {cycle.health_score}
              </div>
              <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                cycle.risk_level === 'low' ? 'bg-green-500/20 text-green-300' :
                cycle.risk_level === 'moderate' ? 'bg-yellow-500/20 text-yellow-300' :
                cycle.risk_level === 'elevated' ? 'bg-orange-500/20 text-orange-300' :
                'bg-red-500/20 text-red-300'
              }`}>
                {cycle.risk_level.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-white/70 text-sm mb-1">Vitality</p>
              <div className="flex items-center gap-2">
                {cycle.vitality_level === 'high' ? (
                  <TrendingUp className="w-4 h-4 text-green-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-yellow-400" />
                )}
                <span className="text-white font-semibold capitalize">{cycle.vitality_level}</span>
              </div>
            </div>
            <div>
              <p className="text-white/70 text-sm mb-1">Stress</p>
              <div className="flex items-center gap-2">
                {cycle.stress_level === 'high' ? (
                  <TrendingUp className="w-4 h-4 text-red-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-green-400" />
                )}
                <span className="text-white font-semibold capitalize">{cycle.stress_level}</span>
              </div>
            </div>
          </div>

          {cycle.recommendations && cycle.recommendations.length > 0 && (
            <div className="pt-4 border-t border-cyan-500/20">
              <p className="text-white/70 text-sm mb-2">Recommendations:</p>
              <ul className="space-y-1">
                {cycle.recommendations.map((rec, i) => (
                  <li key={i} className="text-white/90 text-sm flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </SpaceCard>
      ))}
    </div>
  );
}

