'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { HubLayout, HubTab } from './hub-layout';
import { FileTextIcon, PhoneIcon, BriefcaseIcon, CarIcon } from 'lucide-react';
import { SpaceCard } from '@/components/space/space-card';

const tabs: HubTab[] = [
  { id: 'name-analysis', label: 'Name Analysis', path: '/name-numerology', icon: FileTextIcon },
  { id: 'phone-analysis', label: 'Phone Analysis', path: '/phone-numerology', icon: PhoneIcon },
  { id: 'business-analysis', label: 'Business Analysis', path: '/business-name-numerology', icon: BriefcaseIcon },
  { id: 'asset-analysis', label: 'Asset Analysis', path: '/tools/assets', icon: CarIcon },
];

export function ToolsHub({ children }: { children?: React.ReactNode }) {
  const router = useRouter();

  if (children) {
    return (
      <HubLayout
        title="Tools"
        description="Analyze names, numbers, and assets through numerology"
        tabs={tabs}
      >
        {children}
      </HubLayout>
    );
  }

  return (
    <HubLayout
      title="Tools"
      description="Analyze names, numbers, and assets through numerology"
      tabs={tabs}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                )}
                <h3 className="text-xl font-semibold text-white">{tab.label}</h3>
              </div>
              <p className="text-white/70 text-sm">
                {tab.id === 'name-analysis' && 'Analyze name numerology and get suggestions'}
                {tab.id === 'phone-analysis' && 'Check your phone number vibration'}
                {tab.id === 'business-analysis' && 'Optimize business names and timing'}
                {tab.id === 'asset-analysis' && 'Analyze vehicles, properties, and assets'}
              </p>
            </SpaceCard>
          );
        })}
      </div>
    </HubLayout>
  );
}

