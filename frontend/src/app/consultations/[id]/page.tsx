'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Calendar, Clock, Video, MessageSquare, Phone, X, RefreshCw, Star } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 p-8">
      <div className="max-w-4xl mx-auto">
        <GlassCard className="p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Consultation Details</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {expert?.name || 'Expert'} - {format(scheduledDate, 'MMM dd, yyyy HH:mm')}
            </p>
          </div>

          <div className="space-y-6">
            {/* Status */}
            <div>
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {consultation.status}
              </span>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Type</label>
                <p className="capitalize">{consultation.consultation_type}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Duration</label>
                <p>{consultation.duration_minutes} minutes</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Date</label>
                <p>{format(scheduledDate, 'MMM dd, yyyy')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Time</label>
                <p>{format(scheduledDate, 'HH:mm')}</p>
              </div>
            </div>

            {consultation.notes && (
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Notes</label>
                <p className="mt-1">{consultation.notes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              {consultation.consultation_type === 'video' && consultation.status === 'confirmed' && (
                <GlassButton onClick={handleJoinMeeting}>
                  <Video className="w-4 h-4 mr-2" />
                  Join Meeting
                </GlassButton>
              )}
              {consultation.can_be_cancelled && (
                <GlassButton
                  variant="liquid"
                  onClick={handleCancel}
                  className="bg-red-500 hover:bg-red-600"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </GlassButton>
              )}
              {consultation.can_be_rescheduled && (
                <GlassButton variant="liquid" onClick={handleReschedule}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reschedule
                </GlassButton>
              )}
            </div>

            {/* Review Section */}
            {consultation.status === 'completed' && (
              <GlassCard className="p-6">
                <h2 className="text-xl font-semibold mb-4">Leave a Review</h2>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      >
                        <Star className="w-6 h-6 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Review</label>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                    placeholder="Share your experience..."
                  />
                </div>
                <GlassButton onClick={handleSubmitReview}>
                  Submit Review
                </GlassButton>
              </GlassCard>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

