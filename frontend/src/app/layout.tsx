import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { Navigation } from "@/components/navigation";
import { MobileBottomNav } from "@/components/navigation/mobile-bottom-nav";
import { ThemeProvider } from "@/contexts/theme-context";
import { AIChatProvider } from "@/contexts/ai-chat-context";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { FloatingChatWidget } from "@/components/ai-chat/floating-chat-widget";
import { FloatingChatButton } from "@/components/ai-chat/floating-chat-button";
import { AIChatModal } from "@/components/ai-chat/ai-chat-modal";
import ErrorBoundary from "@/components/ErrorBoundary";
import { SkipToContent } from "@/components/accessibility/skip-to-content";
import { FocusVisibleStyles } from "@/components/accessibility/focus-visible-styles";
import { BackToTop } from "@/components/accessibility/back-to-top";
import { ContextualHelp } from "@/components/help/contextual-help";
import { OnboardingModal } from "@/components/OnboardingModal";
import { AnalyticsInitializer } from "@/components/analytics-initializer";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { registerServiceWorker } from "@/lib/service-worker";

const inter = Inter({ subsets: ["latin"] });

// Register service worker on client side
if (typeof window !== 'undefined') {
  registerServiceWorker();
}

export const metadata: Metadata = {
  title: "NumerAI - Your Personal Numerology Guide",
  description: "Discover your life path through the ancient wisdom of numerology",
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16', type: 'image/x-icon' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'NumerAI',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#7c3aed',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Root layout - Next.js requires html and body tags
  // Wrap with all providers so they're available to all routes
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>
            <OnboardingProvider>
              <SubscriptionProvider>
                <AIChatProvider>
                  <ErrorBoundary>
                    {/* Global Accessibility Features */}
                    <SkipToContent />
                    <FocusVisibleStyles />

                    {children}

                    {/* Global UI Elements */}
                    <FloatingChatWidget />
                    <FloatingChatButton />
                    <AIChatModal />
                    <BackToTop />
                    <ContextualHelp />
                    <OnboardingModal />
                    <InstallPrompt />
                    <MobileBottomNav />

                    {/* Toast Notifications */}
                    <Toaster />
                    <SonnerToaster
                      position="top-right"
                      toastOptions={{
                        style: {
                          background: 'rgba(26, 41, 66, 0.95)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(0, 212, 255, 0.3)',
                          color: 'white',
                        },
                      }}
                      richColors
                    />
                  </ErrorBoundary>
                </AIChatProvider>
              </SubscriptionProvider>
            </OnboardingProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}