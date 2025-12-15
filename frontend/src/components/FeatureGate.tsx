'use client';

import React from 'react';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface FeatureGateProps {
  featureName: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
  upgradeMessage?: string;
  requiredTier?: string;
}

/**
 * Component that gates content behind a feature flag
 */
export function FeatureGate({
  featureName,
  children,
  fallback,
  showUpgradePrompt = true,
  upgradeMessage,
  requiredTier,
}: FeatureGateProps) {
  const { hasAccess, isLoading } = useFeatureFlag(featureName);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showUpgradePrompt) {
      return (
        <Card className="border-dashed border-2 border-muted">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Lock className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle>Premium Feature</CardTitle>
            <CardDescription>
              {upgradeMessage || 
                `This feature is available for ${requiredTier || 'Premium'} subscribers. Upgrade to unlock this feature.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Unlock advanced numerology insights and features with a Premium subscription.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/subscription">
              <Button className="gap-2">
                <Sparkles className="h-4 w-4" />
                Upgrade to Premium
              </Button>
            </Link>
          </CardFooter>
        </Card>
      );
    }

    return null;
  }

  return <>{children}</>;
}

/**
 * Higher-order component version for wrapping entire components
 */
export function withFeatureGate<P extends object>(
  Component: React.ComponentType<P>,
  featureName: string,
  options?: Omit<FeatureGateProps, 'featureName' | 'children'>
) {
  return function FeatureGatedComponent(props: P) {
    return (
      <FeatureGate featureName={featureName} {...options}>
        <Component {...props} />
      </FeatureGate>
    );
  };
}

