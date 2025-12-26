'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { HubLayout, HubTab } from './hub-layout';
import { HeartIcon, UsersIcon, Users2Icon } from 'lucide-react';
import { SpaceCard } from '@/components/space/space-card';

const tabs: HubTab[] = [
  { id: 'compatibility', label: 'Compatibility', path: '/compatibility', icon: HeartIcon },
  { id: 'compare', label: 'Compare People', path: '/relationships/compare', icon: UsersIcon },
  { id: 'family', label: 'Family Numerology', path: '/generational-numerology', icon: Users2Icon },
];

export function RelationshipsHub({ children }: { children?: React.ReactNode }) {
  const router = useRouter();

  if (children) {
    return (
      <HubLayout
        title="Relationships"
        description="Analyze compatibility and relationships through numerology"
        tabs={tabs}
      >
        {children}
      </HubLayout>
    );
  }

  return (
    <HubLayout
      title="Relationships"
      description="Analyze compatibility and relationships through numerology"
      tabs={tabs}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-red-600 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                )}
                <h3 className="text-xl font-semibold text-white">{tab.label}</h3>
              </div>
              <p className="text-white/70 text-sm">
                {tab.id === 'compatibility' && 'Check compatibility with partners, friends, and family'}
                {tab.id === 'compare' && 'Compare multiple people side by side'}
                {tab.id === 'family' && 'Explore family numerology and generational patterns'}
              </p>
            </SpaceCard>
          );
        })}
      </div>
    </HubLayout>
  );
}

