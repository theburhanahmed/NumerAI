'use client';

import React from 'react';
import { SpaceCard } from '@/components/space/space-card';
import { AlertTriangle, Shield } from 'lucide-react';

interface HealthRiskAlertsProps {
  riskPeriods: Array<{
    year: number;
    risk_level: string;
    health_score: number;
    stress_level: string;
    warnings: string[];
    preventive_measures: string[];
  }>;
}

export function HealthRiskAlerts({ riskPeriods }: HealthRiskAlertsProps) {
  if (!riskPeriods || riskPeriods.length === 0) {
    return (
      <SpaceCard variant="premium" className="p-6 text-center" glow>
        <Shield className="w-12 h-12 text-green-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Risk Periods Identified</h3>
        <p className="text-white/70">
          Your health cycles show no major risk periods in the analyzed timeframe.
        </p>
      </SpaceCard>
    );
  }

  return (
    <div className="space-y-4">
      {riskPeriods.map((risk, index) => (
        <SpaceCard
          key={index}
          variant="premium"
          className={`p-6 ${
            risk.risk_level === 'high' ? 'border-2 border-red-500/50' : 'border border-orange-500/30'
          }`}
          glow
        >
          <div className="flex items-start gap-4 mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
              risk.risk_level === 'high' ? 'bg-red-500/20' : 'bg-orange-500/20'
            }`}>
              <AlertTriangle className={`w-6 h-6 ${
                risk.risk_level === 'high' ? 'text-red-400' : 'text-orange-400'
              }`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xl font-semibold text-white">Year {risk.year}</h4>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  risk.risk_level === 'high' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                  'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                }`}>
                  {risk.risk_level.toUpperCase()} RISK
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-white/70 text-sm">Health Score</p>
                  <p className="text-2xl font-bold text-red-400">{risk.health_score}</p>
                </div>
                <div>
                  <p className="text-white/70 text-sm">Stress Level</p>
                  <p className="text-lg font-semibold text-orange-400 capitalize">{risk.stress_level}</p>
                </div>
              </div>
            </div>
          </div>

          {risk.warnings && risk.warnings.length > 0 && (
            <div className="mb-4 p-4 bg-red-500/10 rounded-lg border border-red-500/20">
              <p className="text-red-300 font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Warnings
              </p>
              <ul className="space-y-1">
                {risk.warnings.map((warning, i) => (
                  <li key={i} className="text-white/90 text-sm flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {risk.preventive_measures && risk.preventive_measures.length > 0 && (
            <div className="p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
              <p className="text-cyan-300 font-semibold mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Preventive Measures
              </p>
              <ul className="space-y-1">
                {risk.preventive_measures.map((measure, i) => (
                  <li key={i} className="text-white/90 text-sm flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                    {measure}
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

