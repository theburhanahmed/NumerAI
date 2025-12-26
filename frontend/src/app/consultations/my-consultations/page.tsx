'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, Video, MessageSquare, Phone, X, RefreshCw } from 'lucide-react';
import { SpaceCard } from '@/components/space/space-card';
import { TouchOptimizedButton } from '@/components/buttons/touch-optimized-button';
import { CosmicPageLayout } from '@/components/cosmic/cosmic-page-layout';
import { consultationsAPI } from '@/lib/consultations-api';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { Consultation } from '@/types/consultations';

export default function MyConsultationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming');

  const loadConsultations = useCallback(async () => {
    setLoading(true);
    try {
      const data = filter === 'upcoming'
        ? await consultationsAPI.getMyConsultations()
        : await consultationsAPI.getPastConsultations();
      setConsultations(data.results);
    } catch (error) {
      toast.error('Failed to load consultations');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (user) {
      loadConsultations();
    }
  }, [user, filter, loadConsultations]);

  const handleCancel = async (consultationId: string) => {
    if (!confirm('Are you sure you want to cancel this consultation?')) return;
    
    try {
      await consultationsAPI.cancelConsultation(consultationId, {
        cancellation_reason: 'Cancelled by user',
      });
      toast.success('Consultation cancelled');
      loadConsultations();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to cancel consultation');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/20 text-green-300 border border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30';
      case 'completed':
        return 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-300 border border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border border-gray-500/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'chat':
        return <MessageSquare className="w-4 h-4" />;
      case 'phone':
        return <Phone className="w-4 h-4" />;
      default:
        return null;
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

  return (
    <CosmicPageLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">My Consultations</h1>
          <div className="flex gap-2">
            <TouchOptimizedButton
              variant={filter === 'upcoming' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilter('upcoming')}
            >
              Upcoming
            </TouchOptimizedButton>
            <TouchOptimizedButton
              variant={filter === 'past' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilter('past')}
            >
              Past
            </TouchOptimizedButton>
          </div>
        </div>

        {consultations.length === 0 ? (
          <SpaceCard variant="premium" className="p-8 text-center" glow>
            <p className="text-white/70">
              No {filter} consultations found.
            </p>
          </SpaceCard>
        ) : (
          <div className="grid gap-4">
            {consultations.map((consultation) => {
              const expert = typeof consultation.expert === 'object' ? consultation.expert : null;
              const scheduledDate = new Date(consultation.scheduled_at);
              
              return (
                <SpaceCard key={consultation.id} variant="premium" className="p-6" glow>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-white">
                          {expert?.name || 'Expert'}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(consultation.status)}`}>
                          {consultation.status}
                        </span>
                        <span className="flex items-center gap-1 text-white/70">
                          {getTypeIcon(consultation.consultation_type)}
                          <span className="capitalize">{consultation.consultation_type}</span>
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-white/70 mb-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(scheduledDate, 'MMM dd, yyyy')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {format(scheduledDate, 'HH:mm')}
                        </div>
                        <div>
                          {consultation.duration_minutes} minutes
                        </div>
                      </div>

                      {consultation.notes && (
                        <p className="text-sm text-white/80 mb-4">
                          {consultation.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <TouchOptimizedButton
                        variant="secondary"
                        size="sm"
                        onClick={() => router.push(`/consultations/${consultation.id}`)}
                      >
                        View Details
                      </TouchOptimizedButton>
                      {consultation.consultation_type === 'video' && consultation.meeting_link && (
                        <TouchOptimizedButton
                          variant="secondary"
                          size="sm"
                          onClick={() => window.open(consultation.meeting_link, '_blank')}
                        >
                          Join Meeting
                        </TouchOptimizedButton>
                      )}
                      {consultation.can_be_cancelled && (
                        <TouchOptimizedButton
                          variant="secondary"
                          size="sm"
                          onClick={() => handleCancel(consultation.id)}
                          className="bg-red-500 hover:bg-red-600 text-white"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </TouchOptimizedButton>
                      )}
                    </div>
                  </div>
                </SpaceCard>
              );
            })}
          </div>
        )}
      </div>
    </CosmicPageLayout>
  );
}

