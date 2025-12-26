'use client';

import React from 'react';
import { MyNumerologyHub } from '@/components/navigation/hubs/my-numerology-hub';
import { SpaceCard } from '@/components/space/space-card';

export default function KarmicPage() {
  return (
    <MyNumerologyHub>
      <div className="space-y-6">
        <SpaceCard variant="premium" className="p-6" glow>
          <h2 className="text-2xl font-bold text-white mb-4">Karmic Analysis</h2>
          <p className="text-white/70">
            Karmic debt numbers and lessons analysis will be displayed here.
          </p>
        </SpaceCard>
      </div>
    </MyNumerologyHub>
  );
}

