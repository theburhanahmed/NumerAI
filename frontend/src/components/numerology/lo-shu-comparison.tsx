'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { SpaceCard } from '@/components/space/space-card';
import { LoShuGridInteractive } from './lo-shu-grid-interactive';

interface LoShuComparisonProps {
  comparison: {
    person1_name: string;
    person2_name: string;
    compatibility_score: number;
    position_comparison: {
      matching: number[];
      complementary: number[];
      conflicting: number[];
    };
    matching_positions: number;
    complementary_positions: number;
    conflicting_positions: number;
    common_strength_arrows: string[];
    common_weakness_arrows: string[];
    insights: string[];
    recommendations: string[];
  };
  grid1: any;
  grid2: any;
}

export function LoShuComparison({ comparison, grid1, grid2 }: LoShuComparisonProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Challenging';
  };

  return (
    <div className="space-y-6">
      {/* Compatibility Score */}
      <SpaceCard variant="premium" className="p-6" glow>
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Users className="w-8 h-8 text-cyan-400" />
            <h3 className="text-2xl font-bold text-white">Grid Compatibility</h3>
          </div>
          <div className={`text-6xl font-bold mb-2 ${getScoreColor(comparison.compatibility_score)}`}>
            {comparison.compatibility_score}
          </div>
          <p className={`text-xl font-semibold ${getScoreColor(comparison.compatibility_score)}`}>
            {getScoreLabel(comparison.compatibility_score)}
          </p>
          <p className="text-white/70 mt-2">
            {comparison.person1_name} & {comparison.person2_name}
          </p>
        </div>
      </SpaceCard>

      {/* Side-by-side Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-lg font-semibold text-white mb-4 text-center">
            {comparison.person1_name}
          </h4>
          <LoShuGridInteractive gridData={grid1} />
        </div>
        <div>
          <h4 className="text-lg font-semibold text-white mb-4 text-center">
            {comparison.person2_name}
          </h4>
          <LoShuGridInteractive gridData={grid2} />
        </div>
      </div>

      {/* Position Comparison */}
      <SpaceCard variant="premium" className="p-6" glow>
        <h3 className="text-xl font-bold text-white mb-4">Position Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/30">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <h4 className="font-semibold text-white">Matching</h4>
            </div>
            <p className="text-2xl font-bold text-green-400 mb-1">
              {comparison.matching_positions}
            </p>
            <p className="text-white/70 text-sm">
              {comparison.position_comparison.matching.length > 0
                ? `Numbers: ${comparison.position_comparison.matching.join(', ')}`
                : 'No matching positions'}
            </p>
          </div>

          <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/30">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              <h4 className="font-semibold text-white">Complementary</h4>
            </div>
            <p className="text-2xl font-bold text-yellow-400 mb-1">
              {comparison.complementary_positions}
            </p>
            <p className="text-white/70 text-sm">
              {comparison.position_comparison.complementary.length > 0
                ? `Numbers: ${comparison.position_comparison.complementary.join(', ')}`
                : 'No complementary positions'}
            </p>
          </div>

          <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/30">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-5 h-5 text-red-400" />
              <h4 className="font-semibold text-white">Conflicting</h4>
            </div>
            <p className="text-2xl font-bold text-red-400 mb-1">
              {comparison.conflicting_positions}
            </p>
            <p className="text-white/70 text-sm">
              {comparison.position_comparison.conflicting.length > 0
                ? `Numbers: ${comparison.position_comparison.conflicting.join(', ')}`
                : 'No conflicting positions'}
            </p>
          </div>
        </div>
      </SpaceCard>

      {/* Insights */}
      {comparison.insights.length > 0 && (
        <SpaceCard variant="premium" className="p-6" glow>
          <h3 className="text-xl font-bold text-white mb-4">Insights</h3>
          <ul className="space-y-2">
            {comparison.insights.map((insight, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                <p className="text-white/90">{insight}</p>
              </li>
            ))}
          </ul>
        </SpaceCard>
      )}

      {/* Recommendations */}
      {comparison.recommendations.length > 0 && (
        <SpaceCard variant="premium" className="p-6" glow>
          <h3 className="text-xl font-bold text-white mb-4">Recommendations</h3>
          <ul className="space-y-2">
            {comparison.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-purple-400 mt-2 flex-shrink-0" />
                <p className="text-white/90">{recommendation}</p>
              </li>
            ))}
          </ul>
        </SpaceCard>
      )}
    </div>
  );
}

