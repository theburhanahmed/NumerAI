'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckIcon, SparklesIcon, CrownIcon, ZapIcon, ArrowRightIcon, XIcon } from 'lucide-react';
import { AccessibleSpaceBackground } from '@/components/space/accessible-space-background';
import { LandingNav } from '@/components/landing/landing-nav';
import { LandingFooter } from '@/components/landing/landing-footer';
import { SpaceCard } from '@/components/space/space-card';
import { SpaceButton } from '@/components/space/space-button';
type BillingCycle = 'monthly' | 'yearly';
export default function Pricing() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const plans = [{
    id: 'free',
    name: 'Free',
    description: 'Perfect for exploring numerology basics',
    monthlyPrice: 0,
    yearlyPrice: 0,
    icon: <ZapIcon className="w-6 h-6" />,
    color: 'from-gray-500 to-slate-600',
    features: [{
      text: 'Basic Life Path analysis',
      included: true
    }, {
      text: '3 daily readings per day',
      included: true
    }, {
      text: 'Basic name analysis',
      included: true
    }, {
      text: 'Personal Year forecast',
      included: true
    }, {
      text: 'Community forum access',
      included: true
    }, {
      text: 'Full numerology reports',
      included: false
    }, {
      text: 'AI numerologist chat',
      included: false
    }, {
      text: 'Advanced calculators',
      included: false
    }, {
      text: 'Personalized remedies',
      included: false
    }],
    cta: 'Get Started Free',
    popular: false
  }, {
    id: 'premium',
    name: 'Premium',
    description: 'Complete numerology insights & guidance',
    monthlyPrice: 9.99,
    yearlyPrice: 99.99,
    icon: <SparklesIcon className="w-6 h-6" />,
    color: 'from-purple-500 to-blue-600',
    features: [{
      text: 'Everything in Free, plus:',
      included: true,
      bold: true
    }, {
      text: 'Unlimited daily readings',
      included: true
    }, {
      text: '10 full reports per month',
      included: true
    }, {
      text: 'AI numerologist (50 msgs/day)',
      included: true
    }, {
      text: 'All advanced calculators',
      included: true
    }, {
      text: 'Name & phone numerology',
      included: true
    }, {
      text: 'Personalized remedies',
      included: true
    }, {
      text: 'Compatibility analysis',
      included: true
    }, {
      text: 'Birth chart & forecasts',
      included: true
    }],
    cta: 'Start Premium',
    popular: true
  }, {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Everything unlimited with expert support',
    monthlyPrice: 29.99,
    yearlyPrice: 299.99,
    icon: <CrownIcon className="w-6 h-6" />,
    color: 'from-amber-500 to-orange-600',
    features: [{
      text: 'Everything in Premium, plus:',
      included: true,
      bold: true
    }, {
      text: 'Unlimited everything',
      included: true
    }, {
      text: 'Expert consultations',
      included: true
    }, {
      text: 'Priority support (24/7)',
      included: true
    }, {
      text: 'Advanced analytics',
      included: true
    }, {
      text: 'Custom reports',
      included: true
    }, {
      text: 'API access',
      included: true
    }, {
      text: 'Early feature access',
      included: true
    }, {
      text: 'Dedicated account manager',
      included: true
    }],
    cta: 'Contact Sales',
    popular: false
  }];
  const getPrice = (plan: (typeof plans)[0]) => {
    if (plan.monthlyPrice === 0) return 'Free';
    const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
    return `$${price}`;
  };
  const getSavings = (plan: (typeof plans)[0]) => {
    if (plan.monthlyPrice === 0 || billingCycle === 'monthly') return null;
    const monthlyCost = plan.monthlyPrice * 12;
    const savings = monthlyCost - plan.yearlyPrice;
    const percentage = Math.round(savings / monthlyCost * 100);
    return `Save ${percentage}%`;
  };
  return (
    <div className="relative min-h-screen">
      <AccessibleSpaceBackground />
      <LandingNav />

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 pt-28">
        {/* Hero Section */}
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-['Playfair_Display'] font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Choose the perfect plan for your numerology journey. Start free,
            upgrade anytime.
          </p>
          {/* Billing Toggle */}
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.2,
            }}
            className="inline-flex items-center gap-3 p-1.5 bg-[#1a2942]/60 backdrop-blur-xl rounded-2xl border border-cyan-500/20 shadow-lg mb-12"
          >
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2.5 rounded-xl font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2.5 rounded-xl font-medium transition-all relative ${
                billingCycle === 'yearly'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Yearly
              <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full">
                -17%
              </span>
            </button>
          </motion.div>
        </motion.div>
        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {plans.map((plan, index) => <motion.div key={plan.id} initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.1 * (index + 1)
        }} className="relative">
              {plan.popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <span className="px-4 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-bold rounded-full shadow-lg">
                    MOST POPULAR
                  </span>
                </div>}

              <SpaceCard
                variant={plan.popular ? 'premium' : 'default'}
                className={`p-6 md:p-8 h-full ${
                  plan.popular ? 'ring-2 ring-cyan-500/50 scale-105' : ''
                }`}
              >
                {/* Header */}
                <div className="text-center mb-6">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${plan.color} rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg`}
                  >
                    {plan.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-white/70 mb-4">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="flex items-baseline justify-center gap-1 mb-2">
                    <span className="text-5xl font-bold text-white">
                      {getPrice(plan)}
                    </span>
                    {plan.monthlyPrice > 0 && (
                      <span className="text-white/70">
                        /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                      </span>
                    )}
                  </div>

                  {getSavings(plan) && (
                    <span className="inline-block px-3 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full">
                      {getSavings(plan)}
                    </span>
                  )}
                </div>

                {/* Features */}
                <div className="flex-1 mb-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        {feature.included ? (
                          <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <XIcon className="w-5 h-5 text-white/40 flex-shrink-0 mt-0.5" />
                        )}
                        <span
                          className={`text-sm ${
                            feature.included
                              ? feature.bold
                                ? 'font-semibold text-white'
                                : 'text-white/80'
                              : 'text-white/50'
                          }`}
                        >
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <SpaceButton
                  variant={plan.popular ? 'primary' : 'secondary'}
                  size="lg"
                  onClick={() => router.push('/register')}
                  className="w-full"
                  icon={<ArrowRightIcon className="w-5 h-5" />}
                >
                  {plan.cta}
                </SpaceButton>

                {plan.monthlyPrice > 0 && (
                  <p className="text-xs text-center text-white/60 mt-3">
                    Cancel anytime • 7-day money-back guarantee
                  </p>
                )}
              </SpaceCard>
            </motion.div>)}
        </div>

        {/* FAQ Section */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.5
      }} className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-['Playfair_Display'] font-bold text-center mb-8 text-white">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {[{
            q: 'Can I switch plans anytime?',
            a: 'Yes! You can upgrade, downgrade, or cancel your subscription at any time. Changes take effect immediately.'
          }, {
            q: 'What payment methods do you accept?',
            a: 'We accept all major credit cards, PayPal, and Apple Pay. All payments are processed securely.'
          }, {
            q: 'Is there a free trial?',
            a: 'The Free plan is available forever with no credit card required. Premium and Enterprise plans come with a 7-day money-back guarantee.'
          }, {
            q: 'What happens to my data if I cancel?',
            a: 'Your data remains accessible for 30 days after cancellation. You can reactivate anytime during this period.'
          }].map((faq, i) => <motion.div key={i} initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.6 + i * 0.1
          }}>
                <SpaceCard variant="default" className="p-6">
                  <h3 className="font-bold text-white mb-2">{faq.q}</h3>
                  <p className="text-sm text-white/70">{faq.a}</p>
                </SpaceCard>
              </motion.div>)}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.8
      }} className="text-center mt-16">
          <SpaceCard
            variant="premium"
            className="p-8 md:p-10 max-w-2xl mx-auto bg-gradient-to-br from-cyan-500/20 to-blue-600/20"
          >
            <h2 className="text-3xl font-['Playfair_Display'] font-bold text-white mb-4">
              Ready to unlock your cosmic potential?
            </h2>
            <p className="text-white/70 mb-6">
              Join thousands discovering their numerology insights with NumerAI
            </p>
            <SpaceButton
              variant="primary"
              size="lg"
              onClick={() => router.push('/register')}
              icon={<SparklesIcon className="w-5 h-5" />}
            >
              Start Your Journey Free
            </SpaceButton>
          </SpaceCard>
        </motion.div>
      </div>

      <LandingFooter />
    </div>
  );
}