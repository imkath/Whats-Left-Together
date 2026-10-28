const withNextIntl = require('next-intl/plugin')('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Security headers live in src/middleware.ts (pages) and public/_headers (static
  // files): Cloudflare Pages does not apply a headers() block from this file.
};

module.exports = withNextIntl(nextConfig);
