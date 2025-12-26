'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api-client';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/components/ui/use-toast';
import { GlassButton } from '@/components/glassmorphism/glass-button';
import { Loader2 } from 'lucide-react';

interface AppleSignInButtonProps {
  mode?: 'login' | 'register';
}

export function AppleSignInButton({ mode = 'login' }: AppleSignInButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useAuth();
  const { toast } = useToast();

  const handleAppleSignIn = async () => {
    try {
      setLoading(true);

      // Check if Apple Sign-In is available
      if (typeof window === 'undefined' || !window.AppleID) {
        toast({
          title: 'Error',
          description: 'Apple Sign-In is not available in this browser',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Initialize Apple Sign-In
      window.AppleID.auth.init({
        clientId: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID || '',
        scope: 'name email',
        redirectURI: `${window.location.origin}/auth/apple/callback`,
        usePopup: false,
      });

      // Sign in with Apple
      const response = await window.AppleID.auth.signIn({
        requestedScopes: ['name', 'email'],
      });

      if (response.error) {
        throw new Error(response.error);
      }

      // Send identity token to backend
      const apiResponse = await authAPI.appleSignIn({
        identity_token: response.id_token,
        authorization_code: response.code,
      });

      // Store tokens
      localStorage.setItem('access_token', apiResponse.data.access_token);
      localStorage.setItem('refresh_token', apiResponse.data.refresh_token);
      localStorage.setItem('user', JSON.stringify(apiResponse.data.user));

      // Update auth context
      setUser(apiResponse.data.user);

      toast({
        title: 'Success',
        description: 'Signed in with Apple successfully!',
      });

      router.push('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Apple Sign-In failed',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassButton
      variant="secondary"
      className="w-full bg-black text-white hover:bg-gray-800"
      onClick={handleAppleSignIn}
      disabled={loading || !process.env.NEXT_PUBLIC_APPLE_CLIENT_ID}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.96-3.24-1.44-1.56-.62-2.39-1.45-2.39-2.37 0-1.13.89-1.77 2.12-2.37 1.23-.59 2.7-.9 4.24-.9 1.54 0 3 .31 4.24.9 1.23.6 2.12 1.24 2.12 2.37 0 .92-.83 1.75-2.39 2.37-1.16.48-2.15.94-3.24 1.44-1.03.48-2.1.55-3.08-.4M12 2C6.5 2 2 6.5 2 12c0 5.5 4.5 10 10 10 5.5 0 10-4.5 10-10C22 6.5 17.5 2 12 2Z"/>
          </svg>
          {mode === 'login' ? 'Sign in with Apple' : 'Sign up with Apple'}
        </>
      )}
    </GlassButton>
  );
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    AppleID: any;
  }
}

