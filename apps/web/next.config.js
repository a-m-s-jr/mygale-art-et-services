/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: false,
    remotePatterns: [],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['*'],
    },
  },
  compress: true,
  poweredByHeader: false,
  outputFileTracingRoot: __dirname,
}

module.exports = nextConfig
