'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar, Clock, DollarSign, MessageSquare, Video, Phone } from 'lucide-react';
import { SpaceCard } from '@/components/space/space-card';
import { TouchOptimizedButton } from '@/components/buttons/touch-optimized-button';
import { CosmicPageLayout } from '@/components/cosmic/cosmic-page-layout';
import { consultationsAPI } from '@/lib/consultations-api';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import type { Expert, TimeSlot } from '@/types/consultations';

function BookConsultationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const expertId = searchParams.get('expert_id');

  const [expert, setExpert] = useState<Expert | null>(null);
  const [consultationType, setConsultationType] = useState<'video' | 'chat' | 'phone'>('video');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [duration, setDuration] = useState<number>(30);
  const [notes, setNotes] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const loadExpert = useCallback(async () => {
    if (!expertId) return;
    try {
      const expertData = await consultationsAPI.getExpert(expertId);
      setExpert(expertData);
    } catch (error) {
      toast.error('Failed to load expert details');
      router.push('/consultations');
    }
  }, [expertId, router]);

  const loadAvailableSlots = useCallback(async () => {
    if (!expertId || !selectedDate) return;
    setLoadingSlots(true);
    try {
      const data = await consultationsAPI.getAvailableTimeSlots(expertId, selectedDate, duration);
      setAvailableSlots(data.available_slots);
    } catch (error) {
      toast.error('Failed to load available slots');
    } finally {
      setLoadingSlots(false);
    }
  }, [expertId, selectedDate, duration]);

  useEffect(() => {
    if (expertId) {
      loadExpert();
    }
  }, [expertId, loadExpert]);

  useEffect(() => {
    if (selectedDate && expertId) {
      loadAvailableSlots();
    }
  }, [selectedDate, expertId, loadAvailableSlots]);

  const handleBooking = async () => {
    if (!expertId || !selectedDate || !selectedTime) {
      toast.error('Please select date and time');
      return;
    }

    const scheduledAt = new Date(`${selectedDate}T${selectedTime}`);
    
    setLoading(true);
    try {
      const consultation = await consultationsAPI.bookConsultation({
        expert_id: expertId,
        consultation_type: consultationType,
        scheduled_at: scheduledAt.toISOString(),
        duration_minutes: duration,
        notes,
      });
      
      toast.success('Consultation booked successfully!');
      router.push(`/consultations/${consultation.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to book consultation');
    } finally {
      setLoading(false);
    }
  };

  if (!expert) {
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
      <div className="max-w-4xl mx-auto">
        <SpaceCard variant="premium" className="p-8" glow>
          <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Book Consultation</h1>
          
          {/* Expert Info */}
          <div className="mb-6 p-4 bg-[#1a2942]/40 rounded-lg">
            <h2 className="text-xl font-semibold mb-2 text-white">{expert.name}</h2>
            <p className="text-white/70">{expert.bio}</p>
          </div>

          {/* Consultation Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3 text-white/90">Consultation Type</label>
            <div className="grid grid-cols-3 gap-4">
              {[
                { type: 'video' as const, icon: Video, label: 'Video Call' },
                { type: 'chat' as const, icon: MessageSquare, label: 'Chat' },
                { type: 'phone' as const, icon: Phone, label: 'Phone' },
              ].map(({ type, icon: Icon, label }) => (
                <button
                  key={type}
                  onClick={() => setConsultationType(type)}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    consultationType === type
                      ? 'border-cyan-500 bg-cyan-500/20'
                      : 'border-cyan-500/20 bg-[#1a2942]/40'
                  }`}
                >
                  <Icon className={`w-6 h-6 mx-auto mb-2 ${consultationType === type ? 'text-cyan-400' : 'text-white/70'}`} />
                  <div className={`text-sm font-medium ${consultationType === type ? 'text-white' : 'text-white/70'}`}>{label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Date Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-white/90">Select Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-cyan-500/20 rounded-lg bg-[#1a2942]/40 text-white"
            />
          </div>

          {/* Time Slots */}
          {selectedDate && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-white/90">Available Time Slots</label>
              {loadingSlots ? (
                <div className="text-center py-4 text-white/70">Loading slots...</div>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-4 gap-2">
                  {availableSlots.map((slot) => {
                    const slotTime = new Date(slot);
                    const timeStr = slotTime.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    });
                    return (
                      <button
                        key={slot}
                        onClick={() => setSelectedTime(timeStr)}
                        className={`p-2 rounded border transition-colors ${
                          selectedTime === timeStr
                            ? 'border-cyan-500 bg-cyan-500/20 text-white'
                            : 'border-cyan-500/20 bg-[#1a2942]/40 text-white/70'
                        }`}
                      >
                        {timeStr}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-white/70">No available slots</div>
              )}
            </div>
          )}

          {/* Duration */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-white/90">Duration (minutes)</label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full px-4 py-2 border border-cyan-500/20 rounded-lg bg-[#1a2942]/40 text-white"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
            </select>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-white/90">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-cyan-500/20 rounded-lg bg-[#1a2942]/40 text-white placeholder-white/50"
              placeholder="Any specific questions or topics you'd like to discuss..."
            />
          </div>

          {/* Submit */}
          <TouchOptimizedButton
            onClick={handleBooking}
            disabled={loading || !selectedDate || !selectedTime}
            loading={loading}
            className="w-full"
          >
            Book Consultation
          </TouchOptimizedButton>
        </SpaceCard>
      </div>
    </CosmicPageLayout>
  );
}

export default function BookConsultationPage() {
  return (
    <Suspense fallback={
      <CosmicPageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
        </div>
      </CosmicPageLayout>
    }>
      <BookConsultationContent />
    </Suspense>
  );
}

