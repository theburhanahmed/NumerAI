'use client';

import React from 'react';
import { MyNumerologyHub } from '@/components/navigation/hubs/my-numerology-hub';
import { SpaceCard } from '@/components/space/space-card';

export default function PinnaclesPage() {
  return (
    <MyNumerologyHub>
      <div className="space-y-6">
        <SpaceCard variant="premium" className="p-6" glow>
          <h2 className="text-2xl font-bold text-white mb-4">Pinnacles & Challenges</h2>
          <p className="text-white/70">
            Detailed pinnacle and challenge analysis will be displayed here.
            This feature will be enhanced in Phase 1, Week 4.
          </p>
        </SpaceCard>
      </div>
    </MyNumerologyHub>
  );
}

