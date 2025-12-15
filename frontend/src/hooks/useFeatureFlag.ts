'use client';

import { useState, useEffect, useCallback } from 'react';
import { featureFlagsAPI } from '@/lib/numerology-api';
import { useAuth } from '@/contexts/auth-context';

interface FeatureFlag {
  feature_name: string;
  display_name: string;
  category: string;
  has_access: boolean;
  limits?: Record<string, any>;
}

interface UserFeatures {
  subscription_tier: string;
  features: FeatureFlag[];
}

/**
 * Hook to check feature flag access
 */
export function useFeatureFlag(featureName: string) {
  const { user, isAuthenticated } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [limits, setLimits] = useState<Record<string, any>>({});
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setHasAccess(false);
      setIsLoading(false);
      return;
    }

    const checkAccess = async () => {
      try {
        setIsLoading(true);
        const response = await featureFlagsAPI.checkAccess(featureName);
        setHasAccess(response.has_access || false);
        setLimits(response.limits || {});
        setError(null);
      } catch (err) {
        console.error(`Error checking feature access for ${featureName}:`, err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setHasAccess(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [featureName, isAuthenticated, user]);

  return { hasAccess, isLoading, limits, error };
}

/**
 * Hook to get all user features
 */
export function useUserFeatures() {
  const { user, isAuthenticated } = useAuth();
  const [features, setFeatures] = useState<UserFeatures | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setFeatures(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await featureFlagsAPI.getUserFeatures();
      setFeatures(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching user features:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setFeatures(null);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { features, isLoading, error, refresh };
}

/**
 * Helper function to check if user has access to a feature (synchronous check from cached data)
 */
export function useFeatureAccess(featureName: string): boolean {
  const { features } = useUserFeatures();
  
  if (!features) return false;
  
  const feature = features.features.find(f => f.feature_name === featureName);
  return feature?.has_access || false;
}

