'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { numerologyAPI } from '@/lib/numerology-api';
import { LoShuGrid } from '@/components/numerology/lo-shu-grid';
import { LoShuGridInteractive } from '@/components/numerology/lo-shu-grid-interactive';
import { LoShuArrows } from '@/components/numerology/lo-shu-arrows';
import { LoShuRemedies } from '@/components/numerology/lo-shu-remedies';
import { LoShuComparison } from '@/components/numerology/lo-shu-comparison';
import { SpaceCard } from '@/components/space/space-card';
import { TouchOptimizedButton } from '@/components/buttons/touch-optimized-button';
import { CosmicPageLayout } from '@/components/cosmic/cosmic-page-layout';
import { Loader2, Users, AlertCircle, Grid3x3, ArrowRight, Sparkles, GitCompare } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function LoShuGridPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'grid' | 'arrows' | 'remedies' | 'comparison'>('grid');
  const [gridData, setGridData] = useState<any>(null);
  const [visualizationData, setVisualizationData] = useState<any>(null);
  const [arrowsData, setArrowsData] = useState<any>(null);
  const [remediesData, setRemediesData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [comparing, setComparing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchLoShuGrid();
  }, [isAuthenticated, router]);

  const fetchLoShuGrid = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch basic grid
      const response = await numerologyAPI.getLoShuGrid(true);
      setGridData(response);
      
      // Fetch visualization data
      try {
        const vizData = await numerologyAPI.getLoShuVisualization();
        setVisualizationData(vizData);
      } catch (e) {
        console.log('Visualization data not available');
      }
      
      // Fetch arrows
      try {
        const arrows = await numerologyAPI.getLoShuArrows();
        setArrowsData(arrows);
      } catch (e) {
        console.log('Arrows data not available');
      }
      
      // Fetch remedies
      try {
        const remedies = await numerologyAPI.getLoShuRemedies();
        setRemediesData(remedies);
      } catch (e) {
        console.log('Remedies data not available');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to load Lo Shu Grid';
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

  const handleCompare = async (person2Name: string, person2BirthDate: string) => {
    try {
      setComparing(true);
      const response = await numerologyAPI.compareLoShuGrids(person2Name, person2BirthDate);
      setComparisonData(response);
      setShowComparison(true);
      toast({
        title: 'Success',
        description: 'Grid comparison completed',
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to compare grids';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setComparing(false);
    }
  };

  if (loading) {
    return (
      <CosmicPageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-cyan-500" />
            <p className="text-white/70">Loading Lo Shu Grid...</p>
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
              <AlertCircle className="w-6 h-6 text-red-400" />
              <h2 className="text-xl font-bold text-white">Error</h2>
            </div>
            <p className="text-white/70 mb-4">{error}</p>
            <TouchOptimizedButton onClick={fetchLoShuGrid} variant="primary">Retry</TouchOptimizedButton>
          </SpaceCard>
        </div>
      </CosmicPageLayout>
    );
  }

  if (!gridData) {
    return (
      <CosmicPageLayout>
        <div className="flex items-center justify-center min-h-[60vh] p-4">
          <SpaceCard variant="elevated" className="p-6 max-w-md text-center">
            <h2 className="text-xl font-bold text-white mb-4">
              Lo Shu Grid Not Available
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
    { id: 'grid', label: 'Grid', icon: Grid3x3 },
    { id: 'arrows', label: 'Arrows', icon: ArrowRight },
    { id: 'remedies', label: 'Remedies', icon: Sparkles },
    { id: 'comparison', label: 'Compare', icon: GitCompare },
  ];

  return (
    <CosmicPageLayout>
      <div className="max-w-6xl mx-auto space-y-6 p-4 md:p-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Lo Shu Grid
          </h1>
          <p className="text-white/70">
            Discover your energy patterns and balance through the ancient Chinese numerology grid
          </p>
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
          {activeTab === 'grid' && visualizationData && (
            <LoShuGridInteractive gridData={visualizationData} />
          )}
          
          {activeTab === 'grid' && !visualizationData && gridData && (
            <LoShuGrid gridData={gridData} />
          )}
          
          {activeTab === 'arrows' && arrowsData && (
            <LoShuArrows arrows={arrowsData} />
          )}
          
          {activeTab === 'arrows' && !arrowsData && (
            <SpaceCard variant="premium" className="p-6 text-center" glow>
              <p className="text-white/70">Arrow analysis not available. Please upgrade to Premium.</p>
            </SpaceCard>
          )}
          
          {activeTab === 'remedies' && remediesData && (
            <LoShuRemedies remedies={remediesData} />
          )}
          
          {activeTab === 'remedies' && !remediesData && (
            <SpaceCard variant="premium" className="p-6 text-center" glow>
              <p className="text-white/70">Remedy suggestions not available.</p>
            </SpaceCard>
          )}
          
          {activeTab === 'comparison' && (
            <div className="space-y-4">
              <SpaceCard variant="premium" className="p-6" glow>
                <p className="text-white/70 mb-4">
                  Compare your Lo Shu Grid with another person to see compatibility and shared patterns.
                </p>
                <TouchOptimizedButton
                  onClick={() => setShowComparison(!showComparison)}
                  variant="primary"
                >
                  <Users className="w-4 h-4 mr-2" />
                  {showComparison ? 'Hide' : 'Show'} Comparison
                </TouchOptimizedButton>
              </SpaceCard>
              
              {showComparison && comparisonData && visualizationData && (
                <LoShuComparison
                  comparison={comparisonData}
                  grid1={visualizationData}
                  grid2={visualizationData} // In real implementation, fetch grid2
                />
              )}
            </div>
          )}
        </div>
      </div>
    </CosmicPageLayout>
  );
}
