'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { numerologyAPI } from '@/lib/numerology-api';
import { SpaceCard } from '@/components/space/space-card';
import { TouchOptimizedButton } from '@/components/buttons/touch-optimized-button';
import { CosmicPageLayout } from '@/components/cosmic/cosmic-page-layout';
import { Loader2, Heart, AlertTriangle, Calendar, TrendingUp, Activity } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';

export default function HealthNumerologyPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [healthData, setHealthData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'cycles' | 'risks' | 'wellness' | 'vulnerabilities'>('overview');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchHealthData();
  }, [isAuthenticated, router]);

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await numerologyAPI.getHealthAnalysis();
      setHealthData(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to load health numerology';
      setError(errorMessage);
      
      if (err.response?.status === 403) {
        toast({
          title: 'Upgrade Required',
          description: errorMessage,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <CosmicPageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-cyan-500" />
            <p className="text-white/70">Loading Health Numerology...</p>
          </div>
        </div>
      </CosmicPageLayout>
    );
  }

  if (error) {
    return (
      <CosmicPageLayout>
        <div className="flex items-center justify-center min-h-[60vh] p-4">
          <SpaceCard variant="elevated" className="p-6 max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <h2 className="text-xl font-bold text-white">Error</h2>
            </div>
            <p className="text-white/70 mb-4">{error}</p>
            <TouchOptimizedButton onClick={fetchHealthData} variant="primary">Retry</TouchOptimizedButton>
          </SpaceCard>
        </div>
      </CosmicPageLayout>
    );
  }

  if (!healthData) {
    return (
      <CosmicPageLayout>
        <div className="flex items-center justify-center min-h-[60vh] p-4">
          <SpaceCard variant="elevated" className="p-6 max-w-md text-center">
            <h2 className="text-xl font-bold text-white mb-4">
              Health Numerology Not Available
            </h2>
            <p className="text-white/70 mb-4">
              Please calculate your numerology profile first.
            </p>
            <TouchOptimizedButton onClick={() => router.push('/birth-chart')} variant="primary">
              Calculate Profile
            </TouchOptimizedButton>
          </SpaceCard>
        </div>
      </CosmicPageLayout>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'cycles', label: 'Health Cycles', icon: TrendingUp },
    { id: 'risks', label: 'Risk Periods', icon: AlertTriangle },
    { id: 'wellness', label: 'Wellness Windows', icon: Heart },
    { id: 'vulnerabilities', label: 'Emotional', icon: Heart },
  ];

  return (
    <CosmicPageLayout>
      <div className="max-w-6xl mx-auto space-y-6 p-4 md:p-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Health Numerology
          </h1>
          <p className="text-white/70">
            Understand your health patterns, vitality cycles, and optimal wellness windows
          </p>
        </div>

        {/* Health Numbers Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SpaceCard variant="premium" className="p-6" glow>
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                {healthData.health_numbers?.vitality_number || '—'}
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">Vitality Number</h3>
              <p className="text-white/70 text-sm">Your energy and vitality level</p>
            </div>
          </SpaceCard>

          <SpaceCard variant="premium" className="p-6" glow>
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                {healthData.health_numbers?.health_number || '—'}
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">Health Number</h3>
              <p className="text-white/70 text-sm">Your overall health pattern</p>
            </div>
          </SpaceCard>

          <SpaceCard variant="premium" className="p-6" glow>
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-2">
                {healthData.health_numbers?.stress_number || '—'}
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">Stress Number</h3>
              <p className="text-white/70 text-sm">Your stress indicators</p>
            </div>
          </SpaceCard>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-cyan-500/20 pb-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  px-6 py-3 rounded-xl font-medium transition-all
                  flex items-center gap-2
                  ${isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-white/70 hover:text-white hover:bg-[#1a2942]/60'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <SpaceCard variant="premium" className="p-6" glow>
                <h3 className="text-xl font-bold text-white mb-4">Overall Assessment</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-white/70 text-sm mb-1">Health Trend</p>
                    <p className="text-white font-semibold capitalize">
                      {healthData.overall_assessment?.health_trend || 'Stable'}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/70 text-sm mb-1">Risk Periods Identified</p>
                    <p className="text-white font-semibold">
                      {healthData.overall_assessment?.current_risk_level || 0}
                    </p>
                  </div>
                  {healthData.overall_assessment?.next_wellness_window && (
                    <div>
                      <p className="text-white/70 text-sm mb-1">Next Wellness Window</p>
                      <p className="text-white font-semibold">
                        Year {healthData.overall_assessment.next_wellness_window.year}
                      </p>
                    </div>
                  )}
                </div>
              </SpaceCard>
            </div>
          )}

          {activeTab === 'cycles' && healthData.health_cycles && (
            <div className="space-y-4">
              {healthData.health_cycles.yearly_health_analysis?.slice(0, 10).map((year: any, index: number) => (
                <SpaceCard key={index} variant="premium" className="p-6" glow>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-1">Year {year.year}</h4>
                      <p className="text-white/70 text-sm">Personal Year {year.personal_year}</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        year.health_score >= 75 ? 'text-green-400' :
                        year.health_score >= 60 ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {year.health_score}
                      </div>
                      <p className="text-white/70 text-xs capitalize">{year.risk_level}</p>
                    </div>
                  </div>
                </SpaceCard>
              ))}
            </div>
          )}

          {activeTab === 'risks' && healthData.risk_cycles && (
            <div className="space-y-4">
              {healthData.risk_cycles.risk_periods?.map((risk: any, index: number) => (
                <SpaceCard key={index} variant="premium" className="p-6 border border-red-500/30" glow>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-1">Year {risk.year}</h4>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        risk.risk_level === 'high' ? 'bg-red-500/20 text-red-300' :
                        'bg-orange-500/20 text-orange-300'
                      }`}>
                        {risk.risk_level.toUpperCase()} RISK
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-red-400">{risk.health_score}</div>
                    </div>
                  </div>
                  {risk.warnings && risk.warnings.length > 0 && (
                    <div className="mb-4">
                      <p className="text-white/70 text-sm mb-2">Warnings:</p>
                      <ul className="space-y-1">
                        {risk.warnings.map((warning: string, i: number) => (
                          <li key={i} className="text-white/90 text-sm flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                            {warning}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {risk.preventive_measures && risk.preventive_measures.length > 0 && (
                    <div>
                      <p className="text-white/70 text-sm mb-2">Preventive Measures:</p>
                      <ul className="space-y-1">
                        {risk.preventive_measures.map((measure: string, i: number) => (
                          <li key={i} className="text-white/90 text-sm flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                            {measure}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </SpaceCard>
              ))}
            </div>
          )}

          {activeTab === 'wellness' && healthData.wellness_windows && (
            <div className="space-y-4">
              {healthData.wellness_windows.wellness_windows?.map((window: any, index: number) => (
                <SpaceCard key={index} variant="premium" className="p-6 border border-green-500/30" glow>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-1">Year {window.year}</h4>
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-300">
                        OPTIMAL WELLNESS WINDOW
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-400">{window.health_score}</div>
                    </div>
                  </div>
                  {window.optimal_activities && window.optimal_activities.length > 0 && (
                    <div>
                      <p className="text-white/70 text-sm mb-2">Optimal Activities:</p>
                      <ul className="space-y-1">
                        {window.optimal_activities.map((activity: string, i: number) => (
                          <li key={i} className="text-white/90 text-sm flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-400 mt-2 flex-shrink-0" />
                            {activity}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </SpaceCard>
              ))}
            </div>
          )}

          {activeTab === 'vulnerabilities' && healthData.emotional_vulnerabilities && (
            <div className="space-y-6">
              <SpaceCard variant="premium" className="p-6" glow>
                <h3 className="text-xl font-bold text-white mb-4">Emotional Vulnerabilities</h3>
                {healthData.emotional_vulnerabilities.vulnerabilities?.map((vuln: any, index: number) => (
                  <div key={index} className="mb-4 pb-4 border-b border-cyan-500/20 last:border-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl font-bold text-cyan-400">{vuln.number}</span>
                      <div>
                        <p className="text-white font-semibold">{vuln.source}</p>
                        <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                          vuln.severity === 'high' ? 'bg-red-500/20 text-red-300' :
                          vuln.severity === 'moderate' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-blue-500/20 text-blue-300'
                        }`}>
                          {vuln.severity}
                        </span>
                      </div>
                    </div>
                    <p className="text-white/90">{vuln.vulnerability}</p>
                  </div>
                ))}
              </SpaceCard>

              {healthData.emotional_vulnerabilities.coping_strategies && (
                <SpaceCard variant="premium" className="p-6" glow>
                  <h3 className="text-xl font-bold text-white mb-4">Coping Strategies</h3>
                  <ul className="space-y-2">
                    {healthData.emotional_vulnerabilities.coping_strategies.map((strategy: string, index: number) => (
                      <li key={index} className="text-white/90 flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-400 mt-2 flex-shrink-0" />
                        {strategy}
                      </li>
                    ))}
                  </ul>
                </SpaceCard>
              )}
            </div>
          )}
        </div>
      </div>
    </CosmicPageLayout>
  );
}

