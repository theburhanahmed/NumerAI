'use client';

import React, { useState, Component } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon, StarIcon, HeartIcon, BriefcaseIcon, TrendingUpIcon, CalendarIcon, DownloadIcon, CheckCircleIcon, AlertCircleIcon, ShieldIcon, ZapIcon, TypeIcon, PhoneIcon, ArrowRightIcon } from 'lucide-react';
import { PageLayout } from '@/components/ui/page-layout';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { MagneticCard } from '@/components/ui/magnetic-card';
import { SubscriptionGate } from '@/components/SubscriptionGate';
import { SubscriptionPricingCards } from '@/components/SubscriptionPricingCards';
import { useSubscription, SubscriptionTier } from '@/contexts/SubscriptionContext';
import { numerologyAPI } from '@/lib/numerology-api';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
type ReportStep = 'input' | 'subscription' | 'report';
export default function NumerologyReport() {
  const {
    tier,
    setTier,
    hasAccess,
    usageLimits,
    canUseFeature,
    incrementUsage
  } = useSubscription();
  const [currentStep, setCurrentStep] = useState<ReportStep>('input');
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    phoneNumber: ''
  });
  const handleGenerateReport = () => {
    if (!formData.name || !formData.birthDate) {
      toast.error('Please fill in required fields');
      return;
    }
    // Check if user can generate report
    if (!canUseFeature('monthlyReports')) {
      toast.error('Monthly report limit reached', {
        description: 'Upgrade to generate more reports'
      });
      return;
    }
    setCurrentStep('subscription');
  };
  const handleSelectTier = (newTier: SubscriptionTier) => {
    setSelectedTier(newTier);
  };
  const handleConfirmSubscription = () => {
    if (!selectedTier) return;
    // Update tier and increment usage
    setTier(selectedTier);
    incrementUsage('monthlyReports');
    toast.success('Report generated!', {
      description: `Your ${selectedTier} report is ready`
    });
    setCurrentStep('report');
  };
  const handleDownload = () => {
    if (!hasAccess('full-numerology-report')) {
      toast.error('Premium feature', {
        description: 'Upgrade to Premium to download your full report'
      });
      return;
    }
    toast.success('Report downloaded successfully!');
  };
  const handleStartOver = () => {
    setCurrentStep('input');
    setSelectedTier(null);
    setFormData({
      name: '',
      birthDate: '',
      phoneNumber: ''
    });
  };
  return <PageLayout>
      {/* Page Header */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 border-b border-gray-200 dark:border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div animate={{
            rotate: [0, 5, -5, 0]
          }} transition={{
            duration: 3,
            repeat: Infinity
          }}>
              <SparklesIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </motion.div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-white dark:via-purple-300 dark:to-blue-300 bg-clip-text text-transparent">
                Complete Numerology Report
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {currentStep === 'input' && 'Enter your information'}
                {currentStep === 'subscription' && 'Choose your subscription'}
                {currentStep === 'report' && 'Your personalized report'}
              </p>
            </div>
          </div>
          {currentStep === 'report' && <div className="flex gap-2">
              <GlassButton variant="ghost" size="sm" onClick={handleStartOver}>
                New Report
              </GlassButton>
              <GlassButton variant="liquid" size="sm" icon={<DownloadIcon className="w-4 h-4" />} onClick={handleDownload} className="glass-glow">
                <span className="hidden sm:inline">Download</span>
              </GlassButton>
            </div>}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <AnimatePresence mode="wait">
          {/* Step 1: Input Form */}
          {currentStep === 'input' && <motion.div key="input" initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} exit={{
          opacity: 0,
          y: -20
        }} className="max-w-2xl mx-auto">
              <MagneticCard variant="liquid-premium" className="card-padding-lg">
                <div className="liquid-glass-content">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Enter Your Information
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      We&apos;ll generate a comprehensive numerology report based on
                      your details
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input type="text" value={formData.name} onChange={e => setFormData({
                    ...formData,
                    name: e.target.value
                  })} placeholder="Enter your full name" className="w-full px-4 py-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-gray-300 dark:border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white placeholder-gray-500" />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Birth Date <span className="text-red-500">*</span>
                      </label>
                      <input type="date" value={formData.birthDate} onChange={e => setFormData({
                    ...formData,
                    birthDate: e.target.value
                  })} className="w-full px-4 py-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-gray-300 dark:border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white" />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Phone Number{' '}
                        <span className="text-gray-400">(Optional)</span>
                      </label>
                      <input type="tel" value={formData.phoneNumber} onChange={e => setFormData({
                    ...formData,
                    phoneNumber: e.target.value
                  })} placeholder="+1 (555) 123-4567" className="w-full px-4 py-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-gray-300 dark:border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white placeholder-gray-500" />
                    </div>

                    {/* Usage Limits Display */}
                    <div className="p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                        Your Current Limits (
                        {tier.charAt(0).toUpperCase() + tier.slice(1)} Plan):
                      </p>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                            <span>Monthly Reports</span>
                            <span>
                              {usageLimits.monthlyReports.limit === -1 ? 'Unlimited' : `${usageLimits.monthlyReports.used}/${usageLimits.monthlyReports.limit}`}
                            </span>
                          </div>
                          {usageLimits.monthlyReports.limit !== -1 && <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500" style={{
                          width: `${usageLimits.monthlyReports.used / usageLimits.monthlyReports.limit * 100}%`
                        }} />
                            </div>}
                        </div>
                      </div>
                    </div>

                    <GlassButton variant="liquid" size="lg" onClick={handleGenerateReport} className="w-full glass-glow" icon={<ArrowRightIcon className="w-5 h-5" />} disabled={!formData.name || !formData.birthDate}>
                      Continue to Subscription
                    </GlassButton>
                  </div>
                </div>
              </MagneticCard>
            </motion.div>}

          {/* Step 2: Subscription Selection */}
          {currentStep === 'subscription' && <motion.div key="subscription" initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} exit={{
          opacity: 0,
          y: -20
        }}>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                  Choose Your Subscription
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  Select the plan that best fits your needs. You can upgrade
                  anytime.
                </p>
              </div>

              <SubscriptionPricingCards onSelectTier={handleSelectTier} selectedTier={selectedTier || undefined} showSelection={true} />

              {selectedTier && <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} className="max-w-md mx-auto mt-8">
                  <GlassButton variant="liquid" size="lg" onClick={handleConfirmSubscription} className="w-full glass-glow" icon={<CheckCircleIcon className="w-5 h-5" />}>
                    Generate Report with{' '}
                    {selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)}
                  </GlassButton>
                </motion.div>}
            </motion.div>}

          {/* Step 3: Report Display */}
          {currentStep === 'report' && <motion.div key="report" initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} exit={{
          opacity: 0,
          y: -20
        }}>
              <ReportContent formData={formData} />
            </motion.div>}
        </AnimatePresence>
      </div>
    </PageLayout>;
}
// Report Content Component (keeping existing implementation)
function ReportContent({
  formData
}: {
  formData: any;
}) {
  const { tier } = useSubscription();
  const { user } = useAuth();
  const [numerologyProfile, setNumerologyProfile] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const profile = await numerologyAPI.getProfile();
        setNumerologyProfile(profile);
      } catch (error) {
        console.error('Failed to fetch numerology profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const lifePathNumber = numerologyProfile?.life_path_number;
  const lifePathTitles: Record<number, string> = {
    1: 'The Leader',
    2: 'The Peacemaker',
    3: 'The Creative',
    4: 'The Builder',
    5: 'The Adventurer',
    6: 'The Nurturer',
    7: 'The Seeker',
    8: 'The Powerhouse',
    9: 'The Humanitarian',
    11: 'The Intuitive',
    22: 'The Master Builder',
    33: 'The Master Teacher'
  };

  return <>
      {/* Subscription Tier Badge */}
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} className="mb-6 text-center">
        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${tier === 'free' ? 'bg-gray-500/20 text-gray-700 dark:text-gray-300' : tier === 'premium' ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300' : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'}`}>
          {tier === 'free' && '🆓 Free Report'}
          {tier === 'premium' && '✨ Premium Report'}
          {tier === 'enterprise' && '👑 Enterprise Report'}
        </span>
      </motion.div>

      {/* Profile Header */}
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 0.1
    }}>
        <GlassCard variant="liquid-premium" className="p-6 md:p-8 mb-6 md:mb-8 bg-gradient-to-br from-blue-500/90 to-purple-600/90 text-white relative overflow-hidden">
          <div className="liquid-glass-content">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">
                  {formData.name}
                </h1>
                <p className="text-white/80 text-sm md:text-base">
                  Born:{' '}
                  {new Date(formData.birthDate).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs md:text-sm text-white/80 mb-1">
                  Report Generated
                </p>
                <p className="font-semibold text-sm md:text-base">
                  {new Date().toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
                </p>
              </div>
            </div>
            {numerologyProfile ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
                <CoreNumberCard label="Life Path" number={numerologyProfile.life_path_number?.toString() || '-'} delay={0.2} />
                <CoreNumberCard label="Expression" number={numerologyProfile.destiny_number?.toString() || '-'} delay={0.3} />
                <CoreNumberCard label="Soul Urge" number={numerologyProfile.soul_urge_number?.toString() || '-'} delay={0.4} />
                <CoreNumberCard label="Personality" number={numerologyProfile.personality_number?.toString() || '-'} delay={0.5} />
                <CoreNumberCard label="Birth Day" number={numerologyProfile.personality_number?.toString() || '-'} delay={0.6} />
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-white/80 text-sm">Calculate your profile to see your numbers</p>
              </div>
            )}
          </div>
        </GlassCard>
      </motion.div>

      {/* Life Path Analysis - Always visible */}
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 0.2
    }}>
        <MagneticCard variant="liquid-premium" className="p-6 md:p-8 mb-6 md:mb-8">
          <div className="liquid-glass-content">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <StarIcon className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                  {lifePathNumber ? `Life Path Number ${lifePathNumber}` : 'Life Path Number'}
                </h2>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                  {lifePathNumber ? lifePathTitles[lifePathNumber] || 'Your Path' : 'Calculate your profile to see your life path'}
                </p>
              </div>
            </div>
            {lifePathNumber ? (
              <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                As a Life Path {lifePathNumber}, you are on a unique journey. {lifePathNumber === 7 ? 'You are a natural seeker of truth and wisdom. You possess a deep, analytical mind and are drawn to understanding the mysteries of life.' : 'Your life path offers unique opportunities for growth and understanding.'}
              </p>
            ) : (
              <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                Calculate your numerology profile to see your personalized life path analysis.
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <GlassCard variant="liquid" className="p-5 bg-gradient-to-br from-green-500/10 to-emerald-500/10">
                <div className="liquid-glass-content">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Strengths
                    </h3>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                      Analytical and intuitive
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                      Deep thinker
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                      Spiritually aware
                    </li>
                  </ul>
                </div>
              </GlassCard>
              <GlassCard variant="liquid" className="p-5 bg-gradient-to-br from-amber-500/10 to-orange-500/10">
                <div className="liquid-glass-content">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircleIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Challenges
                    </h3>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                      Can be overly critical
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                      May isolate yourself
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                      Perfectionist tendencies
                    </li>
                  </ul>
                </div>
              </GlassCard>
            </div>
          </div>
        </MagneticCard>
      </motion.div>

      {/* Premium Content - Name Analysis, Phone, Remedies, etc. */}
      <SubscriptionGate feature="full-numerology-report" requiredTier="premium" showPreview={tier === 'free'}>
        {/* Additional premium content sections would go here */}
        <div className="space-y-6">
          <MagneticCard variant="liquid-premium" className="p-6 md:p-8">
            <div className="liquid-glass-content">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <TypeIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                    Complete Name Analysis
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Expression, Soul Urge & Personality
                  </p>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl">
                  <div className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
                    3
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                    Expression
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Creative communicator with natural gift for self-expression.
                  </p>
                </div>
                <div className="p-6 bg-gradient-to-br from-pink-500/10 to-rose-500/10 rounded-2xl">
                  <div className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
                    5
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                    Soul Urge
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Deep desire for freedom and adventure.
                  </p>
                </div>
                <div className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl">
                  <div className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
                    9
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                    Personality
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Humanitarian and compassionate nature.
                  </p>
                </div>
              </div>
            </div>
          </MagneticCard>
        </div>
      </SubscriptionGate>

      {/* Personal Year - Always visible */}
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 0.8
    }}>
        <GlassCard variant="liquid-premium" className="p-6 md:p-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20">
          <div className="liquid-glass-content">
            <div className="flex items-center gap-3 mb-6">
              <CalendarIcon className="w-6 h-6 md:w-8 md:h-8 text-purple-600 dark:text-purple-400" />
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                Personal Year 5 Forecast
              </h2>
            </div>
            <p className="text-sm md:text-base text-gray-800 dark:text-gray-200 leading-relaxed mb-6">
              This is a year of change, freedom, and new experiences. Expect
              unexpected opportunities and embrace adventure.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
              <ForecastCard label="Key Theme" value="Change & Freedom" delay={0.9} />
              <ForecastCard label="Focus Areas" value="Travel, New Skills" delay={1.0} />
              <ForecastCard label="Best Months" value="May, Aug, Nov" delay={1.1} />
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </>;
}
function CoreNumberCard({
  label,
  number,
  delay
}: {
  label: string;
  number: string;
  delay: number;
}) {
  return <motion.div initial={{
    opacity: 0,
    scale: 0.8
  }} animate={{
    opacity: 1,
    scale: 1
  }} transition={{
    delay,
    type: 'spring',
    stiffness: 200
  }} className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 md:p-5 text-center border border-white/30" whileHover={{
    scale: 1.05,
    y: -4
  }}>
      <p className="text-xs md:text-sm text-white/80 mb-2">{label}</p>
      <p className="text-3xl md:text-4xl font-bold">{number}</p>
    </motion.div>;
}
function ForecastCard({
  label,
  value,
  delay
}: {
  label: string;
  value: string;
  delay: number;
}) {
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    delay
  }}>
      <GlassCard variant="liquid" className="p-4 md:p-5">
        <div className="liquid-glass-content">
          <p className="text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {label}
          </p>
          <p className="text-sm md:text-base text-gray-900 dark:text-white font-medium">
            {value}
          </p>
        </div>
      </GlassCard>
    </motion.div>;
}