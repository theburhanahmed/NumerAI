import React from 'react';
import { AccessibleSpaceBackground } from '@/components/space/accessible-space-background';

/**
 * Layout for authentication pages (login, register, etc.)
 * Provides a clean layout without main navigation
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      <AccessibleSpaceBackground />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

