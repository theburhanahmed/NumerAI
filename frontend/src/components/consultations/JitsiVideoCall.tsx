'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';

interface JitsiVideoCallProps {
  roomName: string;
  userDisplayName: string;
  onMeetingEnd?: () => void;
  domain?: string;
  className?: string;
}

export function JitsiVideoCall({
  roomName,
  userDisplayName,
  onMeetingEnd,
  domain = 'meet.jit.si',
  className = '',
}: JitsiVideoCallProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Load Jitsi Meet API
    const script = document.createElement('script');
    script.src = `https://${domain}/external_api.js`;
    script.async = true;
    script.onload = () => {
      if (window.JitsiMeetJS) {
        const options = {
          roomName: roomName,
          parentNode: containerRef.current,
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
          },
          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: [
              'microphone',
              'camera',
              'closedcaptions',
              'desktop',
              'fullscreen',
              'fodeviceselection',
              'hangup',
              'profile',
              'chat',
              'recording',
              'livestreaming',
              'settings',
              'raisehand',
              'videoquality',
              'filmstrip',
              'invite',
              'feedback',
              'stats',
              'shortcuts',
              'tileview',
              'videobackgroundblur',
              'download',
              'help',
              'mute-everyone',
              'mute-video-everyone',
            ],
            SETTINGS_SECTIONS: ['devices', 'language', 'moderator', 'profile'],
            DEFAULT_BACKGROUND: '#474747',
          },
          userInfo: {
            displayName: userDisplayName,
          },
        };

        try {
          const api = new window.JitsiMeetJS.JitsiMeetExternalAPI(domain, options);
          setIsLoaded(true);

          // Handle meeting end
          api.addEventListener('videoConferenceLeft', () => {
            if (onMeetingEnd) {
              onMeetingEnd();
            }
          });

          // Handle errors
          api.addEventListener('errorOccurred', (error: any) => {
            console.error('Jitsi error:', error);
          });

          // Store API instance for cleanup
          return () => {
            api.dispose();
          };
        } catch (error) {
          console.error('Failed to initialize Jitsi:', error);
        }
      }
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [roomName, userDisplayName, domain, onMeetingEnd]);

  const handleEndMeeting = () => {
    if (onMeetingEnd) {
      onMeetingEnd();
    }
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div ref={containerRef} className="w-full h-full" />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading meeting...</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Extend Window interface for Jitsi
declare global {
  interface Window {
    JitsiMeetJS: any;
  }
}

