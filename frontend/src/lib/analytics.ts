/**
 * Analytics tracking utilities for frontend.
 */
import apiClient from './api-client';

export interface ActivityData {
  activity_type: string;
  activity_data?: Record<string, any>;
  page_path?: string;
  feature_name?: string;
  session_id?: string;
}

export interface EventData {
  event_name: string;
  event_category?: 'conversion' | 'engagement' | 'error';
  event_properties?: Record<string, any>;
  funnel_name?: string;
  funnel_step?: string;
  experiment_id?: string;
  variant_id?: string;
  session_id?: string;
  page_path?: string;
  referrer?: string;
}

/**
 * Track a user activity.
 */
export async function trackActivity(data: ActivityData): Promise<void> {
  try {
    await apiClient.post('/analytics/track-activity/', data);
  } catch (error) {
    // Silently fail analytics tracking to not disrupt user experience
    console.error('Failed to track activity:', error);
  }
}

/**
 * Track a specific event.
 */
export async function trackEvent(data: EventData): Promise<void> {
  try {
    await apiClient.post('/analytics/track-event/', data);
  } catch (error) {
    // Silently fail analytics tracking
    console.error('Failed to track event:', error);
  }
}

/**
 * Get or create session ID.
 */
export function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
}

/**
 * Track page view.
 */
export function trackPageView(pagePath: string, featureName?: string): void {
  trackActivity({
    activity_type: 'page_view',
    page_path: pagePath,
    feature_name: featureName || pagePath.split('/').filter(Boolean)[0] || 'home',
    session_id: getSessionId(),
  });
}

/**
 * Track feature usage.
 */
export function trackFeatureUsage(featureName: string, additionalData?: Record<string, any>): void {
  trackActivity({
    activity_type: 'feature_used',
    feature_name: featureName,
    activity_data: additionalData,
    page_path: window.location.pathname,
    session_id: getSessionId(),
  });
}

/**
 * Track button click.
 */
export function trackButtonClick(buttonName: string, location?: string): void {
  trackActivity({
    activity_type: 'button_click',
    activity_data: { button_name: buttonName, location },
    page_path: window.location.pathname,
    session_id: getSessionId(),
  });
}

/**
 * Track conversion event.
 */
export function trackConversion(
  eventName: string,
  funnelName?: string,
  funnelStep?: string,
  properties?: Record<string, any>
): void {
  trackEvent({
    event_name: eventName,
    event_category: 'conversion',
    event_properties: properties,
    funnel_name: funnelName,
    funnel_step: funnelStep,
    page_path: window.location.pathname,
    referrer: document.referrer,
    session_id: getSessionId(),
  });
}

/**
 * Track engagement event.
 */
export function trackEngagement(
  eventName: string,
  properties?: Record<string, any>
): void {
  trackEvent({
    event_name: eventName,
    event_category: 'engagement',
    event_properties: properties,
    page_path: window.location.pathname,
    session_id: getSessionId(),
  });
}

/**
 * Track performance metrics
 */
export function trackPerformance(metrics: {
  pageLoadTime?: number
  firstContentfulPaint?: number
  timeToInteractive?: number
  largestContentfulPaint?: number
}): void {
  trackEvent({
    event_name: 'performance_metrics',
    event_category: 'engagement',
    event_properties: metrics,
    page_path: typeof window !== 'undefined' ? window.location.pathname : '',
    session_id: getSessionId(),
  })
}

/**
 * Track API response time
 */
export function trackAPIResponseTime(
  endpoint: string,
  responseTime: number,
  status: number
): void {
  trackEvent({
    event_name: 'api_response_time',
    event_category: 'engagement',
    event_properties: {
      endpoint,
      response_time: responseTime,
      status,
    },
    page_path: typeof window !== 'undefined' ? window.location.pathname : '',
    session_id: getSessionId(),
  })
}

/**
 * Track user journey step
 */
export function trackJourneyStep(
  step: string,
  stepNumber: number,
  totalSteps: number,
  properties?: Record<string, any>
): void {
  trackEvent({
    event_name: 'journey_step',
    event_category: 'engagement',
    event_properties: {
      step,
      step_number: stepNumber,
      total_steps: totalSteps,
      progress: (stepNumber / totalSteps) * 100,
      ...properties,
    },
    funnel_name: 'user_journey',
    funnel_step: step,
    page_path: typeof window !== 'undefined' ? window.location.pathname : '',
    session_id: getSessionId(),
  })
}

/**
 * Initialize analytics tracking.
 */
export function initAnalytics(): void {
  if (typeof window === 'undefined') return;
  
  // Track initial page view
  trackPageView(window.location.pathname);
  
  // Track performance metrics
  if ('performance' in window && 'PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming
            trackPerformance({
              pageLoadTime: navEntry.loadEventEnd - navEntry.fetchStart,
              firstContentfulPaint: navEntry.domContentLoadedEventEnd - navEntry.fetchStart,
              timeToInteractive: navEntry.domInteractive - navEntry.fetchStart,
            })
          }
          if (entry.entryType === 'largest-contentful-paint') {
            const lcpEntry = entry as PerformanceEntry & { renderTime?: number }
            trackPerformance({
              largestContentfulPaint: lcpEntry.renderTime || 0,
            })
          }
        }
      })
      
      observer.observe({ entryTypes: ['navigation', 'largest-contentful-paint'] })
    } catch (error) {
      console.error('Performance tracking failed:', error)
    }
  }
  
  // Track page visibility changes
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      trackEngagement('page_visible', {
        path: window.location.pathname,
      })
    }
  })
  
  // Track time on page (after 30 seconds)
  setTimeout(() => {
    trackEngagement('time_on_page_30s', {
      path: window.location.pathname,
      duration: 30,
    })
  }, 30000)
}

