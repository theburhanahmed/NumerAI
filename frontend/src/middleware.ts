import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';
import { NextRequest, NextResponse } from 'next/server';

// #region agent log
const logDebug = (message: string, data: any) => {
  fetch('http://127.0.0.1:7242/ingest/bd39975f-6fe4-411e-a1e1-89be47e83836', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location: 'middleware.ts',
      message,
      data,
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'run1',
      hypothesisId: 'A'
    })
  }).catch(() => {});
};
// #endregion agent log

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always', // Always show locale prefix for consistency
});

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // #region agent log
  logDebug('Middleware called', {
    pathname,
    url: request.url,
    defaultLocale,
    locales: locales.join(',')
  });
  // #endregion agent log

  // Check if this is a locale-prefixed route
  const isLocaleRoute = locales.some(locale => 
    pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );
  
  // For root path or locale-prefixed routes, apply i18n middleware
  if (pathname === '/' || isLocaleRoute) {
    const response = intlMiddleware(request);
    
    // #region agent log
    logDebug('Middleware response (i18n)', {
      status: response?.status,
      redirected: response?.headers.get('location'),
      originalPathname: pathname,
      responseType: response.type
    });
    // #endregion agent log
    
    return response;
  }
  
  // For all other routes, just pass through
  // #region agent log
  logDebug('Middleware passthrough (non-i18n)', {
    pathname
  });
  // #endregion agent log
  
  return NextResponse.next();
}

export const config = {
  // Match all pathnames except:
  // - API routes
  // - Static files (_next/static)
  // - Image optimization files (_next/image)
  // - Favicon and other static assets
  matcher: [
    // Match all pathnames except static files and API routes
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)',
  ]
};

