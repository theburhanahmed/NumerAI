'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckIcon, SparklesIcon } from 'lucide-react';
import { GlassCard } from '@/components/glassmorphism/glass-card';
import { GlassButton } from '@/components/glassmorphism/glass-button';
import { SubscriptionTier } from '@/contexts/SubscriptionContext';

interface SubscriptionPricingCardsProps {
  onSelectTier: (tier: SubscriptionTier) => void;
  selectedTier?: SubscriptionTier;
  showSelection?: boolean;
}

const pricingPlans = [
  {
    tier: 'free' as SubscriptionTier,
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: [
      'Basic numerology readings',
      'Life path number',
      'Daily insights',
      'Limited reports',
    ],
    color: 'from-gray-500 to-gray-600',
  },
  {
    tier: 'premium' as SubscriptionTier,
    name: 'Premium',
    price: '$9.99',
    period: 'per month',
    features: [
      'All free features',
      'Complete numerology reports',
      'Name & phone analysis',
      'Unlimited reports',
      'Priority support',
    ],
    color: 'from-purple-500 to-purple-600',
  },
  {
    tier: 'enterprise' as SubscriptionTier,
    name: 'Enterprise',
    price: '$29.99',
    period: 'per month',
    features: [
      'All premium features',
      'Bulk report generation',
      'API access',
      'Custom integrations',
      'Dedicated support',
    ],
    color: 'from-amber-500 to-amber-600',
  },
];

export function SubscriptionPricingCards({
  onSelectTier,
  selectedTier,
  showSelection = false,
}: SubscriptionPricingCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {pricingPlans.map((plan, index) => {
        const isSelected = selectedTier === plan.tier;
        return (
          <motion.div
            key={plan.tier}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => showSelection && onSelectTier(plan.tier)}
            className={showSelection ? 'cursor-pointer' : ''}
          >
            <GlassCard
              variant={isSelected ? 'liquid-premium' : 'liquid'}
              className={`p-6 h-full transition-all ${
                isSelected
                  ? 'ring-2 ring-purple-500 scale-105'
                  : 'hover:scale-102'
              }`}
            >
              <div className="liquid-glass-content">
                <div className="text-center mb-6">
                  <div
                    className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${plan.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}
                  >
                    <SparklesIcon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <div className="mb-2">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        /{plan.period}
                      </span>
                    )}
                  </div>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                {showSelection && (
                  <GlassButton
                    variant={isSelected ? 'liquid' : 'secondary'}
                    className={isSelected ? 'w-full glass-glow' : 'w-full'}
                    onClick={(e) => {
                      e?.stopPropagation();
                      onSelectTier(plan.tier);
                    }}
                  >
                    {isSelected ? 'Selected' : 'Select Plan'}
                  </GlassButton>
                )}
              </div>
            </GlassCard>
          </motion.div>
        );
      })}
    </div>
  );
}

