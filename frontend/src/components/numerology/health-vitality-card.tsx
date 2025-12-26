'use client';

import React from 'react';
import { SpaceCard } from '@/components/space/space-card';
import { TrendingUp, Activity } from 'lucide-react';

interface HealthVitalityCardProps {
  vitalityNumber: number;
  healthScore?: number;
}

export function HealthVitalityCard({ vitalityNumber, healthScore }: HealthVitalityCardProps) {
  const getVitalityLevel = (num: number) => {
    if (num >= 7) return { level: 'High', color: 'text-green-400' };
    if (num >= 4) return { level: 'Moderate', color: 'text-yellow-400' };
    return { level: 'Low', color: 'text-red-400' };
  };

  const vitality = getVitalityLevel(vitalityNumber);

  return (
    <SpaceCard variant="premium" className="p-6" glow>
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
          <Activity className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Vitality Number</h3>
          <p className="text-white/70 text-sm">Your energy and vitality level</p>
        </div>
      </div>
      
      <div className="text-center">
        <div className={`text-6xl font-bold mb-2 ${vitality.color}`}>
          {vitalityNumber}
        </div>
        <p className={`text-lg font-semibold ${vitality.color}`}>
          {vitality.level} Vitality
        </p>
      </div>

      {healthScore !== undefined && (
        <div className="mt-4 pt-4 border-t border-cyan-500/20">
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm">Health Score</span>
            <span className="text-white font-semibold">{healthScore}/100</span>
          </div>
          <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${
                healthScore >= 75 ? 'from-green-500 to-emerald-600' :
                healthScore >= 60 ? 'from-yellow-500 to-orange-600' :
                'from-red-500 to-orange-600'
              }`}
              style={{ width: `${healthScore}%` }}
            />
          </div>
        </div>
      )}
    </SpaceCard>
  );
}

