"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white p-4">
                    <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl text-center">
                        <div className="mb-6 flex justify-center">
                            <div className="h-16 w-16 bg-red-500/10 rounded-full flex items-center justify-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-8 h-8 text-red-500"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                </svg>
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
                            Something went wrong
                        </h2>

                        <p className="text-neutral-400 mb-8">
                            We encountered an unexpected error. Please try refreshing the page.
                        </p>

                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-2.5 bg-white text-black rounded-full font-medium hover:bg-neutral-200 transition-colors"
                            >
                                Refresh Page
                            </button>
                            <button
                                onClick={() => this.setState({ hasError: false })}
                                className="px-6 py-2.5 bg-neutral-800 text-white rounded-full font-medium hover:bg-neutral-700 transition-colors border border-neutral-700"
                            >
                                Try Again
                            </button>
                        </div>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="mt-8 p-4 bg-black/50 rounded-lg text-left overflow-auto max-h-48 border border-neutral-800">
                                <p className="text-red-400 font-mono text-xs mb-2">Error Details:</p>
                                <pre className="text-neutral-500 font-mono text-xs whitespace-pre-wrap break-words">
                                    {this.state.error.toString()}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
