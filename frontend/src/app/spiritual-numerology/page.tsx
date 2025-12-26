'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { spiritualNumerologyAPI } from '@/lib/numerology-api';
import { SpaceCard } from '@/components/space/space-card';
import { TouchOptimizedButton } from '@/components/buttons/touch-optimized-button';
import { CosmicPageLayout } from '@/components/cosmic/cosmic-page-layout';
import { Loader2, Sparkles, AlertTriangle, Scroll } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { SoulContracts } from '@/components/numerology/soul-contracts';
import { KarmicTimeline } from '@/components/numerology/karmic-timeline';
import { RebirthCycles } from '@/components/numerology/rebirth-cycles';
import { DivineGifts } from '@/components/numerology/divine-gifts';
import { MeditationTiming } from '@/components/numerology/meditation-timing';

type TabType = 'overview' | 'soul-contracts' | 'karmic-timeline' | 'rebirth-cycles' | 'divine-gifts' | 'meditation';

export default function SpiritualNumerologyPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [spiritualData, setSpiritualData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchSpiritualData();
  }, [isAuthenticated, router]);

  const fetchSpiritualData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await spiritualNumerologyAPI.getSpiritualProfile();
      setSpiritualData(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to load spiritual numerology';
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
            <p className="text-white/70">Loading Spiritual Numerology...</p>
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
            <TouchOptimizedButton onClick={fetchSpiritualData} variant="primary">Retry</TouchOptimizedButton>
          </SpaceCard>
        </div>
      </CosmicPageLayout>
    );
  }

  if (!spiritualData) {
    return (
      <CosmicPageLayout>
        <div className="flex items-center justify-center min-h-[60vh] p-4">
          <SpaceCard variant="elevated" className="p-6 max-w-md text-center">
            <h2 className="text-xl font-bold text-white mb-4">
              Spiritual Numerology Not Available
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
    { id: 'overview' as TabType, label: 'Overview', icon: Scroll },
    { id: 'soul-contracts' as TabType, label: 'Soul Contracts', icon: Sparkles },
    { id: 'karmic-timeline' as TabType, label: 'Karmic Timeline', icon: Scroll },
    { id: 'rebirth-cycles' as TabType, label: 'Rebirth Cycles', icon: Sparkles },
    { id: 'divine-gifts' as TabType, label: 'Divine Gifts', icon: Sparkles },
    { id: 'meditation' as TabType, label: 'Meditation Timing', icon: Sparkles },
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
            <h1 className="text-4xl font-bold text-white mb-2">Spiritual Numerology</h1>
            <p className="text-white/70">Discover your soul contracts, karmic cycles, and spiritual path</p>
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
                  <h2 className="text-2xl font-bold text-white mb-4">Spiritual Overview</h2>
                  {spiritualData.interpretation && (
                    <p className="text-white/80 mb-6 leading-relaxed">
                      {spiritualData.interpretation}
                    </p>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                    {spiritualData.soul_contracts && spiritualData.soul_contracts.length > 0 && (
                      <SpaceCard variant="outlined" className="p-4">
                        <h3 className="text-lg font-semibold text-white mb-2">Soul Contracts</h3>
                        <p className="text-white/70">{spiritualData.soul_contracts.length} contract(s) identified</p>
                      </SpaceCard>
                    )}
                    
                    {spiritualData.divine_gifts && spiritualData.divine_gifts.length > 0 && (
                      <SpaceCard variant="outlined" className="p-4">
                        <h3 className="text-lg font-semibold text-white mb-2">Divine Gifts</h3>
                        <p className="text-white/70">{spiritualData.divine_gifts.length} gift(s) discovered</p>
                      </SpaceCard>
                    )}
                    
                    {spiritualData.karmic_cycles && spiritualData.karmic_cycles.length > 0 && (
                      <SpaceCard variant="outlined" className="p-4">
                        <h3 className="text-lg font-semibold text-white mb-2">Karmic Cycles</h3>
                        <p className="text-white/70">{spiritualData.karmic_cycles.length} cycle(s) active</p>
                      </SpaceCard>
                    )}
                  </div>
                </SpaceCard>
              </motion.div>
            )}

            {activeTab === 'soul-contracts' && (
              <SoulContracts />
            )}

            {activeTab === 'karmic-timeline' && (
              <KarmicTimeline />
            )}

            {activeTab === 'rebirth-cycles' && (
              <RebirthCycles />
            )}

            {activeTab === 'divine-gifts' && (
              <DivineGifts />
            )}

            {activeTab === 'meditation' && (
              <MeditationTiming />
            )}
          </div>
        </motion.div>
      </div>
    </CosmicPageLayout>
  );
}

