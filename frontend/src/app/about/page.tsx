'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SparklesIcon, HeartIcon, UsersIcon, TrendingUpIcon, StarIcon, TargetIcon } from 'lucide-react';
import { AccessibleSpaceBackground } from '@/components/space/accessible-space-background';
import { LandingNav } from '@/components/landing/landing-nav';
import { LandingFooter } from '@/components/landing/landing-footer';
import { SpaceCard } from '@/components/space/space-card';
import { OptimizedPremium3DPlanet } from '@/components/3d/optimized-premium-3d-planet';
export default function AboutUs() {
  const values = [
    {
      icon: <SparklesIcon className="w-6 h-6" />,
      title: 'Ancient Wisdom',
      description:
        'We honor the timeless practice of numerology while embracing modern technology.',
      color: 'from-cyan-400 to-blue-600',
    },
    {
      icon: <HeartIcon className="w-6 h-6" />,
      title: 'Authenticity',
      description:
        'We provide genuine insights based on proven numerological principles.',
      color: 'from-pink-500 to-rose-600',
    },
    {
      icon: <TargetIcon className="w-6 h-6" />,
      title: 'Accuracy',
      description:
        'Our AI-powered system delivers precise calculations and personalized readings.',
      color: 'from-purple-500 to-indigo-600',
    },
    {
      icon: <UsersIcon className="w-6 h-6" />,
      title: 'Community',
      description:
        'We build a supportive space for seekers to explore their cosmic journey together.',
      color: 'from-green-500 to-emerald-600',
    },
  ];

  const stats = [
    {
      value: '50K+',
      label: 'Active Users',
    },
    {
      value: '500K+',
      label: 'Readings Generated',
    },
    {
      value: '4.9★',
      label: 'Average Rating',
    },
    {
      value: '98%',
      label: 'Satisfaction Rate',
    },
  ];

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
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-['Playfair_Display'] font-bold text-white mb-6">
            About
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">
              NumerAI
            </span>
          </h1>
          <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
            We're on a mission to make ancient numerology wisdom accessible to
            everyone through the power of AI and modern technology. Your cosmic
            journey starts here.
          </p>
        </motion.div>

        {/* Story Section */}
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
          className="mb-16"
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-['Playfair_Display'] font-bold text-white mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-white/70 leading-relaxed">
                <p>
                  Founded in 2023, NumerAI was born from a simple belief:
                  everyone deserves access to the profound insights that
                  numerology offers. We saw an opportunity to bridge ancient
                  wisdom with cutting-edge AI technology.
                </p>
                <p>
                  Our team of numerology experts, data scientists, and designers
                  came together to create a platform that makes numerology
                  readings accurate, accessible, and beautifully presented.
                </p>
                <p>
                  Today, we serve over 50,000 users worldwide, helping them
                  discover their life path, understand their relationships, and
                  navigate their cosmic journey with confidence and clarity.
                </p>
              </div>
            </div>
            <div className="flex justify-center">
              <OptimizedPremium3DPlanet
                type="earth"
                size="lg"
                withRings={true}
                withMoons={true}
              />
            </div>
          </div>
        </motion.div>

        {/* Stats */}
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
            delay: 0.3,
          }}
          className="mb-16"
        >
          <SpaceCard variant="premium" className="p-8 md:p-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{
                    opacity: 0,
                    scale: 0.9,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  transition={{
                    delay: 0.4 + index * 0.1,
                  }}
                  className="text-center"
                >
                  <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-white/70">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </SpaceCard>
        </motion.div>

        {/* Values */}
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
            delay: 0.5,
          }}
        >
          <h2 className="text-3xl font-['Playfair_Display'] font-bold text-white text-center mb-12">
            Our Values
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.6 + index * 0.1,
                }}
                whileHover={{
                  y: -4,
                }}
              >
                <SpaceCard variant="default" className="p-6 h-full text-center">
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${value.color} flex items-center justify-center text-white mx-auto mb-4 shadow-lg`}
                  >
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-['Playfair_Display'] font-bold text-white mb-3">
                    {value.title}
                  </h3>
                  <p className="text-white/70 text-sm leading-relaxed">
                    {value.description}
                  </p>
                </SpaceCard>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <LandingFooter />
    </div>
  );
}