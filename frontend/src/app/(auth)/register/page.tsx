'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon, MailIcon, LockIcon, UserIcon, CalendarIcon, EyeIcon, EyeOffIcon, MoonIcon, SunIcon, CheckCircleIcon, AlertCircleIcon } from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';
import { useAuth } from '@/contexts/auth-context';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { FloatingOrbs } from '@/components/ui/floating-orbs';
import { AmbientParticles } from '@/components/ui/ambient-particles';
import { toast } from 'sonner';

export default function Signup() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { register, user, loading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthDate: ''
  });
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthDate: ''
  });
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
    birthDate: false
  });

  // Redirect authenticated users
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateName = (name: string) => {
    return name.trim().length >= 2;
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const validateConfirmPassword = (confirmPassword: string, password: string) => {
    if (!confirmPassword) return false;
    return confirmPassword === password;
  };

  const validateBirthDate = (date: string) => {
    if (!date) return false;
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 13 && age <= 120;
  };

  const handleBlur = (field: keyof typeof formData) => {
    setTouched({ ...touched, [field]: true });
    let error = '';
    switch (field) {
      case 'name':
        if (!formData.name) {
          error = 'Name is required';
        } else if (!validateName(formData.name)) {
          error = 'Name must be at least 2 characters';
        }
        break;
      case 'email':
        if (!formData.email) {
          error = 'Email is required';
        } else if (!validateEmail(formData.email)) {
          error = 'Please enter a valid email';
        }
        break;
      case 'password':
        if (!formData.password) {
          error = 'Password is required';
        } else if (!validatePassword(formData.password)) {
          error = 'Password must be at least 6 characters';
        }
        break;
      case 'confirmPassword':
        if (!formData.confirmPassword) {
          error = 'Please confirm your password';
        } else if (!validateConfirmPassword(formData.confirmPassword, formData.password)) {
          error = 'Passwords do not match';
        }
        break;
      case 'birthDate':
        if (!formData.birthDate) {
          error = 'Birth date is required';
        } else if (!validateBirthDate(formData.birthDate)) {
          error = 'You must be at least 13 years old';
        }
        break;
    }
    setErrors({ ...errors, [field]: error });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (touched[name as keyof typeof touched]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allTouched = {
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
      birthDate: true
    };
    setTouched(allTouched);

    const newErrors = {
      name: !formData.name ? 'Name is required' : !validateName(formData.name) ? 'Name must be at least 2 characters' : '',
      email: !formData.email ? 'Email is required' : !validateEmail(formData.email) ? 'Please enter a valid email' : '',
      password: !formData.password ? 'Password is required' : !validatePassword(formData.password) ? 'Password must be at least 6 characters' : '',
      confirmPassword: !formData.confirmPassword ? 'Please confirm your password' : !validateConfirmPassword(formData.confirmPassword, formData.password) ? 'Passwords do not match' : '',
      birthDate: !formData.birthDate ? 'Birth date is required' : !validateBirthDate(formData.birthDate) ? 'You must be at least 13 years old' : ''
    };
    setErrors(newErrors);
    const hasErrors = Object.values(newErrors).some(error => error !== '');
    if (hasErrors) {
      toast.error('Please fix all errors before submitting');
      return;
    }
    setIsLoading(true);
    try {
      await register({
        full_name: formData.name,
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirmPassword,
        date_of_birth: formData.birthDate
      });
      toast.success('Account created successfully!', {
        description: 'Please verify your email to continue'
      });
      // Redirect to verify-otp with email in URL params
      router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
    } catch (error: any) {
      toast.error('Signup failed', {
        description: error.message || 'Please try again'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 transition-colors duration-500 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <AmbientParticles />
      <FloatingOrbs />

      <div className="w-full max-w-md relative z-10">
        {/* Theme Toggle */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-end mb-4"
        >
          <motion.button
            onClick={toggleTheme}
            className="p-3 rounded-2xl bg-white/10 dark:bg-white/10 backdrop-blur-xl border border-white/20 dark:border-white/20 hover:bg-white/20 dark:hover:bg-white/20 transition-colors"
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            {theme === 'light' ? (
              <MoonIcon className="w-5 h-5 text-gray-700 dark:text-white" />
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
            <span className="text-3xl font-bold text-gray-900 dark:text-white">NumerAI</span>
          </motion.div>
          <p className="text-gray-700 dark:text-white/70">
            Begin your personalized numerology journey
          </p>
        </motion.div>

        {/* Signup Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard variant="liquid-premium" className="p-6 sm:p-8">
            <div className="liquid-glass-content">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Create Account
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white/90 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600 dark:text-white/60" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      onBlur={() => handleBlur('name')}
                      className={`w-full pl-10 pr-10 py-3 bg-white/50 dark:bg-white/10 backdrop-blur-xl border ${
                        touched.name && errors.name
                          ? 'border-red-500'
                          : touched.name && !errors.name && formData.name
                          ? 'border-green-500'
                          : 'border-gray-300 dark:border-white/20'
                      } rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white/50`}
                      placeholder="John Doe"
                    />
                    {touched.name && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {errors.name ? (
                          <AlertCircleIcon className="w-5 h-5 text-red-500" />
                        ) : formData.name ? (
                          <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        ) : null}
                      </motion.div>
                    )}
                  </div>
                  <AnimatePresence>
                    {touched.name && errors.name && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-2 text-sm text-red-400 flex items-center gap-1"
                      >
                        <AlertCircleIcon className="w-4 h-4" />
                        {errors.name}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Email Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white/90 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600 dark:text-white/60" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={() => handleBlur('email')}
                      className={`w-full pl-10 pr-10 py-3 bg-white/50 dark:bg-white/10 backdrop-blur-xl border ${
                        touched.email && errors.email
                          ? 'border-red-500'
                          : touched.email && !errors.email && formData.email
                          ? 'border-green-500'
                          : 'border-gray-300 dark:border-white/20'
                      } rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white/50`}
                      placeholder="your@email.com"
                    />
                    {touched.email && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {errors.email ? (
                          <AlertCircleIcon className="w-5 h-5 text-red-500" />
                        ) : formData.email ? (
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
                        className="mt-2 text-sm text-red-400 flex items-center gap-1"
                      >
                        <AlertCircleIcon className="w-4 h-4" />
                        {errors.email}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Birth Date Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white/90 mb-2">
                    Birth Date
                  </label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600 dark:text-white/60" />
                    <input
                      type="date"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleChange}
                      onBlur={() => handleBlur('birthDate')}
                      className={`w-full pl-10 pr-10 py-3 bg-white/50 dark:bg-white/10 backdrop-blur-xl border ${
                        touched.birthDate && errors.birthDate
                          ? 'border-red-500'
                          : touched.birthDate && !errors.birthDate && formData.birthDate
                          ? 'border-green-500'
                          : 'border-gray-300 dark:border-white/20'
                      } rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white/50`}
                    />
                    {touched.birthDate && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {errors.birthDate ? (
                          <AlertCircleIcon className="w-5 h-5 text-red-500" />
                        ) : formData.birthDate ? (
                          <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        ) : null}
                      </motion.div>
                    )}
                  </div>
                  <AnimatePresence>
                    {touched.birthDate && errors.birthDate && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-2 text-sm text-red-400 flex items-center gap-1"
                      >
                        <AlertCircleIcon className="w-4 h-4" />
                        {errors.birthDate}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white/90 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600 dark:text-white/60" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={() => handleBlur('password')}
                      className={`w-full pl-10 pr-20 py-3 bg-white/50 dark:bg-white/10 backdrop-blur-xl border ${
                        touched.password && errors.password
                          ? 'border-red-500'
                          : touched.password && !errors.password && formData.password
                          ? 'border-green-500'
                          : 'border-gray-300 dark:border-white/20'
                      } rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white/50`}
                      placeholder="••••••••"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                      {touched.password && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                          {errors.password ? (
                            <AlertCircleIcon className="w-5 h-5 text-red-500" />
                          ) : formData.password ? (
                            <CheckCircleIcon className="w-5 h-5 text-green-500" />
                          ) : null}
                        </motion.div>
                      )}
                      <motion.button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white/90"
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
                        className="mt-2 text-sm text-red-400 flex items-center gap-1"
                      >
                        <AlertCircleIcon className="w-4 h-4" />
                        {errors.password}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Confirm Password Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white/90 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600 dark:text-white/60" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onBlur={() => handleBlur('confirmPassword')}
                      className={`w-full pl-10 pr-20 py-3 bg-white/50 dark:bg-white/10 backdrop-blur-xl border ${
                        touched.confirmPassword && errors.confirmPassword
                          ? 'border-red-500'
                          : touched.confirmPassword && !errors.confirmPassword && formData.confirmPassword
                          ? 'border-green-500'
                          : 'border-gray-300 dark:border-white/20'
                      } rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white/50`}
                      placeholder="••••••••"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                      {touched.confirmPassword && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                          {errors.confirmPassword ? (
                            <AlertCircleIcon className="w-5 h-5 text-red-500" />
                          ) : formData.confirmPassword ? (
                            <CheckCircleIcon className="w-5 h-5 text-green-500" />
                          ) : null}
                        </motion.div>
                      )}
                      <motion.button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white/90"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {showConfirmPassword ? (
                          <EyeOffIcon className="w-5 h-5" />
                        ) : (
                          <EyeIcon className="w-5 h-5" />
                        )}
                      </motion.button>
                    </div>
                  </div>
                  <AnimatePresence>
                    {touched.confirmPassword && errors.confirmPassword && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-2 text-sm text-red-400 flex items-center gap-1"
                      >
                        <AlertCircleIcon className="w-4 h-4" />
                        {errors.confirmPassword}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Submit Button */}
                <GlassButton
                  type="submit"
                  variant="liquid"
                  size="md"
                  className="w-full glass-glow"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <motion.div
                      className="flex items-center gap-2"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <motion.div
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      />
                      Creating account...
                    </motion.div>
                  ) : (
                    'Create Account'
                  )}
                </GlassButton>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white/50 dark:bg-white/5 backdrop-blur-xl text-gray-600 dark:text-white/60 rounded-full">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Social Signup */}
              <div className="grid grid-cols-2 gap-3">
                <GlassButton variant="secondary" size="sm">
                  <Image
                    src="https://www.google.com/favicon.ico"
                    alt="Google"
                    width={20}
                    height={20}
                    className="mr-2"
                  />
                  Google
                </GlassButton>
                <GlassButton variant="secondary" size="sm">
                  <Image
                    src="https://www.facebook.com/favicon.ico"
                    alt="Facebook"
                    width={20}
                    height={20}
                    className="mr-2"
                  />
                  Facebook
                </GlassButton>
              </div>

              {/* Login Link */}
              <p className="text-center mt-6 text-gray-700 dark:text-white/70">
                Already have an account?{' '}
                <motion.button
                  onClick={() => router.push('/login')}
                  className="text-purple-600 dark:text-purple-300 hover:text-purple-700 dark:hover:text-purple-200 font-semibold transition-colors"
                  whileHover={{ x: 2 }}
                >
                  Sign in
                </motion.button>
              </p>
            </div>
          </GlassCard>
        </motion.div>

        {/* Back to Home */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={() => router.push('/')}
          className="w-full mt-4 text-center text-gray-700 dark:text-white/70 hover:text-gray-900 dark:hover:text-white transition-colors"
          whileHover={{ x: -4 }}
        >
          ← Back to home
        </motion.button>
      </div>
    </div>
  );
}
