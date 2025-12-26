'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { featureFlagsAPI } from '@/lib/numerology-api';

export type SubscriptionTier = 'free' | 'basic' | 'premium' | 'elite' | 'enterprise';

interface UsageLimits {
  monthlyReports: {
    used: number;
    limit: number;
  };
  [key: string]: {
    used: number;
    limit: number;
  };
}

interface FeatureAccess {
  [featureName: string]: {
    hasAccess: boolean;
    limits?: Record<string, any>;
  };
}

interface SubscriptionContextType {
  tier: SubscriptionTier;
  setTier: (tier: SubscriptionTier) => void;
  hasAccess: (feature: string) => boolean;
  usageLimits: UsageLimits;
  canUseFeature: (feature: string) => boolean;
  incrementUsage: (feature: string) => void;
  featureAccess: FeatureAccess;
  refreshFeatures: () => Promise<void>;
  isLoadingFeatures: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const tierLimits: Record<SubscriptionTier, UsageLimits> = {
  free: {
    monthlyReports: { used: 0, limit: 1 },
  },
  basic: {
    monthlyReports: { used: 0, limit: 5 },
  },
  premium: {
    monthlyReports: { used: 0, limit: 10 },
  },
  elite: {
    monthlyReports: { used: 0, limit: 50 },
  },
  enterprise: {
    monthlyReports: { used: 0, limit: -1 }, // -1 means unlimited
  },
};

const featureTierMap: Record<string, SubscriptionTier> = {
  'full-numerology-report': 'premium',
  'auspicious-dates': 'premium',
  'ai-chat': 'premium',
  'advanced-numerology': 'premium',
  'monthlyReports': 'free',
};

// Map backend subscription plans to frontend tiers
function mapBackendTierToFrontend(backendTier: string | undefined | null): SubscriptionTier {
  if (!backendTier) return 'free';
  
  const tierMap: Record<string, SubscriptionTier> = {
    'free': 'free',
    'basic': 'premium',
    'premium': 'premium',
    'elite': 'enterprise',
    'enterprise': 'enterprise',
  };
  
  return tierMap[backendTier.toLowerCase()] || 'free';
}

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [tier, setTierState] = useState<SubscriptionTier>('free');
  const [usageLimits, setUsageLimits] = useState<UsageLimits>(tierLimits.free);
  const [featureAccess, setFeatureAccess] = useState<FeatureAccess>({});
  const [isLoadingFeatures, setIsLoadingFeatures] = useState<boolean>(false);

  const refreshFeatures = useCallback(async () => {
    if (!user) {
      setFeatureAccess({});
      return;
    }

    try {
      setIsLoadingFeatures(true);
      const data = await featureFlagsAPI.getUserFeatures();
      
      // Map features to featureAccess object
      const access: FeatureAccess = {};
      data.features.forEach((feature: any) => {
        access[feature.feature_name] = {
          hasAccess: feature.has_access || false,
          limits: feature.limits || {},
        };
      });
      setFeatureAccess(access);
      
      // Update tier from backend
      const backendTier = data.subscription_tier || 'free';
      const userTier = mapBackendTierToFrontend(backendTier);
      setTierState(userTier);
      setUsageLimits(tierLimits[userTier]);
    } catch (error) {
      console.error('Error fetching user features:', error);
      // Fallback to user data
      if (user) {
        const userTier = mapBackendTierToFrontend(
          (user as any).subscription_plan || ((user as any).is_premium ? 'premium' : 'free')
        );
        setTierState(userTier);
        setUsageLimits(tierLimits[userTier]);
      }
    } finally {
      setIsLoadingFeatures(false);
    }
  }, [user]);

  useEffect(() => {
    // Check user's actual subscription from backend
    if (user) {
      // Check if user has is_premium flag or subscription_plan
      const userTier = mapBackendTierToFrontend(
        (user as any).subscription_plan || ((user as any).is_premium ? 'premium' : 'free')
      );
      setTierState(userTier);
      setUsageLimits(tierLimits[userTier]);
      
      // Fetch feature flags from API
      refreshFeatures();
    } else {
      // No user, default to free
      setTierState('free');
      setUsageLimits(tierLimits.free);
      setFeatureAccess({});
    }

    // Load usage from localStorage
    const savedUsage = localStorage.getItem('subscription_usage');
    if (savedUsage) {
      try {
        const parsed = JSON.parse(savedUsage);
        setUsageLimits((prev) => ({ ...prev, ...parsed }));
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, [user, refreshFeatures]);

  const setTier = useCallback((newTier: SubscriptionTier) => {
    setTierState(newTier);
    setUsageLimits(tierLimits[newTier]);
    localStorage.setItem('subscription_tier', newTier);
  }, []);

  const hasAccess = useCallback(
    (feature: string): boolean => {
      // First check feature flags API result
      if (featureAccess[feature]) {
        return featureAccess[feature].hasAccess;
      }
      
      // Fallback to tier-based check
      const requiredTier = featureTierMap[feature] || 'free';
      const tierHierarchy: Record<SubscriptionTier, number> = {
        free: 0,
        basic: 1,
        premium: 2,
        elite: 3,
        enterprise: 4,
      };
      return tierHierarchy[tier] >= tierHierarchy[requiredTier as SubscriptionTier] || false;
    },
    [tier, featureAccess]
  );

  const canUseFeature = useCallback(
    (feature: string): boolean => {
      if (!hasAccess(feature)) return false;
      const limit = usageLimits[feature];
      if (!limit) return true;
      if (limit.limit === -1) return true; // Unlimited
      return limit.used < limit.limit;
    },
    [hasAccess, usageLimits]
  );

  const incrementUsage = useCallback(
    (feature: string) => {
      setUsageLimits((prev) => {
        const newLimits = { ...prev };
        if (newLimits[feature]) {
          newLimits[feature] = {
            ...newLimits[feature],
            used: newLimits[feature].used + 1,
          };
        } else {
          newLimits[feature] = { used: 1, limit: 1 };
        }
        localStorage.setItem('subscription_usage', JSON.stringify(newLimits));
        return newLimits;
      });
    },
    []
  );

  return (
    <SubscriptionContext.Provider
      value={{
        tier,
        setTier,
        hasAccess,
        usageLimits,
        canUseFeature,
        incrementUsage,
        featureAccess,
        refreshFeatures,
        isLoadingFeatures,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}

