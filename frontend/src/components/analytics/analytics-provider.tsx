'use client';

import { createContext, useContext, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView, trackFeatureUsage } from '@/lib/analytics';

interface AnalyticsContextType {
  trackPageView: (path: string, feature?: string) => void;
  trackFeatureUsage: (feature: string, data?: Record<string, any>) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // Track page view on route change
    if (pathname) {
      trackPageView(pathname);
    }
  }, [pathname]);

  return (
    <AnalyticsContext.Provider value={{ trackPageView, trackFeatureUsage }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within AnalyticsProvider');
  }
  return context;
}

