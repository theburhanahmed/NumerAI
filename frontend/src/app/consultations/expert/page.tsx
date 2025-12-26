'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, Users, Star, CheckCircle, XCircle } from 'lucide-react';
import { SpaceCard } from '@/components/space/space-card';
import { TouchOptimizedButton } from '@/components/buttons/touch-optimized-button';
import { CosmicPageLayout } from '@/components/cosmic/cosmic-page-layout';
import { consultationsAPI } from '@/lib/consultations-api';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { ExpertDashboard, Consultation } from '@/types/consultations';

export default function ExpertDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<ExpertDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const data = await consultationsAPI.getExpertDashboard();
      setDashboard(data);
    } catch (error: any) {
      if (error.response?.status === 403) {
        toast.error('You are not registered as an expert');
        router.push('/experts/apply');
      } else {
        toast.error('Failed to load dashboard');
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (user) {
      loadDashboard();
    }
  }, [user, loadDashboard]);

  const handleConfirm = async (consultationId: string) => {
    try {
      await consultationsAPI.confirmConsultation(consultationId);
      toast.success('Consultation confirmed');
      loadDashboard();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to confirm consultation');
    }
  };

  if (loading) {
    return (
      <CosmicPageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
        </div>
      </CosmicPageLayout>
    );
  }

  if (!dashboard) {
    return null;
  }

  return (
    <CosmicPageLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Expert Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <SpaceCard variant="elevated" className="p-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-cyan-400" />
              <div>
                <div className="text-2xl font-bold text-white">{dashboard.stats.total_consultations}</div>
                <div className="text-sm text-white/70">Total Consultations</div>
              </div>
            </div>
          </SpaceCard>
          <SpaceCard variant="elevated" className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <div>
                <div className="text-2xl font-bold text-white">{dashboard.stats.completed}</div>
                <div className="text-sm text-white/70">Completed</div>
              </div>
            </div>
          </SpaceCard>
          <SpaceCard variant="elevated" className="p-6">
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8 text-yellow-400" />
              <div>
                <div className="text-2xl font-bold text-white">{dashboard.stats.rating.toFixed(1)}</div>
                <div className="text-sm text-white/70">Rating</div>
              </div>
            </div>
          </SpaceCard>
          <SpaceCard variant="elevated" className="p-6">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-orange-400" />
              <div>
                <div className="text-2xl font-bold text-white">{dashboard.pending_confirmations}</div>
                <div className="text-sm text-white/70">Pending</div>
              </div>
            </div>
          </SpaceCard>
        </div>

        {/* Upcoming Consultations */}
        <SpaceCard variant="elevated" className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-white">Upcoming Consultations</h2>
          {dashboard.upcoming_consultations.length === 0 ? (
            <p className="text-white/70">No upcoming consultations</p>
          ) : (
            <div className="space-y-4">
              {dashboard.upcoming_consultations.map((consultation) => {
                const scheduledDate = new Date(consultation.scheduled_at);
                return (
                  <div
                    key={consultation.id}
                    className="flex items-center justify-between p-4 bg-[#1a2942]/40 rounded-lg border border-cyan-500/20"
                  >
                    <div>
                      <div className="font-medium text-white">
                        {typeof consultation.expert === 'object'
                          ? consultation.expert.name
                          : 'User'}
                      </div>
                      <div className="text-sm text-white/70">
                        {format(scheduledDate, 'MMM dd, yyyy HH:mm')} - {consultation.duration_minutes} min
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {consultation.status === 'pending' && (
                        <TouchOptimizedButton
                          variant="primary"
                          size="sm"
                          onClick={() => handleConfirm(consultation.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Confirm
                        </TouchOptimizedButton>
                      )}
                      <TouchOptimizedButton
                        variant="secondary"
                        size="sm"
                        onClick={() => router.push(`/consultations/${consultation.id}`)}
                      >
                        View Details
                      </TouchOptimizedButton>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SpaceCard>

        {/* Quick Actions */}
        <div className="flex gap-4">
          <TouchOptimizedButton
            variant="primary"
            onClick={() => router.push('/consultations/expert/availability')}
          >
            Manage Availability
          </TouchOptimizedButton>
          <TouchOptimizedButton
            variant="secondary"
            onClick={() => router.push('/consultations/expert/consultations')}
          >
            View All Consultations
          </TouchOptimizedButton>
        </div>
      </div>
    </CosmicPageLayout>
  );
}

