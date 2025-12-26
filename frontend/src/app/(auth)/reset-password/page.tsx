'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MailIcon,
  SparklesIcon
} from 'lucide-react';
import { SpaceCard } from '@/components/space/space-card';
import { TouchOptimizedButton } from '@/components/buttons/touch-optimized-button';
import { useToast } from '@/components/ui/use-toast';
import { authAPI } from '@/lib/api-client';
import { useAuth } from '@/contexts/auth-context';

export const dynamic = 'force-dynamic';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
  });

  // Redirect authenticated users
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  // Check if token is in URL (from email link) and redirect to confirm page
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      router.push(`/reset-password/confirm?token=${token}`);
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authAPI.requestPasswordResetToken(formData.email);

      setEmailSent(true);
      toast({
        title: 'Email Sent',
        description: 'Password reset link has been sent to your email. Please check your inbox and click the link to reset your password.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || error.response?.data?.detail || 'Failed to send reset instructions. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking auth or redirecting
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <div className="w-full max-w-md relative z-10 text-center">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (emailSent) {
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
              className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <SparklesIcon className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent mb-2">
              Check Your Email
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              We&apos;ve sent a password reset link to {formData.email}
            </p>
          </div>

          <SpaceCard variant="premium" className="p-8" glow>
            <div className="text-center space-y-4">
              <p className="text-white/90">
                Click the link in the email to reset your password. The link will expire in 24 hours.
              </p>
              <p className="text-sm text-white/70">
                Didn&apos;t receive the email? Check your spam folder or
              </p>
              <TouchOptimizedButton
                onClick={() => setEmailSent(false)}
                variant="secondary"
                className="w-full"
              >
                Resend Link
              </TouchOptimizedButton>

              <div className="pt-4">
                <Link
                  href="/login"
                  className="text-sm text-cyan-400 hover:text-cyan-300 hover:underline"
                >
                  ← Back to Login
                </Link>
              </div>
            </div>
          </SpaceCard>
        </motion.div>
      </div>
    );
  }

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
            Reset Password
          </h1>
          <p className="text-white/70">
            Enter your email address and we&apos;ll send you a link to reset your password
          </p>
        </div>

        <SpaceCard variant="premium" className="p-8" glow>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-white/90">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MailIcon className="h-5 w-5 text-cyan-400/70" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={loading}
                    className="w-full pl-10 pr-3 py-3 bg-[#1a2942]/40 backdrop-blur-xl border border-cyan-500/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <TouchOptimizedButton
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={loading}
                loading={loading}
              >
                Send Reset Link
              </TouchOptimizedButton>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm text-cyan-400 hover:text-cyan-300 hover:underline"
            >
              ← Back to Login
            </Link>
          </div>
        </SpaceCard>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}