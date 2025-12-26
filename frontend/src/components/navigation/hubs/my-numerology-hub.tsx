'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { HubLayout, HubTab } from './hub-layout';
import { TrendingUpIcon, StarIcon, HashIcon, MountainIcon, Grid3x3Icon, SparklesIcon } from 'lucide-react';
import { SpaceCard } from '@/components/space/space-card';
import { TouchOptimizedButton } from '@/components/buttons/touch-optimized-button';

const tabs: HubTab[] = [
  { id: 'life-path', label: 'Life Path', path: '/life-path', icon: TrendingUpIcon },
  { id: 'birth-chart', label: 'Birth Chart', path: '/birth-chart', icon: StarIcon },
  { id: 'all-numbers', label: 'All Numbers', path: '/my-numerology/all-numbers', icon: HashIcon },
  { id: 'pinnacles', label: 'Pinnacles & Challenges', path: '/my-numerology/pinnacles', icon: MountainIcon },
  { id: 'lo-shu', label: 'Lo Shu Grid', path: '/lo-shu-grid', icon: Grid3x3Icon },
  { id: 'karmic', label: 'Karmic Analysis', path: '/my-numerology/karmic', icon: SparklesIcon },
];

export function MyNumerologyHub({ children }: { children?: React.ReactNode }) {
  const router = useRouter();

  if (children) {
    return (
      <HubLayout
        title="My Numerology"
        description="Your complete numerology profile and analysis"
        tabs={tabs}
      >
        {children}
      </HubLayout>
    );
  }

  return (
    <HubLayout
      title="My Numerology"
      description="Your complete numerology profile and analysis"
      tabs={tabs}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <SpaceCard
              key={tab.id}
              variant="premium"
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push(tab.path)}
              glow
            >
              <div className="flex items-center gap-4 mb-4">
                {Icon && (
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                )}
                <h3 className="text-xl font-semibold text-white">{tab.label}</h3>
              </div>
              <p className="text-white/70 text-sm">
                {tab.id === 'life-path' && 'Discover your life purpose and direction'}
                {tab.id === 'birth-chart' && 'View your complete numerology chart'}
                {tab.id === 'all-numbers' && 'See all your numerology numbers'}
                {tab.id === 'pinnacles' && 'Explore your life cycles and challenges'}
                {tab.id === 'lo-shu' && 'Interactive Lo Shu Grid analysis'}
                {tab.id === 'karmic' && 'Understand your karmic debts and lessons'}
              </p>
            </SpaceCard>
          );
        })}
      </div>
    </HubLayout>
  );
}

