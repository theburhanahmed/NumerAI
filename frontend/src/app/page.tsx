'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  SparklesIcon, 
  StarIcon, 
  HeartIcon, 
  TrendingUpIcon, 
  UsersIcon, 
  ShieldCheckIcon, 
  BookOpenIcon, 
  PlusIcon, 
  MinusIcon,
  ArrowRightIcon
} from 'lucide-react';
import { LandingFooter } from '@/components/landing/landing-footer';
import { GlassButton } from '@/components/ui/glass-button';
import { LiquidGlassHero } from '@/components/ui/liquid-glass-hero';
import { FloatingOrbs } from '@/components/ui/floating-orbs';
import { AmbientParticles } from '@/components/ui/ambient-particles';
import { MagneticCard } from '@/components/ui/magnetic-card';

export default function Home() {
  const router = useRouter();

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 transition-colors duration-500 relative overflow-hidden">
      <AmbientParticles />
      <FloatingOrbs />

      {/* Enhanced Hero Section */}
      <LiquidGlassHero 
        title="Discover Your Path" 
        subtitle="Unlock the secrets of your life through AI-powered numerology insights"
      >
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <GlassButton 
            variant="liquid" 
            size="lg" 
            onClick={() => router.push('/register')} 
            icon={<SparklesIcon className="w-5 h-5" />} 
            className="glass-glow"
          >
            Get Started Free
          </GlassButton>
          <GlassButton 
            variant="secondary" 
            size="lg" 
            onClick={() => router.push('/subscription')} 
            icon={<ArrowRightIcon className="w-5 h-5" />}
          >
            View Pricing
          </GlassButton>
        </div>
      </LiquidGlassHero>

      {/* Preview Cards with Magnetic Effect */}
      <section className="section-spacing px-4 sm:px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Start Your Journey
            </h2>
            <p className="text-lg text-gray-700 dark:text-white/70">
              Choose your path to self-discovery
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeaturePreviewCard 
              icon={<StarIcon className="w-6 h-6" />} 
              title="Life Path Analysis" 
              description="Understand your core purpose and life direction" 
              delay={0.1} 
            />
            <FeaturePreviewCard 
              icon={<SparklesIcon className="w-6 h-6" />} 
              title="Daily Readings" 
              description="Personalized guidance for each day" 
              delay={0.2} 
            />
            <FeaturePreviewCard 
              icon={<HeartIcon className="w-6 h-6" />} 
              title="Compatibility" 
              description="Check relationship and business compatibility" 
              delay={0.3} 
            />
          </div>
        </div>
      </section>

      {/* Features Section with Enhanced Cards */}
      <section id="features" className="section-spacing px-4 sm:px-6 scroll-mt-24 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent">
              Powerful Features
            </h2>
            <p className="text-lg text-gray-700 dark:text-white/70 max-w-2xl mx-auto">
              Everything you need for your numerology journey
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<SparklesIcon className="w-8 h-8" />} 
              title="AI Numerologist" 
              description="Chat with our AI-powered numerologist for instant insights and guidance" 
              delay={0.2} 
            />
            <FeatureCard 
              icon={<TrendingUpIcon className="w-8 h-8" />} 
              title="Personalized Remedies" 
              description="Get custom recommendations for gemstones, colors, and rituals" 
              delay={0.3} 
            />
            <FeatureCard 
              icon={<UsersIcon className="w-8 h-8" />} 
              title="Expert Consultations" 
              description="Book sessions with professional numerologists" 
              delay={0.4} 
            />
            <FeatureCard 
              icon={<HeartIcon className="w-8 h-8" />} 
              title="Compatibility Checker" 
              description="Analyze relationships and business partnerships" 
              delay={0.5} 
            />
            <FeatureCard 
              icon={<StarIcon className="w-8 h-8" />} 
              title="Birth Chart" 
              description="Detailed visualization of your numerology profile" 
              delay={0.6} 
            />
            <FeatureCard 
              icon={<ShieldCheckIcon className="w-8 h-8" />} 
              title="Daily Insights" 
              description="Receive personalized readings and affirmations" 
              delay={0.7} 
            />
          </div>
        </div>
      </section>

      {/* Testimonials with Enhanced Design */}
      <section id="testimonials" className="section-spacing px-4 sm:px-6 scroll-mt-24 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              What Our Users Say
            </h2>
            <p className="text-lg text-gray-700 dark:text-white/70">
              Join thousands of satisfied users
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <TestimonialCard 
              name="Sarah Johnson" 
              text="NumerAI helped me understand my life path and make better decisions. The daily readings are incredibly accurate!" 
              rating={5} 
              delay={0.2} 
            />
            <TestimonialCard 
              name="Michael Chen" 
              text="The AI numerologist is amazing! It's like having a personal guide available 24/7. Highly recommend!" 
              rating={5} 
              delay={0.3} 
            />
            <TestimonialCard 
              name="Emma Davis" 
              text="I was skeptical at first, but the compatibility checker was spot-on. It saved my business partnership!" 
              rating={5} 
              delay={0.4} 
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="section-spacing px-4 sm:px-6 scroll-mt-24 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent">
              Frequently Asked Questions
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
              Everything you need to know about NumerAI
            </p>
          </motion.div>
          <div className="space-y-4">
            <FAQItem 
              question="What is numerology?" 
              answer="Numerology is the ancient practice of understanding the mystical relationship between numbers and life events. It helps reveal insights about your personality, life path, and destiny through the analysis of numbers derived from your birth date and name." 
              delay={0.1} 
            />
            <FAQItem 
              question="How accurate is NumerAI?" 
              answer="NumerAI combines traditional numerology wisdom with advanced AI technology to provide highly personalized and accurate readings. Our AI is trained on thousands of numerology texts and real-world cases to deliver insights that resonate with your unique journey." 
              delay={0.2} 
            />
            <FAQItem 
              question="Is my data secure?" 
              answer="Absolutely. We take your privacy seriously and use industry-standard encryption to protect your personal information. Your birth details and readings are stored securely and never shared with third parties." 
              delay={0.3} 
            />
            <FAQItem 
              question="Can I try NumerAI for free?" 
              answer="Yes! We offer a free tier that includes basic numerology readings and limited AI chat access. You can upgrade to our premium plans anytime to unlock advanced features like detailed reports, compatibility analysis, and unlimited AI consultations." 
              delay={0.4} 
            />
            <FAQItem 
              question="What makes NumerAI different from other numerology apps?" 
              answer="NumerAI is the first platform to combine traditional numerology with AI-powered insights. Our intelligent system learns from your interactions to provide increasingly personalized guidance, making it like having a personal numerologist available 24/7." 
              delay={0.5} 
            />
          </div>
        </div>
      </section>

      {/* CTA Section with Enhanced Glass */}
      <section className="section-spacing px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <MagneticCard variant="liquid-premium" className="card-padding-lg text-center bg-gradient-to-br from-purple-100/50 to-blue-100/50 dark:from-purple-500/20 dark:to-blue-500/20">
            <div className="liquid-glass-content">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
                Ready to Discover Your Path?
              </h2>
              <p className="text-lg sm:text-xl text-gray-700 dark:text-white/90 mb-8 max-w-2xl mx-auto">
                Join thousands of users who have found clarity and direction
                through numerology
              </p>
              <GlassButton 
                variant="liquid" 
                size="lg" 
                onClick={() => router.push('/register')} 
                className="glass-glow" 
                icon={<SparklesIcon className="w-5 h-5" />}
              >
                Start Your Journey Today
              </GlassButton>
            </div>
          </MagneticCard>
        </motion.div>
      </section>

      <LandingFooter />
    </div>
  );
}

