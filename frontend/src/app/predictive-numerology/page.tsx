'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { predictiveNumerologyAPI } from '@/lib/numerology-api';
import { SpaceCard } from '@/components/space/space-card';
import { TouchOptimizedButton } from '@/components/buttons/touch-optimized-button';
import { CosmicPageLayout } from '@/components/cosmic/cosmic-page-layout';
import { Loader2, TrendingUp, AlertTriangle, Calendar, Target, Sparkles } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { NineYearCycleForecast } from '@/components/numerology/9-year-cycle-forecast';
import { BreakthroughYears } from '@/components/numerology/breakthrough-years';
import { CrisisAlerts } from '@/components/numerology/crisis-alerts';
import { OpportunityWindows } from '@/components/numerology/opportunity-windows';
import { LifeMilestones } from '@/components/numerology/life-milestones';
import { YearlyForecastReport } from '@/components/numerology/yearly-forecast-report';

type TabType = 'overview' | '9-year-cycle' | 'breakthroughs' | 'crises' | 'opportunities' | 'milestones' | 'yearly-forecast';

export default function PredictiveNumerologyPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [predictiveData, setPredictiveData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchPredictiveData();
  }, [isAuthenticated, router]);

  const fetchPredictiveData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await predictiveNumerologyAPI.getPredictiveProfile({ forecast_years: 20 });
      setPredictiveData(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to load predictive numerology';
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
            <p className="text-white/70">Loading Predictive Numerology...</p>
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
            <TouchOptimizedButton onClick={fetchPredictiveData} variant="primary">Retry</TouchOptimizedButton>
          </SpaceCard>
        </div>
      </CosmicPageLayout>
    );
  }

  if (!predictiveData) {
    return (
      <CosmicPageLayout>
        <div className="flex items-center justify-center min-h-[60vh] p-4">
          <SpaceCard variant="elevated" className="p-6 max-w-md text-center">
            <h2 className="text-xl font-bold text-white mb-4">
              Predictive Numerology Not Available
            </h2>
            <p className="text-white/70 mb-4">
              Please calculate your numerology profile first.
            </p>
            <TouchOptimizedButton 
              onClick={() => router.push('/birth-chart')} 
              variant="primary"
            >
              Calculate Profile
            </TouchOptimizedButton>
          </SpaceCard>
        </div>
      </CosmicPageLayout>
    );
  }

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: Target },
    { id: '9-year-cycle' as TabType, label: '9-Year Cycles', icon: Calendar },
    { id: 'breakthroughs' as TabType, label: 'Breakthroughs', icon: TrendingUp },
    { id: 'crises' as TabType, label: 'Crises', icon: AlertTriangle },
    { id: 'opportunities' as TabType, label: 'Opportunities', icon: Sparkles },
    { id: 'milestones' as TabType, label: 'Milestones', icon: Target },
    { id: 'yearly-forecast' as TabType, label: 'Yearly Forecast', icon: Calendar },
  ];

  return (
    <CosmicPageLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Predictive Numerology</h1>
            <p className="text-white/70">Forecast your future cycles, breakthroughs, and life milestones</p>
          </div>

          {/* Tab Navigation */}
          <div className="mb-6 border-b border-white/10">
            <nav className="flex space-x-1 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors
                      border-b-2 whitespace-nowrap
                      ${activeTab === tab.id
                        ? 'border-cyan-500 text-cyan-400'
                        : 'border-transparent text-white/60 hover:text-white/80 hover:border-white/20'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <SpaceCard variant="elevated" className="p-6">
                  <h2 className="text-2xl font-bold text-white mb-4">Predictive Overview</h2>
                  {predictiveData.summary && (
                    <p className="text-white/80 mb-6 leading-relaxed">
                      {predictiveData.summary}
                    </p>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                    {predictiveData.breakthrough_years && predictiveData.breakthrough_years.length > 0 && (
                      <SpaceCard variant="outlined" className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-5 h-5 text-green-400" />
                          <h3 className="text-lg font-semibold text-white">Breakthroughs</h3>
                        </div>
                        <p className="text-white/70">{predictiveData.breakthrough_years.length} year(s)</p>
                      </SpaceCard>
                    )}
                    
                    {predictiveData.crisis_years && predictiveData.crisis_years.length > 0 && (
                      <SpaceCard variant="outlined" className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-5 h-5 text-yellow-400" />
                          <h3 className="text-lg font-semibold text-white">Crisis Years</h3>
                        </div>
                        <p className="text-white/70">{predictiveData.crisis_years.length} year(s)</p>
                      </SpaceCard>
                    )}
                    
                    {predictiveData.opportunity_periods && predictiveData.opportunity_periods.length > 0 && (
                      <SpaceCard variant="outlined" className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-5 h-5 text-purple-400" />
                          <h3 className="text-lg font-semibold text-white">Opportunities</h3>
                        </div>
                        <p className="text-white/70">{predictiveData.opportunity_periods.length} period(s)</p>
                      </SpaceCard>
                    )}
                    
                    {predictiveData.nine_year_cycles && predictiveData.nine_year_cycles.length > 0 && (
                      <SpaceCard variant="outlined" className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-5 h-5 text-cyan-400" />
                          <h3 className="text-lg font-semibold text-white">9-Year Cycles</h3>
                        </div>
                        <p className="text-white/70">{predictiveData.nine_year_cycles.length} cycle(s)</p>
                      </SpaceCard>
                    )}
                  </div>
                </SpaceCard>
              </motion.div>
            )}

            {activeTab === '9-year-cycle' && (
              <NineYearCycleForecast />
            )}

            {activeTab === 'breakthroughs' && (
              <BreakthroughYears />
            )}

            {activeTab === 'crises' && (
              <CrisisAlerts />
            )}

            {activeTab === 'opportunities' && (
              <OpportunityWindows />
            )}

            {activeTab === 'milestones' && (
              <LifeMilestones />
            )}

            {activeTab === 'yearly-forecast' && (
              <YearlyForecastReport />
            )}
          </div>
        </motion.div>
      </div>
    </CosmicPageLayout>
  );
}

