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
    if (!user) return;

    let retryCount = 0;
    const MAX_RETRIES = 3;
    let isMounted = true;

    const fetchUnreadCount = async () => {
      try {
        const response = await notificationAPI.getUnreadCount();
        if (isMounted) {
          setUnreadCount(response.data.count || 0);
          retryCount = 0; // Reset retry count on success
        }
      } catch (error: any) {
        // Don't log 429 errors (rate limiting) or 500 errors (table might not exist yet)
        if (error?.response?.status !== 429 && error?.response?.status !== 500) {
          console.error('Error fetching unread count:', error);
        }
        // If we get repeated errors, stop polling
        retryCount++;
        if (retryCount >= MAX_RETRIES && isMounted) {
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
    
    // Poll for updates every 60 seconds (reduced from 30s to prevent rate limiting)
    const interval = setInterval(() => {
      if (retryCount < MAX_RETRIES) {
        fetchUnreadCount();
      }
    }, 60000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
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

