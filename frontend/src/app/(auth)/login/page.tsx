'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon, MailIcon, LockIcon, EyeIcon, EyeOffIcon, MoonIcon, SunIcon, CheckCircleIcon, AlertCircleIcon } from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';
import { useAuth } from '@/contexts/auth-context';
import { SpaceCard } from '@/components/space/space-card';
import { TouchOptimizedButton } from '@/components/buttons/touch-optimized-button';
import { useForm } from '@/hooks/use-form';
import { commonValidationRules } from '@/lib/form-validation';
import { LoginData } from '@/types';
import { toast } from 'sonner';

function LoginContent() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { login, user, loading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const searchParams = useSearchParams();

  // Redirect authenticated users
  useEffect(() => {
    if (!authLoading && user) {
      const redirect = searchParams.get('redirect') || '/dashboard';
      router.push(redirect);
    }
  }, [user, authLoading, router, searchParams]);

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit
  } = useForm({
    initialValues: {
      email: '',
      password: ''
    },
    validationRules: {
      email: commonValidationRules.email,
      password: commonValidationRules.password
    },
    onSubmit: async (formValues) => {
      try {
        await login({
          email: formValues.email,
          password: formValues.password,
          remember_me: rememberMe
        } as LoginData);
        toast.success('Welcome back!', {
          description: 'Successfully signed in'
        });
        // Check for redirect URL
        const redirect = searchParams.get('redirect') || '/dashboard';
        router.push(redirect);
      } catch (error: any) {
        if (error.requiresVerification) {
          const params = new URLSearchParams();
          if (error.email) params.set('email', error.email);
          if (error.phone) params.set('phone', error.phone);
          router.push(`/verify-otp?${params.toString()}`);
          toast.info('Verification Required', {
            description: 'Please verify your account to continue.'
          });
        } else {
          toast.error('Login failed', {
            description: error.message || 'Please check your credentials and try again'
          });
        }
      }
    }
  });

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <div className="w-full max-w-md relative z-10">
        {/* Theme Toggle */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-end mb-4"
        >
          <motion.button
            onClick={toggleTheme}
            className="p-3 rounded-2xl bg-[#1a2942]/40 backdrop-blur-xl border border-cyan-500/20 shadow-lg"
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.3 }}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <MoonIcon className="w-5 h-5 text-white" />
            ) : (
              <SunIcon className="w-5 h-5 text-yellow-400" />
            )}
          </motion.button>
        </motion.div>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <motion.div
            className="flex items-center justify-center gap-2 mb-2 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            onClick={() => router.push('/')}
          >
            <motion.div
              className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <SparklesIcon className="w-7 h-7 text-white" />
            </motion.div>
            <span className="text-3xl font-bold text-white">
              NumerAI
            </span>
          </motion.div>
          <p className="text-white/70">
            Welcome back to your numerology journey
          </p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <SpaceCard variant="premium" className="p-6 sm:p-8" glow>
            <h2 className="text-2xl font-bold text-white mb-6 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Sign In
            </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Input */}
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400/70" />
                    <input
                      type="email"
                      name="email"
                      value={values.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      onBlur={() => handleBlur('email')}
                      className={`w-full pl-10 pr-10 py-3 bg-[#1a2942]/40 backdrop-blur-xl border ${
                        touched.email && errors.email
                          ? 'border-red-500 focus:ring-red-500'
                          : touched.email && !errors.email && values.email
                          ? 'border-green-500 focus:ring-green-500'
                          : 'border-cyan-500/20 focus:ring-cyan-500'
                      } rounded-2xl focus:outline-none focus:ring-2 focus:border-transparent text-white placeholder-white/50 transition-all`}
                      placeholder="your@email.com"
                      aria-label="Email address"
                      aria-invalid={touched.email && !!errors.email}
                    />
                    {touched.email && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {errors.email ? (
                          <AlertCircleIcon className="w-5 h-5 text-red-500" />
                        ) : values.email ? (
                          <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        ) : null}
                      </motion.div>
                    )}
                  </div>
                  <AnimatePresence>
                    {touched.email && errors.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-2 text-sm text-red-500 flex items-center gap-1"
                      >
                        <AlertCircleIcon className="w-4 h-4" />
                        {errors.email}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400/70" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={values.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      onBlur={() => handleBlur('password')}
                      className={`w-full pl-10 pr-20 py-3 bg-[#1a2942]/40 backdrop-blur-xl border ${
                        touched.password && errors.password
                          ? 'border-red-500 focus:ring-red-500'
                          : touched.password && !errors.password && values.password
                          ? 'border-green-500 focus:ring-green-500'
                          : 'border-cyan-500/20 focus:ring-cyan-500'
                      } rounded-2xl focus:outline-none focus:ring-2 focus:border-transparent text-white placeholder-white/50 transition-all`}
                      placeholder="••••••••"
                      aria-label="Password"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                      {touched.password && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                          {errors.password ? (
                            <AlertCircleIcon className="w-5 h-5 text-red-500" />
                          ) : values.password ? (
                            <CheckCircleIcon className="w-5 h-5 text-green-500" />
                          ) : null}
                        </motion.div>
                      )}
                      <motion.button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-500 dark:text-white/60 hover:text-gray-700 dark:hover:text-white/90"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {showPassword ? (
                          <EyeOffIcon className="w-5 h-5" />
                        ) : (
                          <EyeIcon className="w-5 h-5" />
                        )}
                      </motion.button>
                    </div>
                  </div>
                  <AnimatePresence>
                    {touched.password && errors.password && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-2 text-sm text-red-500 flex items-center gap-1"
                      >
                        <AlertCircleIcon className="w-4 h-4" />
                        {errors.password}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-purple-600 border-gray-300 dark:border-white/20 rounded focus:ring-purple-500 cursor-pointer bg-white/50 dark:bg-white/10"
                    />
                    <span className="ml-2 text-sm text-white/70 group-hover:text-white transition-colors">
                      Remember me
                    </span>
                  </label>
                  <motion.button
                    type="button"
                    onClick={() => router.push('/reset-password')}
                    className="text-sm text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
                    whileHover={{ x: 2 }}
                  >
                    Forgot password?
                  </motion.button>
                </div>

                {/* Submit Button */}
                <TouchOptimizedButton
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full"
                  disabled={isSubmitting}
                  loading={isSubmitting}
                  ariaLabel="Sign in to your account"
                >
                  {isSubmitting ? 'Signing in...' : 'Sign In'}
                </TouchOptimizedButton>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-cyan-500/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-[#1a2942]/60 backdrop-blur-xl text-white/60 rounded-full">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Social Login */}
              <div className="grid grid-cols-2 gap-3">
                <TouchOptimizedButton variant="secondary" size="sm" fullWidth>
                  <Image
                    src="https://www.google.com/favicon.ico"
                    alt="Google"
                    width={20}
                    height={20}
                    className="mr-2"
                  />
                  Google
                </TouchOptimizedButton>
                <TouchOptimizedButton variant="secondary" size="sm" fullWidth>
                  <Image
                    src="https://www.facebook.com/favicon.ico"
                    alt="Facebook"
                    width={20}
                    height={20}
                    className="mr-2"
                  />
                  Facebook
                </TouchOptimizedButton>
              </div>

              {/* Sign Up Link */}
              <p className="text-center mt-6 text-white/70">
                Don&apos;t have an account?{' '}
                <motion.button
                  onClick={() => router.push('/register')}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
                  whileHover={{ x: 2 }}
                >
                  Sign up
                </motion.button>
              </p>
          </SpaceCard>
        </motion.div>

        {/* Back to Home */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={() => router.push('/')}
          className="w-full mt-4 text-center text-white/70 hover:text-white transition-colors"
          whileHover={{ x: -4 }}
        >
          ← Back to home
        </motion.button>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={
      <div className="w-full min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
        <div className="w-full max-w-md relative z-10 text-center">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
