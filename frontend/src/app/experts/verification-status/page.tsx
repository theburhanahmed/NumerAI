'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Clock, FileText, Upload } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { expertAPI, type VerificationStatus } from '@/lib/expert-api';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import type { ExpertApplication, ExpertVerificationDocument } from '@/types/consultations';

export default function VerificationStatusPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [application, setApplication] = useState<ExpertApplication | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadStatus();
    }
  }, [user]);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const statusData = await expertAPI.getVerificationStatus();
      setStatus(statusData);
      
      if (statusData.application_id) {
        try {
          const appData = await expertAPI.getMyApplication();
          setApplication(appData);
        } catch (error) {
          // Application might not exist yet
        }
      }
    } catch (error) {
      toast.error('Failed to load verification status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (!status) return null;
    
    switch (status.verification_status) {
      case 'approved':
      case 'verified':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-16 h-16 text-red-500" />;
      default:
        return <Clock className="w-16 h-16 text-yellow-500" />;
    }
  };

  const getStatusMessage = () => {
    if (!status) return '';
    
    switch (status.verification_status) {
      case 'approved':
      case 'verified':
        return 'Your expert application has been approved! You can now start accepting consultations.';
      case 'rejected':
        return application?.rejection_reason || 'Your application was rejected.';
      case 'application_pending':
        return `Your application is ${application?.status || 'pending'} review.`;
      default:
        return 'You have not submitted an expert application yet.';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 p-8">
      <div className="max-w-3xl mx-auto">
        <GlassCard className="p-8">
          <div className="text-center mb-8">
            {getStatusIcon()}
            <h1 className="text-3xl font-bold mt-4 mb-2">Verification Status</h1>
            <p className="text-gray-600 dark:text-gray-400">{getStatusMessage()}</p>
          </div>

          {status?.verification_status === 'not_applied' && (
            <div className="text-center">
              <GlassButton onClick={() => router.push('/experts/apply')}>
                Apply as Expert
              </GlassButton>
            </div>
          )}

          {application && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Application Status</label>
                <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg capitalize">
                  {application.status}
                </div>
              </div>

              {application.rejection_reason && (
                <div>
                  <label className="block text-sm font-medium mb-2">Rejection Reason</label>
                  <div className="px-4 py-2 bg-red-50 dark:bg-red-900 rounded-lg">
                    {application.rejection_reason}
                  </div>
                </div>
              )}

              {application.status === 'rejected' && (
                <div className="text-center">
                  <GlassButton onClick={() => router.push('/experts/apply')}>
                    Reapply
                  </GlassButton>
                </div>
              )}
            </div>
          )}

          {status?.is_verified && (
            <div className="mt-6 text-center">
              <GlassButton onClick={() => router.push('/consultations/expert')}>
                Go to Expert Dashboard
              </GlassButton>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}

