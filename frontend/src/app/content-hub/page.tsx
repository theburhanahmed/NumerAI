'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpenIcon, VideoIcon, HeadphonesIcon, FileTextIcon, PlayCircleIcon, ClockIcon, StarIcon, TrendingUpIcon, SparklesIcon } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { FloatingOrbs } from '@/components/ui/floating-orbs';
import { AmbientParticles } from '@/components/ui/ambient-particles';
import { MagneticCard } from '@/components/ui/magnetic-card';
type ContentType = 'all' | 'articles' | 'videos' | 'podcasts' | 'ebooks';
interface ContentItem {
  id: string;
  type: 'article' | 'video' | 'podcast' | 'ebook';
  title: string;
  description: string;
  author: string;
  duration?: string;
  readTime?: string;
  rating: number;
  thumbnail: string;
  isPremium: boolean;
  isNew: boolean;
}
export default function ContentHub() {
  const [selectedType, setSelectedType] = useState<ContentType>('all');
  const contentTypes: {
    key: ContentType;
    label: string;
    icon: React.ReactNode;
  }[] = [{
    key: 'all',
    label: 'All Content',
    icon: <SparklesIcon className="w-4 h-4" />
  }, {
    key: 'articles',
    label: 'Articles',
    icon: <FileTextIcon className="w-4 h-4" />
  }, {
    key: 'videos',
    label: 'Videos',
    icon: <VideoIcon className="w-4 h-4" />
  }, {
    key: 'podcasts',
    label: 'Podcasts',
    icon: <HeadphonesIcon className="w-4 h-4" />
  }, {
    key: 'ebooks',
    label: 'E-Books',
    icon: <BookOpenIcon className="w-4 h-4" />
  }];
  const contentItems: ContentItem[] = [{
    id: '1',
    type: 'video',
    title: 'Understanding Your Life Path Number',
    description: 'A comprehensive guide to discovering and interpreting your Life Path number',
    author: 'Dr. Sarah Mitchell',
    duration: '24:15',
    rating: 4.8,
    thumbnail: '🎥',
    isPremium: false,
    isNew: true
  }, {
    id: '2',
    type: 'article',
    title: 'The Power of Master Numbers',
    description: 'Explore the spiritual significance of 11, 22, and 33 in numerology',
    author: 'Michael Chen',
    readTime: '8 min read',
    rating: 4.9,
    thumbnail: '📖',
    isPremium: false,
    isNew: true
  }, {
    id: '3',
    type: 'podcast',
    title: 'Numerology in Daily Life',
    description: 'Practical tips for applying numerology wisdom to everyday decisions',
    author: 'Emma Rodriguez',
    duration: '45:30',
    rating: 4.7,
    thumbnail: '🎧',
    isPremium: true,
    isNew: false
  }, {
    id: '4',
    type: 'ebook',
    title: 'Complete Numerology Guide',
    description: 'A comprehensive 200-page guide covering all aspects of numerology',
    author: 'David Kumar',
    readTime: '4 hour read',
    rating: 4.9,
    thumbnail: '📚',
    isPremium: true,
    isNew: false
  }, {
    id: '5',
    type: 'video',
    title: 'Compatibility Analysis Masterclass',
    description: 'Learn how to analyze relationship compatibility using numerology',
    author: 'Lisa Thompson',
    duration: '32:45',
    rating: 4.6,
    thumbnail: '🎥',
    isPremium: true,
    isNew: false
  }, {
    id: '6',
    type: 'article',
    title: 'Karmic Debt Numbers Explained',
    description: 'Understanding the lessons and challenges of karmic debt numbers',
    author: 'Dr. Sarah Mitchell',
    readTime: '12 min read',
    rating: 4.8,
    thumbnail: '📖',
    isPremium: false,
    isNew: false
  }];
  const filteredContent = selectedType === 'all' ? contentItems : contentItems.filter(item => item.type === selectedType.slice(0, -1));
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <VideoIcon className="w-5 h-5" />;
      case 'article':
        return <FileTextIcon className="w-5 h-5" />;
      case 'podcast':
        return <HeadphonesIcon className="w-5 h-5" />;
      case 'ebook':
        return <BookOpenIcon className="w-5 h-5" />;
      default:
        return <SparklesIcon className="w-5 h-5" />;
    }
  };
  return <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 transition-colors duration-500 flex flex-col relative overflow-hidden">
      <AmbientParticles />
      <FloatingOrbs />
      <main className="flex-1 section-spacing px-4 md:px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} className="text-center mb-12">
            <motion.div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-3xl flex items-center justify-center text-white mb-6 mx-auto shadow-xl" animate={{
            scale: [1, 1.05, 1]
          }} transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut'
          }}>
              <BookOpenIcon className="w-10 h-10" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-white dark:via-purple-300 dark:to-blue-300 bg-clip-text text-transparent">
              Learning Hub
            </h1>
            <p className="text-lg text-gray-600 dark:text-white/70 max-w-2xl mx-auto">
              Expand your numerology knowledge with expert content
            </p>
          </motion.div>

          {/* Featured Content */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.1
        }} className="mb-12">
            <MagneticCard variant="liquid-premium" className="card-padding-lg">
              <div className="liquid-glass-content">
                <div className="flex items-start gap-4 mb-4">
                  <span className="px-3 py-1 bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded-full text-xs font-semibold flex items-center gap-1">
                    <TrendingUpIcon className="w-3 h-3" />
                    Featured
                  </span>
                </div>
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                      Numerology Masterclass 2024
                    </h2>
                    <p className="text-gray-700 dark:text-white/90 leading-relaxed mb-6">
                      Join our comprehensive masterclass series covering
                      everything from basic calculations to advanced
                      interpretations. Perfect for beginners and experienced
                      practitioners alike.
                    </p>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <ClockIcon className="w-4 h-4" />
                        <span className="text-sm">6 hours</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <StarIcon className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-semibold">4.9</span>
                      </div>
                    </div>
                    <GlassButton variant="liquid" size="lg" icon={<PlayCircleIcon className="w-5 h-5" />} className="glass-glow">
                      Start Learning
                    </GlassButton>
                  </div>
                  <div className="text-8xl text-center">🎓</div>
                </div>
              </div>
            </MagneticCard>
          </motion.div>

          {/* Content Type Tabs */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.2
        }} className="mb-8">
            <GlassCard variant="liquid" className="p-2">
              <div className="liquid-glass-content flex overflow-x-auto gap-2 pb-2">
                {contentTypes.map(type => <motion.button key={type.key} onClick={() => setSelectedType(type.key)} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${selectedType === type.key ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' : 'text-gray-700 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-gray-800/30'}`} whileHover={{
                scale: 1.05
              }} whileTap={{
                scale: 0.95
              }}>
                    {type.icon}
                    <span>{type.label}</span>
                  </motion.button>)}
              </div>
            </GlassCard>
          </motion.div>

          {/* Content Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContent.map((item, index) => <motion.div key={item.id} initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: index * 0.1
          }}>
                <MagneticCard variant="liquid" className="card-padding h-full">
                  <div className="liquid-glass-content flex flex-col h-full">
                    {/* Thumbnail */}
                    <div className="text-6xl text-center mb-4 py-8 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl">
                      {item.thumbnail}
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-semibold flex items-center gap-1">
                        {getTypeIcon(item.type)}
                        {item.type}
                      </span>
                      {item.isNew && <span className="px-2 py-1 bg-green-500/20 text-green-700 dark:text-green-300 rounded-lg text-xs font-semibold">
                          New
                        </span>}
                      {item.isPremium && <span className="px-2 py-1 bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded-lg text-xs font-semibold">
                          Premium
                        </span>}
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-white/70 mb-4 flex-grow">
                      {item.description}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <span>{item.author}</span>
                      <div className="flex items-center gap-1">
                        <StarIcon className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="font-semibold">{item.rating}</span>
                      </div>
                    </div>

                    {/* Duration/Read Time */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <ClockIcon className="w-4 h-4" />
                      <span>{item.duration || item.readTime}</span>
                    </div>

                    {/* Action Button */}
                    <GlassButton variant="secondary" size="sm" icon={item.type === 'video' || item.type === 'podcast' ? <PlayCircleIcon className="w-4 h-4" /> : <BookOpenIcon className="w-4 h-4" />} className="w-full">
                      {item.type === 'video' || item.type === 'podcast' ? 'Watch Now' : 'Read Now'}
                    </GlassButton>
                  </div>
                </MagneticCard>
              </motion.div>)}
          </div>
        </div>
      </main>
    </div>;
}