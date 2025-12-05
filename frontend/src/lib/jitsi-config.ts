/**
 * Jitsi configuration.
 */
export const JITSI_CONFIG = {
  domain: process.env.NEXT_PUBLIC_JITSI_DOMAIN || 'meet.jit.si',
  useJWT: process.env.NEXT_PUBLIC_JITSI_USE_JWT === 'true',
  appId: process.env.NEXT_PUBLIC_JITSI_APP_ID,
  secret: process.env.NEXT_PUBLIC_JITSI_SECRET,
};

