'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { BookOpenIcon, ClockIcon, ArrowRightIcon } from 'lucide-react';
import { LandingNav } from '@/components/landing/landing-nav';
import { LandingFooter } from '@/components/landing/landing-footer';
import { GlassCard } from '@/components/glassmorphism/glass-card';
import { LiquidGlassHero } from '@/components/ui/liquid-glass-hero';
import { FloatingOrbs } from '@/components/ui/floating-orbs';
import { AmbientParticles } from '@/components/ui/ambient-particles';
import { MagneticCard } from '@/components/magnetic/magnetic-card';
export default function Blog() {
  const posts = [{
    title: 'Understanding Your Life Path Number',
    excerpt: 'Discover how your life path number reveals your true purpose and destiny in this comprehensive guide to numerology fundamentals.',
    date: 'March 15, 2024',
    readTime: '5 min read',
    category: 'Beginner',
    image: 'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?w=800&h=400&fit=crop'
  }, {
    title: 'The Power of Master Numbers 11, 22, and 33',
    excerpt: 'Learn about the significance of master numbers in numerology and their profound spiritual meaning in your life journey.',
    date: 'March 12, 2024',
    readTime: '7 min read',
    category: 'Advanced',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=400&fit=crop'
  }, {
    title: 'Numerology in Daily Life: Practical Applications',
    excerpt: 'Practical ways to apply numerology insights to improve your relationships, career decisions, and personal growth.',
    date: 'March 10, 2024',
    readTime: '6 min read',
    category: 'Practical',
    image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=400&fit=crop'
  }, {
    title: 'Compatibility Through Numbers',
    excerpt: 'How to use numerology to understand relationship dynamics and find compatible partners in love and business.',
    date: 'March 8, 2024',
    readTime: '8 min read',
    category: 'Relationships',
    image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&h=400&fit=crop'
  }, {
    title: 'Personal Year Cycles: What to Expect',
    excerpt: 'Understanding the nine-year cycle in numerology and how to navigate each year for maximum growth and success.',
    date: 'March 5, 2024',
    readTime: '6 min read',
    category: 'Cycles',
    image: 'https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=800&h=400&fit=crop'
  }, {
    title: 'Name Numerology: The Hidden Power',
    excerpt: 'Explore how your name influences your destiny and learn techniques for choosing powerful names for babies and businesses.',
    date: 'March 1, 2024',
    readTime: '7 min read',
    category: 'Names',
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=400&fit=crop'
  }];
  return <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 transition-colors duration-500 relative overflow-hidden">
      <AmbientParticles />
      <FloatingOrbs />
      <LandingNav />

      {/* Hero Section */}
      <LiquidGlassHero title="Numerology Insights" subtitle="Explore articles, guides, and insights to deepen your understanding of numerology and unlock your potential" />

      {/* Blog Posts Grid */}
      <section className="section-spacing px-4 sm:px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, index) => <motion.div key={post.title} initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: index * 0.1
          }}>
                <MagneticCard variant="liquid" className="h-full overflow-hidden group cursor-pointer">
                  <div className="liquid-glass-content h-full flex flex-col">
                    <div className="relative h-48 overflow-hidden rounded-t-2xl">
                      <Image 
                        src={post.image} 
                        alt={post.title} 
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110" 
                      />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-purple-600/90 backdrop-blur-xl text-white text-xs font-semibold rounded-full">
                          {post.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold mb-3 text-white group-hover:text-purple-300 transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-white/70 leading-relaxed mb-4 flex-1">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-sm text-white/60 pt-4 border-t border-white/10">
                        <span>{post.date}</span>
                        <div className="flex items-center gap-1">
                          <ClockIcon className="w-4 h-4" />
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                      <motion.div className="flex items-center gap-2 text-purple-300 mt-4 opacity-0 group-hover:opacity-100 transition-opacity" whileHover={{
                    x: 4
                  }}>
                        <span className="text-sm font-semibold">Read more</span>
                        <ArrowRightIcon className="w-4 h-4" />
                      </motion.div>
                    </div>
                  </div>
                </MagneticCard>
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="section-spacing px-4 sm:px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{
          opacity: 0,
          scale: 0.95
        }} whileInView={{
          opacity: 1,
          scale: 1
        }} viewport={{
          once: true
        }}>
            <MagneticCard variant="liquid-premium" className="p-8 md:p-12 text-center liquid-glass-iridescent">
              <div className="liquid-glass-content">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center text-white mb-6 mx-auto shadow-lg">
                  <BookOpenIcon className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-bold mb-4 text-white">
                  Stay Updated
                </h2>
                <p className="text-lg text-white/80 mb-6">
                  Subscribe to our newsletter for weekly numerology insights and
                  exclusive content
                </p>
                <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <input type="email" placeholder="your@email.com" className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-white/50" />
                  <motion.button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-2xl shadow-lg glass-glow" whileHover={{
                  scale: 1.05
                }} whileTap={{
                  scale: 0.95
                }}>
                    Subscribe
                  </motion.button>
                </div>
              </div>
            </MagneticCard>
          </motion.div>
        </div>
      </section>

      <LandingFooter />
    </div>;
}