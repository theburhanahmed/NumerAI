'use client';

import React from 'react';
import { RelationshipsHub } from '@/components/navigation/hubs/relationships-hub';
import { SpaceCard } from '@/components/space/space-card';

export default function ComparePeoplePage() {
  return (
    <RelationshipsHub>
      <div className="space-y-6">
        <SpaceCard variant="premium" className="p-6" glow>
          <h2 className="text-2xl font-bold text-white mb-4">Compare People</h2>
          <p className="text-white/70">
            Multi-person comparison feature will be displayed here.
            This feature will be enhanced in Phase 2, Week 8.
          </p>
        </SpaceCard>
      </div>
    </RelationshipsHub>
  );
}

