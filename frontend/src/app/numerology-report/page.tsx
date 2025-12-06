'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon, StarIcon, HeartIcon, BriefcaseIcon, TrendingUpIcon, CalendarIcon, DownloadIcon, CheckCircleIcon, AlertCircleIcon, ShieldIcon, ZapIcon, TypeIcon, PhoneIcon, ArrowRightIcon, UserIcon } from 'lucide-react';
import { PageLayout } from '@/components/ui/page-layout';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { MagneticCard } from '@/components/ui/magnetic-card';
import { SubscriptionGate } from '@/components/SubscriptionGate';
import { SubscriptionPricingCards } from '@/components/SubscriptionPricingCards';
import { useSubscription, SubscriptionTier } from '@/contexts/SubscriptionContext';
import { numerologyAPI } from '@/lib/numerology-api';
import { useAuth } from '@/contexts/auth-context';
import { userAPI } from '@/lib/api-client';
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
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<ReportStep>('input');
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    phoneNumber: ''
  });
  const [useSavedProfile, setUseSavedProfile] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);

  // Fetch user profile on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        setProfileLoading(false);
        return;
      }

      try {
        setProfileLoading(true);
        const response = await userAPI.getProfile();
        const profileData = response.data?.user || response.data;
        
        if (profileData) {
          const hasName = profileData.full_name || user.full_name;
          const hasBirthDate = profileData.date_of_birth;
          
          if (hasName && hasBirthDate) {
            // Format date for input field (YYYY-MM-DD)
            const formattedDate = hasBirthDate 
              ? new Date(hasBirthDate).toISOString().split('T')[0]
              : '';
            
            setFormData({
              name: profileData.full_name || user.full_name || '',
              birthDate: formattedDate,
              phoneNumber: profileData.phone || ''
            });
            
            setProfileComplete(true);
            // If profile is complete and user wants to use saved profile, skip input step
            if (useSavedProfile) {
              // Auto-generate report if user has access
              if (canUseFeature('monthlyReports')) {
                setCurrentStep('subscription');
              }
            }
          } else {
            setProfileComplete(false);
          }
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        setProfileComplete(false);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchUserProfile();
  }, [user, useSavedProfile, canUseFeature]);
  const handleGenerateReport = async () => {
    if (!formData.name || !formData.birthDate) {
      toast.error('Please fill in required fields');
      return;
    }
    
    // If using saved profile, try to calculate numerology profile first
    if (useSavedProfile && profileComplete) {
      try {
        // Calculate numerology profile if not already calculated (uses user's stored profile data)
        await numerologyAPI.calculateProfile('pythagorean');
      } catch (error) {
        console.error('Failed to calculate profile:', error);
        // Continue anyway - might already be calculated
      }
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

                  {/* Use Saved Profile Option */}
                  {profileComplete && (
                    <div className="mb-6 p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          <span className="font-semibold text-gray-900 dark:text-white">
                            Use Saved Profile
                          </span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={useSavedProfile}
                            onChange={(e) => {
                              setUseSavedProfile(e.target.checked);
                              if (e.target.checked && profileComplete) {
                                // Re-fetch profile data
                                const fetchProfile = async () => {
                                  try {
                                    const response = await userAPI.getProfile();
                                    const profileData = response.data?.user || response.data;
                                    if (profileData) {
                                      const formattedDate = profileData.date_of_birth 
                                        ? new Date(profileData.date_of_birth).toISOString().split('T')[0]
                                        : '';
                                      setFormData({
                                        name: profileData.full_name || user?.full_name || '',
                                        birthDate: formattedDate,
                                        phoneNumber: profileData.phone || ''
                                      });
                                    }
                                  } catch (error) {
                                    console.error('Failed to fetch profile:', error);
                                  }
                                };
                                fetchProfile();
                              }
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      {useSavedProfile && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Using your saved profile: <strong>{formData.name}</strong> (Born: {formData.birthDate ? new Date(formData.birthDate).toLocaleDateString() : 'N/A'})
                        </p>
                      )}
                    </div>
                  )}

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        value={formData.name} 
                        onChange={e => {
                          setFormData({...formData, name: e.target.value});
                          setUseSavedProfile(false);
                        }} 
                        placeholder="Enter your full name" 
                        disabled={useSavedProfile && profileComplete}
                        className="w-full px-4 py-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-gray-300 dark:border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed" 
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Birth Date <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="date" 
                        value={formData.birthDate} 
                        onChange={e => {
                          setFormData({...formData, birthDate: e.target.value});
                          setUseSavedProfile(false);
                        }} 
                        disabled={useSavedProfile && profileComplete}
                        className="w-full px-4 py-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-gray-300 dark:border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed" 
                      />
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
// Report Content Component - Enhanced with AI-generated content
function ReportContent({
  formData
}: {
  formData: any;
}) {
  const { tier } = useSubscription();
  const { user } = useAuth();
  const [fullReport, setFullReport] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchFullReport = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const report = await numerologyAPI.getFullNumerologyReport();
        setFullReport(report);
        setError(null);
      } catch (err: any) {
        const errorMessage = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Failed to load report';
        console.error('Failed to fetch full numerology report:', errorMessage, err);
        setError(errorMessage);
        toast.error('Failed to load your numerology report. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchFullReport();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your numerology report...</p>
        </div>
      </div>
    );
  }

  if (error || !fullReport) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">{error || 'Failed to load report'}</p>
        </div>
      </div>
    );
  }

  const profile = fullReport.birth_date_numerology;
  const detailedAnalysis = fullReport.detailed_analysis || {};
  const lifePathData = detailedAnalysis.life_path;
  const destinyData = detailedAnalysis.destiny;
  const soulUrgeData = detailedAnalysis.soul_urge;
  const personalityData = detailedAnalysis.personality;

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
                  {fullReport.user_profile?.full_name || formData.name}
                </h1>
                <p className="text-white/80 text-sm md:text-base">
                  Born:{' '}
                  {fullReport.user_profile?.date_of_birth 
                    ? new Date(fullReport.user_profile.date_of_birth).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })
                    : formData.birthDate 
                    ? new Date(formData.birthDate).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })
                    : 'N/A'}
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
            {profile ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
                <CoreNumberCard label="Life Path" number={profile.life_path_number?.toString() || '-'} delay={0.2} />
                <CoreNumberCard label="Expression" number={profile.destiny_number?.toString() || '-'} delay={0.3} />
                <CoreNumberCard label="Soul Urge" number={profile.soul_urge_number?.toString() || '-'} delay={0.4} />
                <CoreNumberCard label="Personality" number={profile.personality_number?.toString() || '-'} delay={0.5} />
                <CoreNumberCard label="Personal Year" number={profile.personal_year_number?.toString() || '-'} delay={0.6} />
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
                  {profile?.life_path_number ? `Life Path Number ${profile.life_path_number}` : 'Life Path Number'}
                </h2>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                  {lifePathData?.ai_generated ? 'AI-Generated Detailed Analysis' : 'Your Core Life Path'}
                </p>
              </div>
            </div>
            {lifePathData?.detailed_interpretation ? (
              <div className="space-y-4">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                    {lifePathData.detailed_interpretation}
                  </p>
                </div>
                
                {lifePathData.career_insights && (
                  <GlassCard variant="liquid" className="p-5 bg-gradient-to-br from-blue-500/10 to-indigo-500/10">
                    <div className="liquid-glass-content">
                      <div className="flex items-center gap-2 mb-3">
                        <BriefcaseIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">Career Insights</h3>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{lifePathData.career_insights}</p>
                    </div>
                  </GlassCard>
                )}
                
                {lifePathData.relationship_insights && (
                  <GlassCard variant="liquid" className="p-5 bg-gradient-to-br from-pink-500/10 to-rose-500/10">
                    <div className="liquid-glass-content">
                      <div className="flex items-center gap-2 mb-3">
                        <HeartIcon className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">Relationship Insights</h3>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{lifePathData.relationship_insights}</p>
                    </div>
                  </GlassCard>
                )}
                
                {lifePathData.life_purpose && (
                  <GlassCard variant="liquid" className="p-5 bg-gradient-to-br from-purple-500/10 to-violet-500/10">
                    <div className="liquid-glass-content">
                      <div className="flex items-center gap-2 mb-3">
                        <StarIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">Life Purpose</h3>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{lifePathData.life_purpose}</p>
                    </div>
                  </GlassCard>
                )}
                
                {lifePathData.challenges_and_growth && (
                  <GlassCard variant="liquid" className="p-5 bg-gradient-to-br from-amber-500/10 to-orange-500/10">
                    <div className="liquid-glass-content">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertCircleIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">Challenges & Growth</h3>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{lifePathData.challenges_and_growth}</p>
                    </div>
                  </GlassCard>
                )}
                
                {lifePathData.personalized_advice && (
                  <GlassCard variant="liquid" className="p-5 bg-gradient-to-br from-green-500/10 to-emerald-500/10">
                    <div className="liquid-glass-content">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">Personalized Advice</h3>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{lifePathData.personalized_advice}</p>
                    </div>
                  </GlassCard>
                )}
              </div>
            ) : (
              <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                {lifePathData?.note || 'AI-generated detailed analysis is being prepared. Please check back soon.'}
              </p>
            )}
          </div>
        </MagneticCard>
      </motion.div>

      {/* Additional Core Numbers - Premium Feature */}
      {fullReport.detailed_analysis_available && (
        <div className="space-y-6 mb-6">
          {destinyData && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <MagneticCard variant="liquid-premium" className="p-6 md:p-8">
                <div className="liquid-glass-content">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <TrendingUpIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                        Destiny Number {profile?.destiny_number}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Your Expression & Potential</p>
                    </div>
                  </div>
                  {destinyData.detailed_interpretation && (
                    <div className="space-y-4">
                      <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                        {destinyData.detailed_interpretation}
                      </p>
                      {destinyData.career_insights && (
                        <div className="p-4 bg-blue-500/10 rounded-xl">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Career Insights</h4>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{destinyData.career_insights}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </MagneticCard>
            </motion.div>
          )}
          
          {soulUrgeData && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <MagneticCard variant="liquid-premium" className="p-6 md:p-8">
                <div className="liquid-glass-content">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <HeartIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                        Soul Urge Number {profile?.soul_urge_number}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Your Inner Desires & Motivations</p>
                    </div>
                  </div>
                  {soulUrgeData.detailed_interpretation && (
                    <div className="space-y-4">
                      <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                        {soulUrgeData.detailed_interpretation}
                      </p>
                      {soulUrgeData.relationship_insights && (
                        <div className="p-4 bg-pink-500/10 rounded-xl">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Relationship Insights</h4>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{soulUrgeData.relationship_insights}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </MagneticCard>
            </motion.div>
          )}
          
          {personalityData && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <MagneticCard variant="liquid-premium" className="p-6 md:p-8">
                <div className="liquid-glass-content">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <UserIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                        Personality Number {profile?.personality_number}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">How Others Perceive You</p>
                    </div>
                  </div>
                  {personalityData.detailed_interpretation && (
                    <div className="space-y-4">
                      <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                        {personalityData.detailed_interpretation}
                      </p>
                    </div>
                  )}
                </div>
              </MagneticCard>
            </motion.div>
          )}
        </div>
      )}

      {/* Pinnacle Cycles - Premium Feature */}
      {fullReport.pinnacle_cycles_available && fullReport.pinnacle_cycles && fullReport.pinnacle_cycles.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <MagneticCard variant="liquid-premium" className="p-6 md:p-8 mb-6">
            <div className="liquid-glass-content">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <CalendarIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Pinnacle Cycles</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Your Life&apos;s Major Phases</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {fullReport.pinnacle_cycles.map((cycle: any, index: number) => (
                  <GlassCard key={index} variant="liquid" className="p-5 bg-gradient-to-br from-amber-500/10 to-orange-500/10">
                    <div className="liquid-glass-content">
                      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {cycle.pinnacle_number}
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Pinnacle {cycle.cycle_number}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{cycle.age_range}</p>
                      {cycle.theme && (
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{cycle.theme}</p>
                      )}
                      {cycle.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3">{cycle.description}</p>
                      )}
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          </MagneticCard>
        </motion.div>
      )}

      {/* Challenges & Opportunities - Premium Feature */}
      {fullReport.challenges_opportunities_available && fullReport.challenges_opportunities && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {fullReport.challenges_opportunities.challenges && fullReport.challenges_opportunities.challenges.length > 0 && (
              <MagneticCard variant="liquid-premium" className="p-6 md:p-8">
                <div className="liquid-glass-content">
                  <div className="flex items-center gap-3 mb-4">
                    <AlertCircleIcon className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Challenges</h2>
                  </div>
                  <div className="space-y-3">
                    {fullReport.challenges_opportunities.challenges.map((challenge: any, index: number) => (
                      <div key={index} className="p-4 bg-amber-500/10 rounded-xl">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                          Challenge {challenge.cycle} - Number {challenge.number}
                        </h3>
                        {challenge.description && (
                          <p className="text-sm text-gray-700 dark:text-gray-300">{challenge.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </MagneticCard>
            )}
            
            {fullReport.challenges_opportunities.opportunities && fullReport.challenges_opportunities.opportunities.length > 0 && (
              <MagneticCard variant="liquid-premium" className="p-6 md:p-8">
                <div className="liquid-glass-content">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUpIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Opportunities</h2>
                  </div>
                  <div className="space-y-3">
                    {fullReport.challenges_opportunities.opportunities.map((opportunity: any, index: number) => (
                      <div key={index} className="p-4 bg-green-500/10 rounded-xl">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{opportunity.title}</h3>
                        {opportunity.description && (
                          <p className="text-sm text-gray-700 dark:text-gray-300">{opportunity.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </MagneticCard>
            )}
          </div>
        </motion.div>
      )}

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

      {/* Personal Year - Dynamic from report */}
      {profile?.personal_year_number && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <GlassCard variant="liquid-premium" className="p-6 md:p-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20">
            <div className="liquid-glass-content">
              <div className="flex items-center gap-3 mb-6">
                <CalendarIcon className="w-6 h-6 md:w-8 md:h-8 text-purple-600 dark:text-purple-400" />
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                  Personal Year {profile.personal_year_number} Forecast
                </h2>
              </div>
              {fullReport.birth_date_interpretations?.personal_year_number && (
                <div className="space-y-4">
                  {fullReport.birth_date_interpretations.personal_year_number.description && (
                    <p className="text-sm md:text-base text-gray-800 dark:text-gray-200 leading-relaxed">
                      {fullReport.birth_date_interpretations.personal_year_number.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      )}
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