function FeaturePreviewCard({
  icon,
  title,
  description,
  delay
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <MagneticCard variant="liquid-premium" className="card-padding text-center h-full">
        <div className="liquid-glass-content">
          <motion.div
            className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center text-white mb-4 mx-auto shadow-lg"
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            {icon}
          </motion.div>
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
            {title}
          </h3>
          <p className="text-gray-700 dark:text-white/70 text-sm leading-relaxed">
            {description}
          </p>
        </div>
      </MagneticCard>
    </motion.div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  delay
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
    >
      <MagneticCard variant="liquid" className="card-padding h-full">
        <div className="liquid-glass-content">
          <motion.div
            className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            {icon}
          </motion.div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white transition-colors duration-300">
            {title}
          </h3>
          <p className="text-gray-700 dark:text-white/70 leading-relaxed transition-colors duration-300">
            {description}
          </p>
        </div>
      </MagneticCard>
    </motion.div>
  );
}

function TestimonialCard({
  name,
  text,
  rating,
  delay
}: {
  name: string;
  text: string;
  rating: number;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
    >
      <MagneticCard variant="liquid" className="card-padding h-full flex flex-col">
        <div className="liquid-glass-content flex flex-col h-full">
          <div className="flex gap-1 mb-4">
            {[...Array(rating)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: delay + i * 0.1, duration: 0.3 }}
              >
                <StarIcon className="w-5 h-5 fill-amber-400 text-amber-400" />
              </motion.div>
            ))}
          </div>
          <p className="text-gray-800 dark:text-white/90 mb-4 leading-relaxed flex-grow">
            &quot;{text}&quot;
          </p>
          <p className="font-semibold text-gray-900 dark:text-white">{name}</p>
        </div>
      </MagneticCard>
    </motion.div>
  );
}

function FAQItem({
  question,
  answer,
  delay
}: {
  question: string;
  answer: string;
  delay: number;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
    >
      <MagneticCard variant="liquid" className="overflow-hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-6 flex items-center justify-between text-left hover:bg-purple-500/5 transition-colors"
          aria-expanded={isOpen}
        >
          <span className="text-lg font-semibold text-gray-900 dark:text-white pr-4">
            {question}
          </span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="flex-shrink-0"
          >
            {isOpen ? (
              <MinusIcon className="w-5 h-5 text-purple-600" />
            ) : (
              <PlusIcon className="w-5 h-5 text-purple-600" />
            )}
          </motion.div>
        </button>
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="px-6 pb-6 text-gray-600 dark:text-gray-400 leading-relaxed">
            {answer}
          </div>
        </motion.div>
      </MagneticCard>
    </motion.div>
  );
}
