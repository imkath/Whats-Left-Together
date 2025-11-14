const withNextIntl = require('next-intl/plugin')('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Optimize for static export if needed
  output: 'standalone',
};

module.exports = withNextIntl(nextConfig);
