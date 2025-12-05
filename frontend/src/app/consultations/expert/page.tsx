'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, Users, Star, CheckCircle, XCircle } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Expert Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <GlassCard className="p-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{dashboard.stats.total_consultations}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Consultations</div>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{dashboard.stats.completed}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-6">
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">{dashboard.stats.rating.toFixed(1)}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Rating</div>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-6">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">{dashboard.pending_confirmations}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Upcoming Consultations */}
        <GlassCard className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Upcoming Consultations</h2>
          {dashboard.upcoming_consultations.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">No upcoming consultations</p>
          ) : (
            <div className="space-y-4">
              {dashboard.upcoming_consultations.map((consultation) => {
                const scheduledDate = new Date(consultation.scheduled_at);
                return (
                  <div
                    key={consultation.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
                  >
                    <div>
                      <div className="font-medium">
                        {typeof consultation.expert === 'object'
                          ? consultation.expert.name
                          : 'User'}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {format(scheduledDate, 'MMM dd, yyyy HH:mm')} - {consultation.duration_minutes} min
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {consultation.status === 'pending' && (
                        <GlassButton
                          variant="liquid"
                          size="sm"
                          onClick={() => handleConfirm(consultation.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Confirm
                        </GlassButton>
                      )}
                      <GlassButton
                        variant="liquid"
                        size="sm"
                        onClick={() => router.push(`/consultations/${consultation.id}`)}
                      >
                        View Details
                      </GlassButton>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>

        {/* Quick Actions */}
        <div className="flex gap-4">
          <GlassButton
            variant="liquid"
            onClick={() => router.push('/consultations/expert/availability')}
          >
            Manage Availability
          </GlassButton>
          <GlassButton
            variant="liquid"
            onClick={() => router.push('/consultations/expert/consultations')}
          >
            View All Consultations
          </GlassButton>
        </div>
      </div>
    </div>
  );
}

