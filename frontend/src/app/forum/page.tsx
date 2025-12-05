'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquareIcon, ThumbsUpIcon, MessageCircleIcon, TrendingUpIcon, ClockIcon, StarIcon, PlusIcon, SearchIcon, FilterIcon } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { FloatingOrbs } from '@/components/ui/floating-orbs';
import { AmbientParticles } from '@/components/ui/ambient-particles';
import { MagneticCard } from '@/components/ui/magnetic-card';
type ForumCategory = 'all' | 'questions' | 'insights' | 'experiences' | 'remedies';
interface ForumPost {
  id: string;
  author: string;
  avatar: string;
  title: string;
  content: string;
  category: string;
  likes: number;
  comments: number;
  timeAgo: string;
  isPopular: boolean;
}
export default function Forum() {
  const [selectedCategory, setSelectedCategory] = useState<ForumCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const categories: {
    key: ForumCategory;
    label: string;
    icon: React.ReactNode;
  }[] = [{
    key: 'all',
    label: 'All Posts',
    icon: <MessageSquareIcon className="w-4 h-4" />
  }, {
    key: 'questions',
    label: 'Questions',
    icon: <MessageCircleIcon className="w-4 h-4" />
  }, {
    key: 'insights',
    label: 'Insights',
    icon: <StarIcon className="w-4 h-4" />
  }, {
    key: 'experiences',
    label: 'Experiences',
    icon: <TrendingUpIcon className="w-4 h-4" />
  }];
  const forumPosts: ForumPost[] = [{
    id: '1',
    author: 'Sarah Mitchell',
    avatar: 'SM',
    title: 'How accurate are Life Path Number predictions?',
    content: "I've been following my Life Path guidance for 6 months now, and I'm amazed at how accurate the predictions have been. Has anyone else experienced this?",
    category: 'Questions',
    likes: 42,
    comments: 18,
    timeAgo: '2 hours ago',
    isPopular: true
  }, {
    id: '2',
    author: 'Michael Chen',
    avatar: 'MC',
    title: 'My journey with numerology remedies',
    content: "Started wearing the recommended gemstone 3 months ago. The changes in my career have been remarkable. Here's my full story...",
    category: 'Experiences',
    likes: 67,
    comments: 31,
    timeAgo: '5 hours ago',
    isPopular: true
  }, {
    id: '3',
    author: 'Emma Rodriguez',
    avatar: 'ER',
    title: 'Understanding Master Number 11',
    content: 'Deep dive into the spiritual significance of Master Number 11 and how it manifests in daily life. Would love to hear from other 11s!',
    category: 'Insights',
    likes: 89,
    comments: 45,
    timeAgo: '1 day ago',
    isPopular: true
  }, {
    id: '4',
    author: 'David Kumar',
    avatar: 'DK',
    title: 'Best time to start a new business?',
    content: 'Planning to launch my startup. Should I wait for my Personal Year to change or is there an auspicious date this month?',
    category: 'Questions',
    likes: 23,
    comments: 12,
    timeAgo: '3 hours ago',
    isPopular: false
  }, {
    id: '5',
    author: 'Lisa Thompson',
    avatar: 'LT',
    title: 'Compatibility reading saved my relationship',
    content: 'My partner and I were struggling. The compatibility analysis helped us understand each other better. Highly recommend!',
    category: 'Experiences',
    likes: 54,
    comments: 27,
    timeAgo: '6 hours ago',
    isPopular: false
  }];
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
              <MessageSquareIcon className="w-10 h-10" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-white dark:via-purple-300 dark:to-blue-300 bg-clip-text text-transparent">
              Community Forum
            </h1>
            <p className="text-lg text-gray-600 dark:text-white/70 max-w-2xl mx-auto">
              Connect with fellow numerology enthusiasts and share your journey
            </p>
          </motion.div>

          {/* Actions Bar */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.1
        }} className="mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" placeholder="Search discussions..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-gray-300 dark:border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white placeholder-gray-500" />
                </div>
              </div>

              {/* New Post Button */}
              <GlassButton variant="liquid" size="md" icon={<PlusIcon className="w-5 h-5" />} className="glass-glow">
                New Post
              </GlassButton>
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
          delay: 0.2
        }} className="mb-8">
            <GlassCard variant="liquid" className="p-2">
              <div className="liquid-glass-content flex overflow-x-auto gap-2 pb-2">
                {categories.map(category => <motion.button key={category.key} onClick={() => setSelectedCategory(category.key)} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${selectedCategory === category.key ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' : 'text-gray-700 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-gray-800/30'}`} whileHover={{
                scale: 1.05
              }} whileTap={{
                scale: 0.95
              }}>
                    {category.icon}
                    <span>{category.label}</span>
                  </motion.button>)}
              </div>
            </GlassCard>
          </motion.div>

          {/* Forum Posts */}
          <div className="space-y-4">
            {forumPosts.map((post, index) => <motion.div key={post.id} initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: index * 0.1
          }}>
                <MagneticCard variant="liquid" className="card-padding">
                  <div className="liquid-glass-content">
                    <div className="flex gap-4">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                          {post.avatar}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-gray-900 dark:text-white">
                                {post.author}
                              </h3>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                •
                              </span>
                              <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <ClockIcon className="w-3 h-3" />
                                {post.timeAgo}
                              </span>
                              {post.isPopular && <span className="px-2 py-0.5 bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded-full text-xs font-semibold flex items-center gap-1">
                                  <TrendingUpIcon className="w-3 h-3" />
                                  Popular
                                </span>}
                            </div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                              {post.title}
                            </h2>
                          </div>
                          <span className="px-3 py-1 bg-purple-500/20 text-purple-700 dark:text-purple-300 rounded-full text-xs font-semibold">
                            {post.category}
                          </span>
                        </div>

                        <p className="text-gray-700 dark:text-white/90 mb-4 leading-relaxed">
                          {post.content}
                        </p>

                        {/* Actions */}
                        <div className="flex items-center gap-6">
                          <motion.button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors" whileHover={{
                        scale: 1.05
                      }} whileTap={{
                        scale: 0.95
                      }}>
                            <ThumbsUpIcon className="w-5 h-5" />
                            <span className="font-semibold">{post.likes}</span>
                          </motion.button>
                          <motion.button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors" whileHover={{
                        scale: 1.05
                      }} whileTap={{
                        scale: 0.95
                      }}>
                            <MessageCircleIcon className="w-5 h-5" />
                            <span className="font-semibold">
                              {post.comments}
                            </span>
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                </MagneticCard>
              </motion.div>)}
          </div>
        </div>
      </main>
    </div>;
}