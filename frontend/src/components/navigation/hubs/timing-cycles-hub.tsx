'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { HubLayout, HubTab } from './hub-layout';
import { BookOpenIcon, CalendarIcon, ClockIcon, TrendingUpIcon } from 'lucide-react';
import { SpaceCard } from '@/components/space/space-card';

const tabs: HubTab[] = [
  { id: 'daily-reading', label: 'Daily Reading', path: '/daily-reading', icon: BookOpenIcon },
  { id: 'forecasts', label: 'Forecasts', path: '/forecasts', icon: TrendingUpIcon },
  { id: 'auspicious-dates', label: 'Auspicious Dates', path: '/auspicious-dates', icon: CalendarIcon },
  { id: 'personal-cycles', label: 'Personal Cycles', path: '/timing-cycles/personal', icon: ClockIcon },
];

export function TimingCyclesHub({ children }: { children?: React.ReactNode }) {
  const router = useRouter();

  if (children) {
    return (
      <HubLayout
        title="Timing & Cycles"
        description="Navigate your life through numerology cycles and timing"
        tabs={tabs}
      >
        {children}
      </HubLayout>
    );
  }

  return (
    <HubLayout
      title="Timing & Cycles"
      description="Navigate your life through numerology cycles and timing"
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
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-600 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                )}
                <h3 className="text-xl font-semibold text-white">{tab.label}</h3>
              </div>
              <p className="text-white/70 text-sm">
                {tab.id === 'daily-reading' && 'Get your personalized daily numerology reading'}
                {tab.id === 'forecasts' && 'View future forecasts and predictions'}
                {tab.id === 'auspicious-dates' && 'Find the best dates for important events'}
                {tab.id === 'personal-cycles' && 'Track your personal year, month, and day cycles'}
              </p>
            </SpaceCard>
          );
        })}
      </div>
    </HubLayout>
  );
}

