'use client';

import React from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { GlassCard } from '@/components/glassmorphism/glass-card';
import { GlassButton } from '@/components/glassmorphism/glass-button';
import { LockIcon } from 'lucide-react';

interface SubscriptionGateProps {
  feature: string;
  requiredTier: 'free' | 'basic' | 'premium' | 'enterprise' | 'elite';
  showPreview?: boolean;
  children: React.ReactNode;
}

export function SubscriptionGate({ 
  feature, 
  requiredTier, 
  showPreview = false, 
  children 
}: SubscriptionGateProps) {
  const { tier, hasAccess } = useSubscription();
  
  // Map backend tiers to frontend tiers
  // Backend: free, basic, premium, elite
  // Frontend: free, premium, enterprise
  const tierHierarchy: Record<string, number> = {
    free: 0,
    basic: 1,  // Maps to premium in frontend
    premium: 1,  // Maps to premium in frontend
    enterprise: 2,  // Maps to elite in backend
    elite: 2,  // Maps to enterprise in frontend
  };
  
  // Map frontend tier to backend tier for comparison
  const frontendToBackendTier: Record<string, string> = {
    free: 'free',
    premium: 'premium',  // Could be basic or premium
    enterprise: 'elite',
  };
  
  const currentTier = frontendToBackendTier[tier] || tier;

  const userTierLevel = tierHierarchy[currentTier] || tierHierarchy[tier] || 0;
  const requiredTierLevel = tierHierarchy[requiredTier] || 0;
  const hasRequiredAccess = userTierLevel >= requiredTierLevel;

  if (hasRequiredAccess) {
    return <>{children}</>;
  }

  if (showPreview) {
    return (
      <div className="relative">
        <div className="opacity-50 pointer-events-none">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <GlassCard variant="liquid-premium" className="p-6 max-w-md">
            <div className="liquid-glass-content text-center">
              <LockIcon className="w-12 h-12 mx-auto mb-4 text-purple-600 dark:text-purple-400" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Premium Feature
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Upgrade to {requiredTier} to access this feature
              </p>
              <GlassButton variant="liquid" className="glass-glow">
                Upgrade Now
              </GlassButton>
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

  return null;
}

