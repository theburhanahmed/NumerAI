'use client';

import { useState, useEffect } from 'react';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { authAPI } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import OTPForm from './otp-form';

function VerifyOTPContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  
  return <OTPForm email={email} />;
}

export default function VerifyOTPPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Suspense 
        fallback={
          <Card className="w-full max-w-md p-6">
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </Card>
        }
      >
        <VerifyOTPContent />
      </Suspense>
    </div>
  );
}