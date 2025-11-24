// apps/web/next.config.mjs
/** @type {import('next').NextConfig} */
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Set BOTH turbopack.root and outputFileTracingRoot to your monorepo root
const MONOREPO_ROOT = path.resolve(__dirname, '..', '..')

const nextConfig = {
  reactStrictMode: true,

  images: {
    unoptimized: false,
    remotePatterns: [],
  },

  experimental: {
    turbo: false, // 🚫 disable Turbopack
    webpackBuildWorker: false, // extra safety for Next 16
    serverActions: {
      allowedOrigins: ['*'],
    },
  },

  compress: true,
  poweredByHeader: false,

  turbopack: {
    root: MONOREPO_ROOT, // MUST match outputFileTracingRoot
  },

  outputFileTracingRoot: MONOREPO_ROOT,

  // Force classic Webpack builder
  distDir: '.next',
}

export default nextConfig
