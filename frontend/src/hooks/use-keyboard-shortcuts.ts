/**
 * useKeyboardShortcuts Hook
 * 
 * Hook for managing keyboard shortcuts throughout the application.
 */

import { useEffect, useCallback } from 'react'

export interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  meta?: boolean
  shift?: boolean
  alt?: boolean
  handler: (e: KeyboardEvent) => void
  description?: string
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? e.ctrlKey : !e.ctrlKey
        const metaMatch = shortcut.meta ? e.metaKey : !e.metaKey
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey
        const altMatch = shortcut.alt ? e.altKey : !e.altKey
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase()

        if (ctrlMatch && metaMatch && shiftMatch && altMatch && keyMatch) {
          e.preventDefault()
          shortcut.handler(e)
          break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}

/**
 * Common keyboard shortcuts
 */
export const commonShortcuts: Record<string, KeyboardShortcut> = {
  search: {
    key: 'k',
    ctrl: true,
    handler: () => {
      // Trigger global search
      const event = new CustomEvent('open-search')
      window.dispatchEvent(event)
    },
    description: 'Open search',
  },
  newChat: {
    key: 'n',
    ctrl: true,
    handler: () => {
      window.location.href = '/ai-chat'
    },
    description: 'New AI chat',
  },
  dashboard: {
    key: 'd',
    ctrl: true,
    handler: () => {
      window.location.href = '/dashboard'
    },
    description: 'Go to dashboard',
  },
  dailyReading: {
    key: 'r',
    ctrl: true,
    handler: () => {
      window.location.href = '/daily-reading'
    },
    description: 'Daily reading',
  },
  help: {
    key: '?',
    handler: () => {
      // Show help modal
      const event = new CustomEvent('open-help')
      window.dispatchEvent(event)
    },
    description: 'Show help',
  },
}

/**
 * Hook to get keyboard shortcuts help
 */
export function useKeyboardShortcutsHelp() {
  return Object.values(commonShortcuts).map((shortcut) => ({
    keys: [
      shortcut.ctrl && 'Ctrl',
      shortcut.meta && 'Cmd',
      shortcut.shift && 'Shift',
      shortcut.alt && 'Alt',
      shortcut.key.toUpperCase(),
    ]
      .filter(Boolean)
      .join(' + '),
    description: shortcut.description || '',
  }))
}

