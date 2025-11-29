/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('path')

module.exports = {
  allowedDevOrigins: ['192.168.85.1', 'mygale-art-et-services.vercel.app/'],

  reactStrictMode: true,

  images: {
    unoptimized: false,
    remotePatterns: [],
  },

  compress: true,
  poweredByHeader: false,

  // REMOVE distDir completely — Vercel & next-sitemap depend on .next being inside the app
  // distDir: path.join(MONOREPO_ROOT, '.next'),

  // Keep tracing root for monorepo (harmless)
  outputFileTracingRoot: path.resolve(__dirname, '..', '..'),

  turbopack: {},

  webpack(config) {
    return config
  },
}
