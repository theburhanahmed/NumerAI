'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, X, Check, AlertTriangle } from 'lucide-react';
import { GlassCard } from '@/components/glassmorphism/glass-card';
import { GlassButton } from '@/components/glassmorphism/glass-button';
import { paymentsAPI } from '@/lib/api-client';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

interface Subscription {
  id: string;
  plan: string;
  status: string;
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end: boolean;
}

export function SubscriptionManagement() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      const response = await paymentsAPI.getSubscriptionStatus();
      if (response.data.has_subscription) {
        setSubscription(response.data.subscription);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load subscription status',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setCanceling(true);
    try {
      await paymentsAPI.cancelSubscription();
      toast({
        title: 'Success',
        description: 'Subscription canceled successfully',
      });
      await loadSubscription();
      setShowCancelDialog(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to cancel subscription',
        variant: 'destructive',
      });
    } finally {
      setCanceling(false);
    }
  };

  const handleUpdatePlan = async (newPlan: string) => {
    setUpdating(true);
    try {
      await paymentsAPI.updateSubscription({ plan: newPlan });
      toast({
        title: 'Success',
        description: 'Subscription plan updated successfully',
      });
      await loadSubscription();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update subscription',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <GlassCard variant="default" className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </GlassCard>
    );
  }

  if (!subscription) {
    return (
      <GlassCard variant="default" className="p-6">
        <div className="text-center py-8">
          <CreditCard className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No active subscription
          </p>
          <GlassButton
            variant="primary"
            onClick={() => window.location.href = '/subscription'}
          >
            Subscribe Now
          </GlassButton>
        </div>
      </GlassCard>
    );
  }

  const planNames: Record<string, string> = {
    basic: 'Basic',
    premium: 'Premium',
    elite: 'Elite',
  };

  const statusColors: Record<string, string> = {
    active: 'bg-green-500',
    canceled: 'bg-red-500',
    past_due: 'bg-yellow-500',
    trialing: 'bg-blue-500',
  };

  return (
    <>
      <GlassCard variant="default" className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6" />
            Subscription Management
          </h2>
        </div>

        <div className="space-y-6">
          {/* Current Subscription Info */}
          <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {planNames[subscription.plan] || subscription.plan} Plan
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <div className={`w-3 h-3 rounded-full ${statusColors[subscription.status] || 'bg-gray-500'}`}></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                    {subscription.status}
                  </span>
                </div>
              </div>
            </div>

            {subscription.current_period_end && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {subscription.cancel_at_period_end
                    ? 'Subscription ends on'
                    : 'Next billing date'}
                </p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {format(new Date(subscription.current_period_end), 'MMMM d, yyyy')}
                </p>
              </div>
            )}

            {subscription.cancel_at_period_end && (
              <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Your subscription will be canceled at the end of the current billing period.
                  </p>
                </div>
              </div>
            )}

            {/* Plan Upgrade/Downgrade */}
            {subscription.status === 'active' && !subscription.cancel_at_period_end && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Change Plan
                </p>
                <div className="flex gap-2 flex-wrap">
                  {['basic', 'premium', 'elite'].map((plan) => {
                    if (plan === subscription.plan) return null;
                    return (
                      <GlassButton
                        key={plan}
                        variant="secondary"
                        size="sm"
                        onClick={() => handleUpdatePlan(plan)}
                        disabled={updating}
                      >
                        Switch to {planNames[plan]}
                      </GlassButton>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Cancel Subscription */}
            {subscription.status === 'active' && !subscription.cancel_at_period_end && (
              <GlassButton
                variant="secondary"
                onClick={() => setShowCancelDialog(true)}
                className="w-full bg-red-500 hover:bg-red-600 text-white"
                icon={<X className="w-4 h-4" />}
              >
                Cancel Subscription
              </GlassButton>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Cancel Confirmation Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <GlassCard variant="elevated" className="p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Cancel Subscription
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This action cannot be undone
                </p>
              </div>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to cancel your subscription? You will lose access to premium features immediately.
            </p>
            
            <div className="flex gap-3">
              <GlassButton
                variant="secondary"
                onClick={() => setShowCancelDialog(false)}
                disabled={canceling}
                className="flex-1"
              >
                Keep Subscription
              </GlassButton>
              <GlassButton
                variant="primary"
                onClick={handleCancel}
                disabled={canceling}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              >
                {canceling ? 'Canceling...' : 'Yes, Cancel'}
              </GlassButton>
            </div>
          </GlassCard>
        </div>
      )}
    </>
  );
}

