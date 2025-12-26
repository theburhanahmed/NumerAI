'use client';

import React from 'react';
import { TimingCyclesHub } from '@/components/navigation/hubs/timing-cycles-hub';
import { SpaceCard } from '@/components/space/space-card';

export default function PersonalCyclesPage() {
  return (
    <TimingCyclesHub>
      <div className="space-y-6">
        <SpaceCard variant="premium" className="p-6" glow>
          <h2 className="text-2xl font-bold text-white mb-4">Personal Cycles</h2>
          <p className="text-white/70">
            Personal year, month, and day cycles will be displayed here.
            This feature will be enhanced in Phase 1, Week 3.
          </p>
        </SpaceCard>
      </div>
    </TimingCyclesHub>
  );
}

