'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  SparklesIcon,
  AlertCircleIcon
} from 'lucide-react';
import { SpaceCard } from '@/components/space/space-card';
import { TouchOptimizedButton } from '@/components/buttons/touch-optimized-button';
import { useToast } from '@/components/ui/use-toast';
import { authAPI } from '@/lib/api-client';
import { useAuth } from '@/contexts/auth-context';

export const dynamic = 'force-dynamic';

function ResetPasswordConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passwordReset, setPasswordReset] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    token: '',
    new_password: '',
    confirm_password: '',
  });

  // Redirect authenticated users
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  // Get token from URL params
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setFormData(prev => ({ ...prev, token }));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate token exists
    if (!formData.token) {
      toast({
        title: 'Missing Token',
        description: 'Reset token is required. Please use the link from your email.',
        variant: 'destructive',
      });
      return;
    }

    // Validate password length
    if (formData.new_password.length < 8) {
      toast({
        title: 'Invalid Password',
        description: 'Password must be at least 8 characters long',
        variant: 'destructive',
      });
      return;
    }

    // Validate passwords match
    if (formData.new_password !== formData.confirm_password) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      await authAPI.confirmPasswordResetToken({
        token: formData.token,
        new_password: formData.new_password,
        confirm_password: formData.confirm_password,
      });

      setPasswordReset(true);
      toast({
        title: 'Success',
        description: 'Password reset successful. You can now login with your new password.',
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.detail || 
                          error.message || 
                          'Failed to reset password. The token may be invalid or expired.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (passwordReset) {
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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent mb-2">
              Password Reset Successful
            </h1>
            <p className="text-white/70">
              Your password has been successfully reset
            </p>
          </div>

          <SpaceCard variant="premium" className="p-8" glow>
            <div className="text-center space-y-4">
              <p className="text-white/90">
                You can now login with your new password
              </p>

              <TouchOptimizedButton
                onClick={() => router.push('/login')}
                variant="primary"
                className="w-full"
              >
                Go to Login
              </TouchOptimizedButton>
            </div>
          </SpaceCard>
        </motion.div>
      </div>
    );
  }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <div className="w-full max-w-md relative z-10 text-center">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  // Show error if no token
  if (!formData.token) {
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
              className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <AlertCircleIcon className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent mb-2">
              Invalid Reset Link
            </h1>
            <p className="text-white/70">
              The password reset link is missing or invalid
            </p>
          </div>

          <SpaceCard variant="premium" className="p-8" glow>
            <div className="text-center space-y-4">
              <p className="text-white/90">
                Please use the link from your password reset email, or request a new reset link.
              </p>
              <div className="space-y-3">
                <TouchOptimizedButton
                  onClick={() => router.push('/reset-password')}
                  variant="primary"
                  className="w-full"
                >
                  Request New Reset Link
                </TouchOptimizedButton>
                <Link
                  href="/login"
                  className="block text-sm text-cyan-400 hover:text-cyan-300 hover:underline"
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
            Reset Your Password
          </h1>
          <p className="text-white/70">
            Enter your new password below
          </p>
        </div>

        <SpaceCard variant="premium" className="p-8" glow>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="new_password" className="block text-sm font-medium text-white/90">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockIcon className="h-5 w-5 text-cyan-400/70" />
                  </div>
                  <input
                    id="new_password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={formData.new_password}
                    onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                    required
                    minLength={8}
                    disabled={loading}
                    className="w-full pl-10 pr-10 py-3 bg-[#1a2942]/40 backdrop-blur-xl border border-cyan-500/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-5 w-5 text-white/60 hover:text-white/90" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-white/60 hover:text-white/90" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-white/70">
                  Password must be at least 8 characters long
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirm_password" className="block text-sm font-medium text-white/90">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockIcon className="h-5 w-5 text-cyan-400/70" />
                  </div>
                  <input
                    id="confirm_password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={formData.confirm_password}
                    onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                    required
                    minLength={8}
                    disabled={loading}
                    className="w-full pl-10 pr-10 py-3 bg-[#1a2942]/40 backdrop-blur-xl border border-cyan-500/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOffIcon className="h-5 w-5 text-white/60 hover:text-white/90" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-white/60 hover:text-white/90" />
                    )}
                  </button>
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
                Reset Password
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

export default function ResetPasswordConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <ResetPasswordConfirmContent />
    </Suspense>
  );
}