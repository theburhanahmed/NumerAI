// Sentry is optional - only import if installed
// To enable Sentry: npm install @sentry/nextjs

if (process.env.SENTRY_DSN) {
  try {
    const Sentry = require('@sentry/nextjs');
    
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || "0.1"),
      debug: false,
    });
  } catch (e) {
    // Sentry not installed, skip initialization
    console.log('Sentry not installed - skipping edge initialization');
  }
}
