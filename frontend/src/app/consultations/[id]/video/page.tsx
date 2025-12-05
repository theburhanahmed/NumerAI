'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { X } from 'lucide-react';
import { consultationsAPI } from '@/lib/consultations-api';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import { JitsiVideoCall } from '@/components/consultations/JitsiVideoCall';

export default function VideoCallPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const consultationId = params.id as string;

  const [meetingRoomId, setMeetingRoomId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMeetingLink = useCallback(async () => {
    try {
      const { meeting_link, meeting_room_id } = await consultationsAPI.getMeetingLink(consultationId);
      if (meeting_room_id) {
        setMeetingRoomId(meeting_room_id);
        // Mark meeting as started
        await consultationsAPI.startMeeting(consultationId);
      } else {
        toast.error('Meeting room not found');
        router.push(`/consultations/${consultationId}`);
      }
    } catch (error) {
      toast.error('Failed to load meeting');
      router.push(`/consultations/${consultationId}`);
    } finally {
      setLoading(false);
    }
  }, [consultationId, router]);

  useEffect(() => {
    if (consultationId) {
      loadMeetingLink();
    }
  }, [consultationId, loadMeetingLink]);

  const handleMeetingEnd = async () => {
    try {
      await consultationsAPI.endMeeting(consultationId);
      toast.success('Meeting ended');
    } catch (error) {
      // Ignore errors on end
    }
    router.push(`/consultations/${consultationId}`);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading meeting...</p>
        </div>
      </div>
    );
  }

  if (!meetingRoomId) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      <JitsiVideoCall
        roomName={meetingRoomId}
        userDisplayName={user?.full_name || 'User'}
        onMeetingEnd={handleMeetingEnd}
        className="w-full h-full"
      />
      <button
        onClick={handleMeetingEnd}
        className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 z-10"
      >
        <X className="w-4 h-4" />
        Leave Meeting
      </button>
    </div>
  );
}

