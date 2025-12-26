'use client';

import React from 'react';
import { Navigation } from '@/components/navigation';

/**
 * Default layout wrapper for pages that need navigation
 * Used by pages at the root level (not in [locale] or (auth))
 */
export function DefaultPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      <main id="main-content" className="pt-16">
        {children}
      </main>
    </>
  );
}

