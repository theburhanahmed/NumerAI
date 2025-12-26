/**
 * useAccessibility Hook
 * 
 * Hook for managing accessibility features and ARIA attributes.
 */

import { useEffect, useState } from 'react'

export interface AccessibilityOptions {
  announcePageChanges?: boolean
  skipToContentId?: string
}

/**
 * Hook for managing page announcements
 */
export function usePageAnnouncement(message: string, priority: 'polite' | 'assertive' = 'polite') {
  useEffect(() => {
    const announcement = document.createElement('div')
    announcement.setAttribute('role', 'status')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message

    document.body.appendChild(announcement)

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)

    return () => {
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement)
      }
    }
  }, [message, priority])
}

/**
 * Hook for focus management
 */
export function useFocusManagement() {
  const [focusStack, setFocusStack] = useState<HTMLElement[]>([])

  const trapFocus = (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    container.addEventListener('keydown', handleTab)
    firstElement?.focus()

    return () => {
      container.removeEventListener('keydown', handleTab)
    }
  }

  const returnFocus = (element: HTMLElement | null) => {
    if (element) {
      element.focus()
    }
  }

  return {
    trapFocus,
    returnFocus,
  }
}

/**
 * Hook for reduced motion preference
 */
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersReducedMotion
}

/**
 * Hook for screen reader announcements
 */
export function useScreenReaderAnnouncement() {
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div')
    announcement.setAttribute('role', 'status')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message

    document.body.appendChild(announcement)

    setTimeout(() => {
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement)
      }
    }, 1000)
  }

  return { announce }
}

