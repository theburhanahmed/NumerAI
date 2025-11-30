'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { authAPI } from '@/lib/api-client';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const state = searchParams.get('state');

      if (error) {
        toast({
          title: 'Error',
          description: 'Google authentication was canceled or failed',
          variant: 'destructive',
        });
        router.push('/login');
        return;
      }

      if (!code) {
        toast({
          title: 'Error',
          description: 'No authorization code received',
          variant: 'destructive',
        });
        router.push('/login');
        return;
      }

      try {
        // Send code to backend to exchange for access token and authenticate
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
        const response = await fetch(`${API_URL}/auth/social/google/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            code,
            redirect_uri: `${window.location.origin}/auth/google/callback`,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to authenticate');
        }

        const data = await response.json();
        
        // Store tokens
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Update auth context
        setUser(data.user);
        
        toast({
          title: 'Success',
          description: 'Signed in with Google successfully!',
        });

        // Redirect based on state or default to dashboard
        const stateData = state ? JSON.parse(atob(state)) : {};
        router.push(stateData.redirect || '/dashboard');
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Google authentication failed',
          variant: 'destructive',
        });
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, router, setUser, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
        <p className="text-gray-600 dark:text-gray-400">
          Completing Google sign-in...
        </p>
      </div>
    </div>
  );
}

