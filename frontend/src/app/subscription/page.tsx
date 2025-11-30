'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { motion } from 'framer-motion';
import { Check, Crown, Sparkles, Zap } from 'lucide-react';
import { GlassCard } from '@/components/glassmorphism/glass-card';
import { GlassButton } from '@/components/glassmorphism/glass-button';
import StripeForm from '@/components/payment/stripe-form';
import { SubscriptionManagement } from '@/components/payment/subscription-management';
import { BillingHistory } from '@/components/payment/billing-history';
import { paymentsAPI } from '@/lib/api-client';
import { useToast } from '@/components/ui/use-toast';

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: '$9.99',
    period: 'month',
    description: 'Perfect for getting started with numerology',
    features: [
      'Daily numerology readings',
      'Basic birth chart',
      'Life Path analysis',
      'AI chat (10 messages/day)',
    ],
    icon: <Sparkles className="w-6 h-6" />,
    color: 'from-blue-500 to-cyan-600',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$19.99',
    period: 'month',
    description: 'For serious numerology enthusiasts',
    features: [
      'Everything in Basic',
      'Advanced compatibility analysis',
      'Personalized remedies',
      'AI chat (unlimited)',
      'PDF report exports',
      'Priority support',
    ],
    icon: <Zap className="w-6 h-6" />,
    color: 'from-purple-500 to-pink-600',
    popular: true,
  },
  {
    id: 'elite',
    name: 'Elite',
    price: '$29.99',
    period: 'month',
    description: 'Complete numerology experience',
    features: [
      'Everything in Premium',
      'Expert consultations',
      'Multi-person analysis',
      'Custom report templates',
      'Advanced analytics',
      '24/7 priority support',
    ],
    icon: <Crown className="w-6 h-6" />,
    color: 'from-yellow-500 to-orange-600',
  },
];

export default function SubscriptionPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'premium' | 'elite'>('premium');
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadSubscriptionStatus();
    }
  }, [user]);

  const loadSubscriptionStatus = async () => {
    try {
      setLoadingStatus(true);
      const response = await paymentsAPI.getSubscriptionStatus();
      setSubscriptionStatus(response.data);
    } catch (error) {
      console.error('Error loading subscription status:', error);
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleSubscriptionSuccess = () => {
    loadSubscriptionStatus();
    router.push('/dashboard');
  };

  if (loading || loadingStatus) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const hasActiveSubscription = subscriptionStatus?.has_subscription && 
    subscriptionStatus?.subscription?.status === 'active';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Unlock the full power of numerology with our premium plans
          </p>
        </motion.div>

        {hasActiveSubscription && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <GlassCard variant="elevated" className="p-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Active Subscription
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    You are currently subscribed to the{' '}
                    {subscriptionStatus?.subscription?.plan?.charAt(0).toUpperCase() +
                      subscriptionStatus?.subscription?.plan?.slice(1)}{' '}
                    plan
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative ${plan.popular ? 'md:-mt-4 md:mb-4' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              <GlassCard
                variant={plan.popular ? 'elevated' : 'default'}
                className={`p-6 h-full ${
                  selectedPlan === plan.id
                    ? 'ring-2 ring-purple-500 dark:ring-purple-400'
                    : ''
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${plan.color} flex items-center justify-center text-white mb-4`}
                >
                  {plan.icon}
                </div>
                <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    {plan.price}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    /{plan.period}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {plan.description}
                </p>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <GlassButton
                  variant={plan.popular ? 'primary' : 'secondary'}
                  className="w-full"
                  onClick={() => setSelectedPlan(plan.id as 'basic' | 'premium' | 'elite')}
                >
                  {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
                </GlassButton>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {!hasActiveSubscription && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <GlassCard variant="elevated" className="p-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                Complete Your Subscription
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Enter your payment details to activate your{' '}
                {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} plan
              </p>
              <StripeForm
                plan={selectedPlan}
                onSuccess={handleSubscriptionSuccess}
              />
            </GlassCard>
          </motion.div>
        )}

        {hasActiveSubscription && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <SubscriptionManagement />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <BillingHistory />
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

