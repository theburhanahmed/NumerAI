'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  CalendarIcon,
  SunIcon,
  MoonIcon,
  StarIcon,
  TrendingUpIcon,
} from 'lucide-react';
import { CosmicPageLayout } from '@/components/cosmic/cosmic-page-layout';
import { SpaceCard } from '@/components/space/space-card';
import { SpaceButton } from '@/components/space/space-button';
import { CosmicTooltip } from '@/components/cosmic/cosmic-tooltip';
import { numerologyAPI } from '@/lib/numerology-api';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';

export default function DailyReadings() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [reading, setReading] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [softError, setSoftError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReading = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setSoftError(null);
        const data = await numerologyAPI.getDailyReading(selectedDate);
        if (data) {
          setReading(data);
        } else {
          setReading(null);
          setSoftError(
            'Your daily reading is not available yet. Calculate your numerology profile first to get personalized daily insights.',
          );
        }
      } catch (error: any) {
        console.error('Failed to fetch daily reading:', error);
        setReading(null);
        const backendMessage = error?.response?.data?.error as
          | string
          | undefined;

        if (backendMessage) {
          const msg = backendMessage.toLowerCase();

          if (
            msg.includes('birth date is required') ||
            msg.includes('complete your profile')
          ) {
            setSoftError(
              'Please complete your profile with your birth date so we can generate your personalized daily reading.',
            );
            return;
          }

          if (
            msg.includes('profile not found') ||
            msg.includes('calculate your profile')
          ) {
            setSoftError(
              'You have not generated your numerology profile yet. Calculate it to unlock personalized daily readings.',
            );
            return;
          }
        }

        setSoftError('Unable to load your daily reading. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchReading();
  }, [user, selectedDate]);

  const today = new Date(selectedDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const readings = reading
    ? [
        {
          icon: <SunIcon className="w-6 h-6" />,
          title: 'Daily Energy',
          content:
            reading.llm_explanation ||
            reading.actionable_tip ||
            `Today's cosmic energy is vibrant and full of potential. The number ${reading.personal_day_number} is strong, bringing opportunities for growth.`,
          color: 'from-yellow-400 to-orange-600',
          score: reading.personal_day_number || 7,
        },
        {
          icon: <TrendingUpIcon className="w-6 h-6" />,
          title: 'Career & Success',
          content:
            reading.activity_recommendation ||
            'Professional matters are favored today. Your natural leadership qualities will shine, making it an excellent day for important meetings or presentations.',
          color: 'from-green-500 to-emerald-600',
          score: 9,
        },
        {
          icon: <StarIcon className="w-6 h-6" />,
          title: 'Love & Relationships',
          content:
            reading.affirmation ||
            'Emotional connections deepen today. Express your feelings openly and listen with your heart. A meaningful conversation could strengthen your bonds.',
          color: 'from-pink-500 to-rose-600',
          score: 7,
        },
        {
          icon: <MoonIcon className="w-6 h-6" />,
          title: 'Personal Growth',
          content:
            reading.raj_yog_insight ||
            'Take time for self-reflection and meditation. The universe is guiding you toward important realizations about your life path and purpose.',
          color: 'from-purple-500 to-indigo-600',
          score: 10,
        },
      ]
    : [
        {
          icon: <SunIcon className="w-6 h-6" />,
          title: 'Daily Energy',
          content:
            "Today's cosmic energy is vibrant and full of potential. The number 7 is strong, bringing opportunities for introspection and spiritual growth.",
          color: 'from-yellow-400 to-orange-600',
          score: 8,
        },
        {
          icon: <TrendingUpIcon className="w-6 h-6" />,
          title: 'Career & Success',
          content:
            'Professional matters are favored today. Your natural leadership qualities will shine, making it an excellent day for important meetings or presentations.',
          color: 'from-green-500 to-emerald-600',
          score: 9,
        },
        {
          icon: <StarIcon className="w-6 h-6" />,
          title: 'Love & Relationships',
          content:
            'Emotional connections deepen today. Express your feelings openly and listen with your heart. A meaningful conversation could strengthen your bonds.',
          color: 'from-pink-500 to-rose-600',
          score: 7,
        },
        {
          icon: <MoonIcon className="w-6 h-6" />,
          title: 'Personal Growth',
          content:
            'Take time for self-reflection and meditation. The universe is guiding you toward important realizations about your life path and purpose.',
          color: 'from-purple-500 to-indigo-600',
          score: 10,
        },
      ];

  const luckyNumbers = reading
    ? [reading.lucky_number || 7, 14, 21, 28]
    : [7, 14, 21, 28];
  const luckyColors = reading
    ? [reading.lucky_color || 'Cyan', 'Silver', 'White']
    : ['Cyan', 'Silver', 'White'];

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
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg">
            <CalendarIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-['Playfair_Display'] font-bold text-white">
              Daily Reading
            </h1>
            <p className="text-white/70">{today}</p>
          </div>
        </div>

        {/* Date Selector */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-white mb-2">
            Select Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-3 bg-[#0a1628]/60 backdrop-blur-xl border border-cyan-500/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 transition-colors"
          />
        </div>
      </motion.div>

      {/* Error Message */}
      {softError && (
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
          <SpaceCard variant="premium" className="p-6 border-amber-500/30">
            <p className="text-white mb-4">{softError}</p>
            <div className="flex gap-3">
              <SpaceButton
                variant="secondary"
                size="sm"
                onClick={() => router.push('/profile')}
              >
                Complete Profile
              </SpaceButton>
              <SpaceButton
                variant="primary"
                size="sm"
                onClick={() => router.push('/numerology-report')}
              >
                Calculate My Profile
              </SpaceButton>
            </div>
          </SpaceCard>
        </motion.div>
      )}

      {/* Today's Overview */}
      {!softError && (
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
            delay: 0.1,
          }}
          className="mb-8"
        >
          <SpaceCard variant="premium" className="p-6 md:p-8">
            <h2 className="text-2xl font-['Playfair_Display'] font-bold text-white mb-4">
              Today&apos;s Cosmic Overview
            </h2>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
              </div>
            ) : reading ? (
              <>
                <p className="text-lg text-white/80 leading-relaxed mb-6">
                  {reading.llm_explanation ||
                    reading.actionable_tip ||
                    `The universe aligns in your favor today. With the number ${reading.personal_day_number} as your daily vibration, this is a powerful day for spiritual insights and inner wisdom. Trust your intuition and pay attention to synchronicities around you.`}
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 rounded-xl border border-cyan-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-white">Lucky Numbers</h3>
                      <CosmicTooltip
                        content="Use these numbers for important decisions today"
                        icon
                      />
                    </div>
                    <div className="flex gap-2">
                      {luckyNumbers.map((num) => (
                        <div
                          key={num}
                          className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg"
                        >
                          {num}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-600/10 rounded-xl border border-purple-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-white">Lucky Colors</h3>
                      <CosmicTooltip
                        content="Wear or surround yourself with these colors"
                        icon
                      />
                    </div>
                    <div className="flex gap-2">
                      {luckyColors.map((color) => (
                        <div
                          key={color}
                          className="px-4 py-2 bg-white/10 backdrop-blur-xl rounded-lg border border-white/20"
                        >
                          <span className="text-sm font-medium text-white">
                            {color}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-white/70">
                Your daily reading is not available yet. Calculate your
                numerology profile first to get personalized daily insights.
              </p>
            )}
          </SpaceCard>
        </motion.div>
      )}

      {/* Detailed Readings */}
      {!softError && (
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
        >
          <h2 className="text-2xl font-['Playfair_Display'] font-bold text-white mb-6">
            Detailed Readings
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {readings.map((readingItem, index) => (
              <motion.div
                key={readingItem.title}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.3 + index * 0.1,
                }}
                whileHover={{
                  y: -4,
                }}
              >
                <SpaceCard variant="default" className="p-6 h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${readingItem.color} flex items-center justify-center text-white shadow-lg`}
                    >
                      {readingItem.icon}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-cyan-400">
                        {readingItem.score}
                      </span>
                      <span className="text-sm text-white/60">/10</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-['Playfair_Display'] font-bold text-white mb-3">
                    {readingItem.title}
                  </h3>
                  <p className="text-white/70 leading-relaxed">
                    {readingItem.content}
                  </p>
                </SpaceCard>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </CosmicPageLayout>
  );
}
