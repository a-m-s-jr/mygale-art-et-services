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
}

module.exports = nextConfig
