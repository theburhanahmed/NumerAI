'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { UsersIcon, StarIcon, CalendarIcon, ClockIcon, VideoIcon, MessageSquareIcon, CheckCircleIcon, SparklesIcon } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { FloatingOrbs } from '@/components/ui/floating-orbs';
import { AmbientParticles } from '@/components/ui/ambient-particles';
import { MagneticCard } from '@/components/ui/magnetic-card';
import { consultationsAPI } from '@/lib/consultations-api';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import type { Expert } from '@/types/consultations';
import { useEffect } from 'react';

export default function Consultations() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedExpert, setSelectedExpert] = useState<string | null>(null);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExperts = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const expertsData = await consultationsAPI.getExperts();
        setExperts(expertsData.results);
      } catch (error) {
        console.error('Failed to fetch experts:', error);
        toast.error('Failed to load experts');
        setExperts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExperts();
  }, [user]);
  const consultationTypes = [{
    icon: <VideoIcon className="w-6 h-6" />,
    title: 'Video Consultation',
    duration: '60 minutes',
    description: 'Face-to-face session for in-depth analysis'
  }, {
    icon: <MessageSquareIcon className="w-6 h-6" />,
    title: 'Chat Consultation',
    duration: '45 minutes',
    description: 'Text-based session with detailed written analysis'
  }, {
    icon: <CalendarIcon className="w-6 h-6" />,
    title: 'Follow-up Session',
    duration: '30 minutes',
    description: 'Continue your journey with ongoing guidance'
  }];
  const handleBookConsultation = (expertId: string) => {
    router.push(`/consultations/book?expert_id=${expertId}`);
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 transition-colors duration-500 relative overflow-hidden">
        <AmbientParticles />
        <FloatingOrbs />
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading experts...</p>
          </div>
        </div>
      </div>
    );
  }

  return <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 transition-colors duration-500 relative overflow-hidden">
      <AmbientParticles />
      <FloatingOrbs />
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Page Header */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <motion.div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg" animate={{
            rotate: [0, 5, -5, 0]
          }} transition={{
            duration: 3,
            repeat: Infinity
          }}>
              <UsersIcon className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-white dark:via-purple-300 dark:to-blue-300 bg-clip-text text-transparent">
                Expert Consultations
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Connect with certified numerology experts
              </p>
            </div>
          </div>
        </motion.div>

        {/* Hero Section */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.1
      }} className="mb-8">
          <GlassCard variant="liquid-premium" className="p-8 bg-gradient-to-br from-blue-500/20 to-purple-600/20 liquid-glass-iridescent">
            <div className="liquid-glass-content">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Get Personalized Guidance
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                Book a session with certified numerology experts for in-depth
                analysis and guidance
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {consultationTypes.map((type, index) => <motion.div key={type.title} initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                delay: 0.2 + index * 0.1
              }}>
                    <MagneticCard variant="liquid" className="p-4">
                      <div className="liquid-glass-content">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
                            {type.icon}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {type.title}
                            </h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {type.duration}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {type.description}
                        </p>
                      </div>
                    </MagneticCard>
                  </motion.div>)}
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Experts Grid */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.3
      }}>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Our Expert Numerologists
          </h2>
          {experts.length === 0 ? (
            <GlassCard className="p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                No experts available at the moment. Please check back later.
              </p>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {experts.map((expert, index) => (<motion.div key={expert.id} initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.4 + index * 0.1
          }}>
                <MagneticCard variant="liquid-premium" className="p-6 h-full">
                  <div className="liquid-glass-content">
                    <div className="flex items-start gap-4 mb-4">
                      <motion.div className="relative w-20 h-20" whileHover={{
                    scale: 1.05
                  }}>
                        {expert.profile_picture_url ? (
                          <Image 
                            src={expert.profile_picture_url} 
                            alt={expert.name} 
                            width={80}
                            height={80}
                            className="rounded-2xl object-cover" 
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                            {expert.name.charAt(0)}
                          </div>
                        )}
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                          <CheckCircleIcon className="w-5 h-5" />
                        </div>
                      </motion.div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                          {expert.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 capitalize">
                          {expert.specialty} Numerologist
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <StarIcon className="w-4 h-4 fill-amber-400 text-amber-400" />
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                              {expert.rating?.toFixed(1) || 'N/A'}
                            </span>
                          </div>
                          {expert.is_verified && (
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
                              Verified
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <GlassCard variant="liquid" className="p-4 mb-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                      <div className="liquid-glass-content">
                        <div className="flex items-center gap-2 mb-2">
                          <ClockIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {expert.experience_years} years Experience
                          </span>
                        </div>
                        {expert.bio && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                            {expert.bio.substring(0, 100)}...
                          </p>
                        )}
                      </div>
                    </GlassCard>

                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Specialty
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-purple-500/20 rounded-full text-xs font-medium text-gray-800 dark:text-gray-200 capitalize">
                          {expert.specialty}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Status
                        </p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {expert.is_active ? 'Available' : 'Unavailable'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <GlassButton 
                          variant="liquid" 
                          size="sm" 
                          onClick={() => router.push(`/consultations/chat?expert_id=${expert.id}`)}
                          className="glass-glow"
                        >
                          Chat
                        </GlassButton>
                        <GlassButton 
                          variant="liquid" 
                          size="sm" 
                          onClick={() => handleBookConsultation(expert.id)} 
                          className="glass-glow" 
                          disabled={!expert.is_active}
                        >
                          Book Now
                        </GlassButton>
                      </div>
                    </div>
                  </div>
                </MagneticCard>
              </motion.div>))}
          </div>
          )}
        </motion.div>

        {/* FAQ Section */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.5
      }} className="mt-12">
          <GlassCard variant="liquid-premium" className="p-8">
            <div className="liquid-glass-content">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                <MagneticCard variant="liquid" className="p-5">
                  <div className="liquid-glass-content">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      How long is a typical consultation?
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Standard consultations are 60 minutes, but we also offer
                      30-minute follow-ups and 45-minute chat sessions.
                    </p>
                  </div>
                </MagneticCard>

                <MagneticCard variant="liquid" className="p-5">
                  <div className="liquid-glass-content">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Can I reschedule my appointment?
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Yes, you can reschedule up to 24 hours before your
                      appointment without any charges.
                    </p>
                  </div>
                </MagneticCard>

                <MagneticCard variant="liquid" className="p-5">
                  <div className="liquid-glass-content">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      What should I prepare before the consultation?
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Have your birth date, full name, and any specific
                      questions ready. You will receive a detailed preparation
                      guide after booking.
                    </p>
                  </div>
                </MagneticCard>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>;
}