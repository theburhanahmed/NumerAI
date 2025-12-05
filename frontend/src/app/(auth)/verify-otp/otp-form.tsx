'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { authAPI } from '@/lib/api-client';
import { motion } from 'framer-motion';
import { 
  MailIcon,
  ShieldCheckIcon,
  AlertCircleIcon
} from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { useToast } from '@/components/ui/use-toast';

interface OTPFormProps {
  email: string;
  phone?: string;
}

export default function OTPForm({ email, phone }: OTPFormProps) {
  const router = useRouter();
  const { verifyOTP, user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [otp, setOtp] = useState('');

  // Redirect authenticated users
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  // Validate email/phone is provided
  useEffect(() => {
    if (!authLoading && !email && !phone) {
      toast({
        title: 'Missing Information',
        description: 'Email or phone number is required for verification. Please register first.',
        variant: 'destructive',
      });
      router.push('/register');
    }
  }, [email, phone, authLoading, router, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await verifyOTP({ email: email || undefined, phone: phone || undefined, otp });
      toast({
        title: 'Success',
        description: 'Account verified successfully!',
      });
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'OTP verification failed. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResending(true);
    try {
      await authAPI.resendOTP({ email: email || undefined, phone: phone || undefined });
      toast({
        title: 'Success',
        description: `OTP has been resent to ${email || phone || 'your account'}.`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error?.message || 'Failed to resend OTP.',
        variant: 'destructive',
      });
    } finally {
      setResending(false);
    }
  };

  // Show error if no email/phone
  if (!email && !phone) {
    return (
      <GlassCard variant="elevated" className="p-8">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircleIcon className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Missing Information
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Email or phone number is required for verification.
          </p>
          <GlassButton
            onClick={() => router.push('/register')}
            variant="primary"
            className="w-full"
          >
            Go to Registration
          </GlassButton>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard variant="elevated" className="p-8">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShieldCheckIcon className="w-6 h-6 text-white" />
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Enter the 6-digit code sent to
        </p>
        <p className="font-medium text-gray-900 dark:text-white flex items-center justify-center gap-2 mt-1">
          <MailIcon className="w-4 h-4" />
          {email || phone}
        </p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
              OTP Code
            </label>
            <input
              id="otp"
              type="text"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              disabled={loading}
              maxLength={6}
              className="w-full px-3 py-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-center text-2xl tracking-widest"
            />
            <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
              Code expires in 10 minutes
            </p>
          </div>
          
          <div className="space-y-4">
            <GlassButton
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={loading || otp.length !== 6}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Verifying...
                </div>
              ) : (
                "Verify Account"
              )}
            </GlassButton>
            
            <GlassButton
              type="button"
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={handleResendOTP}
              disabled={resending || (!email && !phone)}
            >
              {resending ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-gray-400/30 border-t-gray-600 dark:border-gray-500/30 dark:border-t-gray-300 rounded-full animate-spin mr-2"></div>
                  Resending...
                </div>
              ) : (
                "Resend OTP"
              )}
            </GlassButton>
          </div>
        </div>
      </form>
    </GlassCard>
  );
}