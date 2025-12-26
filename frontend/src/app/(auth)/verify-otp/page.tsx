'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { SparklesIcon } from 'lucide-react';
import { SpaceCard } from '@/components/space/space-card';
import OTPForm from './otp-form';

function VerifyOTPContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const phone = searchParams.get('phone') || '';
  
  return <OTPForm email={email} phone={phone} />;
}

export default function VerifyOTPPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div 
            className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <SparklesIcon className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Verify Your Account
          </h1>
        </div>
        
        <Suspense 
          fallback={
            <SpaceCard variant="premium" className="p-8" glow>
              <div className="space-y-6">
                <div className="h-6 bg-[#1a2942]/40 rounded animate-pulse"></div>
                <div className="h-4 bg-[#1a2942]/40 rounded animate-pulse"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-[#1a2942]/40 rounded animate-pulse"></div>
                  <div className="h-12 bg-[#1a2942]/40 rounded animate-pulse"></div>
                  <div className="h-4 bg-[#1a2942]/40 rounded animate-pulse"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-12 bg-[#1a2942]/40 rounded animate-pulse"></div>
                  <div className="h-12 bg-[#1a2942]/40 rounded animate-pulse"></div>
                </div>
              </div>
            </SpaceCard>
          }
        >
          <VerifyOTPContent />
        </Suspense>
        
        <div className="mt-6 text-center">
          <a 
            href="/" 
            className="text-sm text-white/70 hover:text-white hover:underline"
          >
            ← Back to home
          </a>
        </div>
      </motion.div>
    </div>
  );
}