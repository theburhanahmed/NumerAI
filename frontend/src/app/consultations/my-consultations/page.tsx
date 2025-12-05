'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, Video, MessageSquare, Phone, X, RefreshCw } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
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
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Consultations</h1>
          <div className="flex gap-2">
            <GlassButton
              variant="liquid"
              size="sm"
              onClick={() => setFilter('upcoming')}
              className={filter === 'upcoming' ? 'opacity-100' : 'opacity-50'}
            >
              Upcoming
            </GlassButton>
            <GlassButton
              variant="liquid"
              size="sm"
              onClick={() => setFilter('past')}
              className={filter === 'past' ? 'opacity-100' : 'opacity-50'}
            >
              Past
            </GlassButton>
          </div>
        </div>

        {consultations.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              No {filter} consultations found.
            </p>
          </GlassCard>
        ) : (
          <div className="grid gap-4">
            {consultations.map((consultation) => {
              const expert = typeof consultation.expert === 'object' ? consultation.expert : null;
              const scheduledDate = new Date(consultation.scheduled_at);
              
              return (
                <GlassCard key={consultation.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">
                          {expert?.name || 'Expert'}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(consultation.status)}`}>
                          {consultation.status}
                        </span>
                        <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          {getTypeIcon(consultation.consultation_type)}
                          <span className="capitalize">{consultation.consultation_type}</span>
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
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
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                          {consultation.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <GlassButton
                        variant="liquid"
                        size="sm"
                        onClick={() => router.push(`/consultations/${consultation.id}`)}
                      >
                        View Details
                      </GlassButton>
                      {consultation.consultation_type === 'video' && consultation.meeting_link && (
                        <GlassButton
                          variant="liquid"
                          size="sm"
                          onClick={() => window.open(consultation.meeting_link, '_blank')}
                        >
                          Join Meeting
                        </GlassButton>
                      )}
                      {consultation.can_be_cancelled && (
                        <GlassButton
                          variant="liquid"
                          size="sm"
                          onClick={() => handleCancel(consultation.id)}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </GlassButton>
                      )}
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

