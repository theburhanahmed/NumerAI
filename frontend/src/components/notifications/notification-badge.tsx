'use client';

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { notificationAPI } from '@/lib/api-client';
import { useAuth } from '@/contexts/auth-context';

interface NotificationBadgeProps {
  onClick?: () => void;
}

export function NotificationBadge({ onClick }: NotificationBadgeProps) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Check if we have a valid access token before making requests
    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!accessToken) {
      setLoading(false);
      return;
    }

    let retryCount = 0;
    const MAX_RETRIES = 3;
    let isMounted = true;
    let shouldPoll = true;

    const fetchUnreadCount = async () => {
      // Don't make requests if we've stopped polling
      if (!shouldPoll || !isMounted) {
        return;
      }

      try {
        const response = await notificationAPI.getUnreadCount();
        if (isMounted) {
          setUnreadCount(response.data.count || 0);
          retryCount = 0; // Reset retry count on success
        }
      } catch (error: any) {
        const status = error?.response?.status;
        
        // Stop polling immediately on 401 (authentication failure)
        if (status === 401) {
          shouldPoll = false;
          if (isMounted) {
            setLoading(false);
            setUnreadCount(0);
          }
          return;
        }
        
        // Don't log 429 errors (rate limiting) or 500 errors (table might not exist yet)
        if (status !== 429 && status !== 500) {
          console.error('Error fetching unread count:', error);
        }
        
        // If we get repeated errors, stop polling
        retryCount++;
        if (retryCount >= MAX_RETRIES && isMounted) {
          shouldPoll = false;
          setLoading(false);
          return; // Stop polling after max retries
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUnreadCount();
    
    // Try to use SSE for real-time updates, fallback to polling
    let eventSource: EventSource | null = null;
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    
    if (accessToken && typeof window !== 'undefined' && 'EventSource' in window) {
      try {
        // Use SSE for real-time updates
        eventSource = new EventSource(`${API_URL}/notifications/stream/`, {
          withCredentials: true,
        });
        
        // Note: EventSource doesn't support custom headers, so we'll need to pass token via query param or use polling
        // For now, keep polling but make it more efficient
      } catch (e) {
        // Fallback to polling if SSE fails
      }
    }
    
    // Poll for updates every 30 seconds (fallback if SSE not available)
    const interval = setInterval(() => {
      if (shouldPoll && retryCount < MAX_RETRIES) {
        fetchUnreadCount();
      } else {
        clearInterval(interval);
      }
    }, 30000);
    
    return () => {
      isMounted = false;
      shouldPoll = false;
      clearInterval(interval);
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [user]);

  if (!user || loading) {
    return null;
  }

  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label="Notifications"
    >
      <Bell className="w-6 h-6 text-gray-700 dark:text-gray-300" />
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
}

