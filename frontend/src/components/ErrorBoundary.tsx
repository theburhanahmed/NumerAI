'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { SpaceCard } from './space/space-card'
import { SpaceButton } from './space/space-button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * Enhanced Error Boundary with cosmic-themed error page
 * Catches React errors and displays user-friendly message
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
    // Log to error tracking service (e.g., Sentry)
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      // @ts-ignore - Sentry may not be available
      if (window.Sentry) {
        // window.Sentry.captureException(error, { extra: errorInfo })
      }
    }
  }

  private resetError = () => {
    this.setState({
      hasError: false,
      error: null,
    })
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
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
                We encountered an unexpected error. Please try refreshing the page.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <SpaceButton
                variant="primary"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.reload()
                  }
                }}
              >
                Refresh Page
              </SpaceButton>
              <SpaceButton variant="secondary" onClick={this.resetError}>
                Try Again
              </SpaceButton>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-6 p-4 bg-[#0a1628]/60 rounded-xl text-left overflow-auto max-h-48 border border-cyan-500/20">
                <p className="text-red-400 font-mono text-xs mb-2">Error Details:</p>
                <pre className="text-white/60 font-mono text-xs whitespace-pre-wrap break-words">
                  {this.state.error.toString()}
                </pre>
              </div>
            )}
          </SpaceCard>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
