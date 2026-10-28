import createNextIntlPlugin from 'next-intl/plugin';
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Security headers live in src/middleware.ts (pages) and public/_headers (static
  // files): the Worker does not apply a headers() block from this file.
};

export default withNextIntl(nextConfig);

// Gives `next dev` access to the Worker bindings and secrets from .dev.vars. Only in
// dev: it starts a local runtime that would keep lint, tests and builds from exiting.
if (process.env.NODE_ENV === 'development') initOpenNextCloudflareForDev();
