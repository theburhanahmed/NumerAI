'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Calendar, Clock, Video, MessageSquare, Phone, X, RefreshCw, Star } from 'lucide-react';
import { SpaceCard } from '@/components/space/space-card';
import { TouchOptimizedButton } from '@/components/buttons/touch-optimized-button';
import { CosmicPageLayout } from '@/components/cosmic/cosmic-page-layout';
import { consultationsAPI } from '@/lib/consultations-api';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { ConsultationDetail } from '@/types/consultations';
import { JitsiVideoCall } from '@/components/consultations/JitsiVideoCall';

export default function ConsultationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const consultationId = params.id as string;

  const [consultation, setConsultation] = useState<ConsultationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  const loadConsultation = useCallback(async () => {
    setLoading(true);
    try {
      const data = await consultationsAPI.getConsultation(consultationId);
      setConsultation(data);
    } catch (error) {
      toast.error('Failed to load consultation details');
      router.push('/consultations/my-consultations');
    } finally {
      setLoading(false);
    }
  }, [consultationId, router]);

  useEffect(() => {
    if (consultationId) {
      loadConsultation();
    }
  }, [consultationId, loadConsultation]);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this consultation?')) return;
    
    try {
      await consultationsAPI.cancelConsultation(consultationId, {
        cancellation_reason: 'Cancelled by user',
      });
      toast.success('Consultation cancelled');
      loadConsultation();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to cancel consultation');
    }
  };

  const handleReschedule = async () => {
    // This would open a reschedule modal
    toast.info('Reschedule functionality coming soon');
  };

  const handleJoinMeeting = async () => {
    if (!consultation?.meeting_link) {
      // Get meeting link
      try {
        const { meeting_link } = await consultationsAPI.getMeetingLink(consultationId);
        if (meeting_link) {
          setShowVideo(true);
        }
      } catch (error) {
        toast.error('Failed to get meeting link');
      }
    } else {
      setShowVideo(true);
    }
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    
    try {
      await consultationsAPI.rateConsultation(consultationId, rating, reviewText);
      toast.success('Review submitted successfully');
      loadConsultation();
      setRating(0);
      setReviewText('');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit review');
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

  if (!consultation) {
    return null;
  }

  const expert = typeof consultation.expert === 'object' ? consultation.expert : null;
  const scheduledDate = new Date(consultation.scheduled_at);

  if (showVideo && consultation.meeting_room_id) {
    return (
      <div className="fixed inset-0 z-50 bg-black">
        <JitsiVideoCall
          roomName={consultation.meeting_room_id}
          userDisplayName={user?.full_name || 'User'}
          onMeetingEnd={() => {
            setShowVideo(false);
            loadConsultation();
          }}
        />
        <button
          onClick={() => setShowVideo(false)}
          className="absolute top-4 right-4 text-white bg-red-500 px-4 py-2 rounded"
        >
          Leave Meeting
        </button>
      </div>
    );
  }

  return (
    <CosmicPageLayout>
      <div className="max-w-4xl mx-auto">
        <SpaceCard variant="premium" className="p-8" glow>
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Consultation Details</h1>
            <p className="text-white/70">
              {expert?.name || 'Expert'} - {format(scheduledDate, 'MMM dd, yyyy HH:mm')}
            </p>
          </div>

          <div className="space-y-6">
            {/* Status */}
            <div>
              <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {consultation.status}
              </span>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-white/70">Type</label>
                <p className="capitalize text-white">{consultation.consultation_type}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-white/70">Duration</label>
                <p className="text-white">{consultation.duration_minutes} minutes</p>
              </div>
              <div>
                <label className="text-sm font-medium text-white/70">Date</label>
                <p className="text-white">{format(scheduledDate, 'MMM dd, yyyy')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-white/70">Time</label>
                <p className="text-white">{format(scheduledDate, 'HH:mm')}</p>
              </div>
            </div>

            {consultation.notes && (
              <div>
                <label className="text-sm font-medium text-white/70">Notes</label>
                <p className="mt-1 text-white/80">{consultation.notes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              {consultation.consultation_type === 'video' && consultation.status === 'confirmed' && (
                <TouchOptimizedButton onClick={handleJoinMeeting} icon={<Video className="w-4 h-4" />}>
                  Join Meeting
                </TouchOptimizedButton>
              )}
              {consultation.can_be_cancelled && (
                <TouchOptimizedButton
                  variant="secondary"
                  onClick={handleCancel}
                  className="bg-red-500 hover:bg-red-600 text-white"
                  icon={<X className="w-4 h-4" />}
                >
                  Cancel
                </TouchOptimizedButton>
              )}
              {consultation.can_be_rescheduled && (
                <TouchOptimizedButton variant="secondary" onClick={handleReschedule} icon={<RefreshCw className="w-4 h-4" />}>
                  Reschedule
                </TouchOptimizedButton>
              )}
            </div>

            {/* Review Section */}
            {consultation.status === 'completed' && (
              <SpaceCard variant="premium" className="p-6" glow>
                <h2 className="text-xl font-semibold mb-4 text-white">Leave a Review</h2>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-white/90">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-white/30'}`}
                      >
                        <Star className="w-6 h-6 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-white/90">Review</label>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-cyan-500/20 rounded-lg bg-[#1a2942]/40 text-white placeholder-white/50"
                    placeholder="Share your experience..."
                  />
                </div>
                <TouchOptimizedButton onClick={handleSubmitReview}>
                  Submit Review
                </TouchOptimizedButton>
              </SpaceCard>
            )}
          </div>
        </SpaceCard>
      </div>
    </CosmicPageLayout>
  );
}

