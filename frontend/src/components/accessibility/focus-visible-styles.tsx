'use client'

import React, { useEffect } from 'react'

/**
 * Global focus-visible styles for accessibility
 * Ensures keyboard navigation is always visible
 */
export function FocusVisibleStyles() {
  useEffect(() => {
    // Add focus-visible polyfill behavior
    const style = document.createElement('style')
    style.textContent = `
      /* Remove default focus outline */
      *:focus {
        outline: none;
      }

      /* Add visible focus ring for keyboard navigation */
      *:focus-visible {
        outline: 2px solid #00d4ff;
        outline-offset: 4px;
        border-radius: 8px;
      }

      /* Enhanced focus for interactive elements */
      button:focus-visible,
      a:focus-visible,
      input:focus-visible,
      textarea:focus-visible,
      select:focus-visible {
        outline: 3px solid #00d4ff;
        outline-offset: 2px;
        box-shadow: 0 0 0 4px rgba(0, 212, 255, 0.2);
      }

      /* Focus for cards and interactive containers */
      [role="button"]:focus-visible,
      [role="link"]:focus-visible {
        outline: 2px solid #00d4ff;
        outline-offset: 4px;
        box-shadow: 0 0 0 6px rgba(0, 212, 255, 0.15);
      }
    `
    document.head.appendChild(style)
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style)
      }
    }
  }, [])

  return null
}

