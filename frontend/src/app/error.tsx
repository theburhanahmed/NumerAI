'use client'

import React from 'react'
import { SpaceCard } from '@/components/space/space-card'
import { SpaceButton } from '@/components/space/space-button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0B0F19]">
      <SpaceCard variant="premium" className="p-8 max-w-md text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-500/30">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-10 h-10 text-red-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-['Playfair_Display'] font-bold text-white mb-2">
            Something went wrong
          </h2>
          <p className="text-white/70 mb-6">
            We encountered an unexpected error. Please try again.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <SpaceButton variant="primary" onClick={reset}>
            Try Again
          </SpaceButton>
          <SpaceButton
            variant="secondary"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.href = '/'
              }
            }}
          >
            Go Home
          </SpaceButton>
        </div>
      </SpaceCard>
    </div>
  )
}

