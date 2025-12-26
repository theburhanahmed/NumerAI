'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { SparklesIcon, GemIcon, PaletteIcon, FlowerIcon, ClockIcon, CheckCircleIcon } from 'lucide-react';
import { CosmicPageLayout } from '@/components/cosmic/cosmic-page-layout';
import { SpaceCard } from '@/components/space/space-card';
import { SpaceButton } from '@/components/space/space-button';
import { CosmicTooltip } from '@/components/cosmic/cosmic-tooltip';
import { SubscriptionGate } from '@/components/SubscriptionGate';
import { numerologyAPI } from '@/lib/numerology-api';
import { useAuth } from '@/contexts/auth-context';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { toast } from 'sonner';
import { MagneticCard } from '@/components/magnetic/magnetic-card';
import { TouchOptimizedButton } from '@/components/buttons/touch-optimized-button';

export default function Remedies() {
  const { user } = useAuth();
  const { tier } = useSubscription();
  const [selectedCategory, setSelectedCategory] = useState('gemstones');
  const [lifePathNumber, setLifePathNumber] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLifePath = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const profile = await numerologyAPI.getProfile();
        setLifePathNumber(profile?.life_path_number || null);
      } catch (error) {
        console.error('Failed to fetch numerology profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLifePath();
  }, [user]);
  const gemstones = [{
    name: 'Amethyst',
    number: 7,
    benefits: ['Enhances intuition', 'Promotes spiritual growth', 'Calms the mind'],
    color: 'from-purple-500 to-violet-600',
    image: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=400&h=400&fit=crop'
  }, {
    name: 'Citrine',
    number: 3,
    benefits: ['Boosts creativity', 'Attracts abundance', 'Increases confidence'],
    color: 'from-yellow-500 to-amber-600',
    image: 'https://images.unsplash.com/photo-1583937443566-6e2cff827a84?w=400&h=400&fit=crop'
  }, {
    name: 'Rose Quartz',
    number: 6,
    benefits: ['Opens heart chakra', 'Promotes self-love', 'Enhances relationships'],
    color: 'from-pink-500 to-rose-600',
    image: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=400&h=400&fit=crop'
  }];
  const colors = [{
    name: 'Purple',
    number: 7,
    meaning: 'Spirituality & Wisdom',
    hex: '#9333EA'
  }, {
    name: 'Yellow',
    number: 3,
    meaning: 'Creativity & Joy',
    hex: '#EAB308'
  }, {
    name: 'Blue',
    number: 5,
    meaning: 'Communication & Freedom',
    hex: '#3B82F6'
  }, {
    name: 'Green',
    number: 4,
    meaning: 'Growth & Stability',
    hex: '#10B981'
  }];
  const rituals = [{
    title: 'Morning Meditation',
    time: '6:00 AM',
    duration: '15 minutes',
    description: 'Start your day with focused breathing and intention setting',
    steps: ['Find quiet space', 'Set intention', 'Focus on breath', 'Visualize goals']
  }, {
    title: 'Evening Gratitude',
    time: '9:00 PM',
    duration: '10 minutes',
    description: 'Reflect on the day and express gratitude',
    steps: ['List 3 blessings', 'Journal thoughts', 'Release negativity', "Set tomorrow's intention"]
  }];
  const handleApplyRemedy = (remedyName: string) => {
    toast.success(`${remedyName} added to your practice!`, {
      description: 'Check your dashboard for tracking'
    });
  };
  return (
    <CosmicPageLayout>
      {/* Header */}
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
            <GemIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-['Playfair_Display'] font-bold text-white">
              Cosmic Remedies
            </h1>
            <p className="text-white/70">Align your energy with the universe</p>
          </div>
        </div>
      </motion.div>

        {/* Category Tabs */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.1
      }} className="mb-8">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {[{
            id: 'gemstones',
            icon: GemIcon,
            label: 'Gemstones'
          }, {
            id: 'colors',
            icon: PaletteIcon,
            label: 'Colors'
          }, {
            id: 'rituals',
            icon: FlowerIcon,
            label: 'Rituals'
          }].map((tab, index) => <motion.button key={tab.id} onClick={() => setSelectedCategory(tab.id)} className={`px-6 py-3 rounded-2xl backdrop-blur-xl border transition-all whitespace-nowrap ${selectedCategory === tab.id ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-white/30 shadow-xl' : 'bg-white/50 dark:bg-gray-800/50 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white'}`} initial={{
            opacity: 0,
            x: -20
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            delay: index * 0.05
          }} whileHover={{
            scale: 1.05
          }} whileTap={{
            scale: 0.95
          }}>
                <div className="flex items-center gap-2">
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </div>
              </motion.button>)}
          </div>
        </motion.div>

        {/* Gemstones Section */}
        <SubscriptionGate feature="remedies" requiredTier="premium" showPreview={tier === 'free'}>
          {selectedCategory === 'gemstones' && <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.2
      }}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {lifePathNumber 
                ? `Recommended Gemstones for Life Path ${lifePathNumber}`
                : 'Recommended Gemstones'
              }
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gemstones.map((gem, index) => <motion.div key={gem.name} initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.3 + index * 0.1
          }}>
                  <MagneticCard variant="liquid-premium" className="p-6 h-full">
                    <div className="liquid-glass-content">
                      <div className="relative mb-4 rounded-2xl overflow-hidden h-48">
                        <Image 
                          src={gem.image} 
                          alt={gem.name} 
                          fill
                          className="object-cover" 
                        />
                        <div className={`absolute inset-0 bg-gradient-to-t ${gem.color} opacity-30`} />
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {gem.name}
                        </h3>
                        <motion.div className={`w-10 h-10 bg-gradient-to-r ${gem.color} rounded-xl flex items-center justify-center text-white font-bold shadow-lg`} whileHover={{
                    scale: 1.1,
                    rotate: 5
                  }}>
                          {gem.number}
                        </motion.div>
                      </div>
                      <div className="space-y-2 mb-4">
                        {gem.benefits.map((benefit, idx) => <div key={idx} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <CheckCircleIcon className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                            {benefit}
                          </div>)}
                      </div>
                      <TouchOptimizedButton variant="primary" size="sm" className="w-full" onClick={() => handleApplyRemedy(gem.name)}>
                        Add to Practice
                      </TouchOptimizedButton>
                    </div>
                  </MagneticCard>
                </motion.div>)}
            </div>
          </motion.div>}

        {/* Colors Section */}
        {selectedCategory === 'colors' && <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.2
      }}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Lucky Colors for Your Numbers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {colors.map((color, index) => <motion.div key={color.name} initial={{
            opacity: 0,
            x: index % 2 === 0 ? -20 : 20
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            delay: 0.3 + index * 0.1
          }}>
                  <MagneticCard variant="liquid-premium" className="p-6">
                    <div className="liquid-glass-content">
                      <div className="flex items-center gap-4 mb-4">
                        <motion.div className="w-20 h-20 rounded-2xl shadow-xl" style={{
                    backgroundColor: color.hex
                  }} whileHover={{
                    scale: 1.1,
                    rotate: 5
                  }} />
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                            {color.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Number {color.number}
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mb-4">
                        {color.meaning}
                      </p>
                      <SpaceCard variant="elevated" className="p-4 bg-[#1a2942]/40 border border-cyan-500/20">
                        <p className="text-sm font-semibold text-white mb-2">
                          How to Use
                        </p>
                        <p className="text-xs text-white/70">
                          Incorporate this color in your clothing, workspace,
                          or meditation space to enhance its energy.
                        </p>
                      </SpaceCard>
                    </div>
                  </MagneticCard>
                </motion.div>)}
            </div>
          </motion.div>}

        {/* Rituals Section */}
        {selectedCategory === 'rituals' && <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.2
      }}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Daily Rituals for Balance
            </h2>
            <div className="space-y-6">
              {rituals.map((ritual, index) => <motion.div key={ritual.title} initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.3 + index * 0.1
          }}>
                  <MagneticCard variant="liquid-premium" className="p-6">
                    <div className="liquid-glass-content">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            {ritual.title}
                          </h3>
                          <p className="text-gray-700 dark:text-gray-300">
                            {ritual.description}
                          </p>
                        </div>
                        <div className="flex gap-4">
                          <SpaceCard variant="elevated" className="p-3 bg-[#1a2942]/40 border border-cyan-500/20">
                            <div className="flex items-center gap-2">
                              <ClockIcon className="w-4 h-4 text-cyan-400" />
                              <div>
                                <p className="text-xs text-white/70">
                                  Time
                                </p>
                                <p className="font-semibold text-white text-sm">
                                  {ritual.time}
                                </p>
                              </div>
                            </div>
                          </SpaceCard>
                          <SpaceCard variant="elevated" className="p-3 bg-[#1a2942]/40 border border-cyan-500/20">
                            <div className="flex items-center gap-2">
                              <ClockIcon className="w-4 h-4 text-cyan-400" />
                              <div>
                                <p className="text-xs text-white/70">
                                  Duration
                                </p>
                                <p className="font-semibold text-white text-sm">
                                  {ritual.duration}
                                </p>
                              </div>
                            </div>
                          </SpaceCard>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                        {ritual.steps.map((step, idx) => <motion.div key={idx} initial={{
                    opacity: 0,
                    scale: 0.8
                  }} animate={{
                    opacity: 1,
                    scale: 1
                  }} transition={{
                    delay: 0.4 + idx * 0.1
                  }}>
                            <SpaceCard variant="elevated" className="p-4 text-center bg-[#1a2942]/40 border border-cyan-500/20">
                              <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm mx-auto mb-2">
                                {idx + 1}
                              </div>
                              <p className="text-sm text-white/70">
                                {step}
                              </p>
                            </SpaceCard>
                          </motion.div>)}
                      </div>
                      <TouchOptimizedButton variant="primary" size="sm" className="w-full" onClick={() => handleApplyRemedy(ritual.title)}>
                        Start This Ritual
                      </TouchOptimizedButton>
                    </div>
                  </MagneticCard>
                </motion.div>)}
            </div>
          </motion.div>}
        </SubscriptionGate>
      </CosmicPageLayout>
    );
  }