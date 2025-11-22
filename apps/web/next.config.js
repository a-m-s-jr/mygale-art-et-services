/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('path')

const MONOREPO_ROOT = path.resolve(__dirname, '..', '..')

module.exports = {
  reactStrictMode: true,

  images: {
    unoptimized: false,
    remotePatterns: [],
  },

  compress: true,
  poweredByHeader: false,

  // Make Next output its .next to the repo root so Vercel finds it at /vercel/path0/.next
  distDir: path.join(MONOREPO_ROOT, '.next'),

  // For trace collection in monorepo, ensure outputFileTracingRoot points to monorepo root
  outputFileTracingRoot: MONOREPO_ROOT,

  // Silence turbopack warning if you need to:
  turbopack: {},

  webpack(config) {
    return config
  },
}
