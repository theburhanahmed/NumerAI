// Sentry is optional - only import if installed
// To enable Sentry: npm install @sentry/nextjs

if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
  try {
    const Sentry = require('@sentry/nextjs');
    
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: parseFloat(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE || "0.1"),
      debug: false,
      beforeSend(event: any, hint: any) {
        // Don't send events in development unless explicitly enabled
        if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_SENTRY_ENABLE_DEV) {
          return null;
        }
        return event;
      },
    });
  } catch (e) {
    // Sentry not installed, skip initialization
    console.log('Sentry not installed - skipping client initialization');
  }
}
