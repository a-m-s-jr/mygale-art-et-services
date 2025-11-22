/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    unoptimized: false,
    remotePatterns: [],
  },

  compress: true,
  poweredByHeader: false,

  webpack(config) {
    return config
  },
}

module.exports = nextConfig
