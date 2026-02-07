/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('path')

module.exports = {
  allowedDevOrigins: ['192.168.85.1', 'mygale-art-et-services.vercel.app/'],

  reactStrictMode: true,

  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.mygaleartetservices.org',
      },
      {
        protocol: 'https',
        hostname: 'www.media.mygaleartetservices.org',
      },
    ],
  },

  compress: true,
  poweredByHeader: false,

  // REMOVE distDir completely — Vercel & next-sitemap depend on .next being inside the app
  // distDir: path.join(MONOREPO_ROOT, '.next'),

  // Keep tracing root for monorepo (harmless)
  outputFileTracingRoot: path.resolve(__dirname, '..', '..'),

  turbopack: {},

  experimental: {
    // Remove framer-motion optimization that was causing issues
  },

  // Moved from experimental in Next.js 16
  serverExternalPackages: [],

  webpack(config) {
    // Fix case sensitivity issues on Windows
    config.resolve.symlinks = false
    config.resolve.cacheWithContext = false

    // Ensure consistent module resolution
    config.optimization = {
      ...config.optimization,
      moduleIds: 'deterministic',
    }

    return config
  },
}
