import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';

const handleI18n = createMiddleware({
  locales: ['es', 'en'],
  defaultLocale: 'es',
  localeDetection: true,
});

// Security headers for every page are set here. Static files are served by the
// Worker's asset binding and get theirs from public/_headers.
const CSP = [
  "default-src 'self'",
  // Next.js and next-themes inject small inline scripts; nothing loads from elsewhere.
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ');

const SECURITY_HEADERS: Record<string, string> = {
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
};

export default function middleware(request: NextRequest) {
  const response = handleI18n(request);
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  // The dev server needs eval and websockets for hot reload.
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Content-Security-Policy', CSP);
  }
  return response;
}

export const config = {
  // Every route except the API, Next internals and files with an extension.
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
