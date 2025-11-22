/* eslint-disable @typescript-eslint/no-unused-vars */
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    unoptimized: false,
    remotePatterns: [],
  },

  experimental: {
    serverActions: false,
  },

  compress: true,
  poweredByHeader: false,

  // Force Webpack builder
  webpack(config, { isServer }) {
    return config // returning untouched config triggers Webpack mode
  },
}

module.exports = nextConfig
