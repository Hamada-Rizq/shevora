const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fix: set project root explicitly so Vercel doesn't get confused by parent lockfiles
  outputFileTracingRoot: path.join(__dirname),
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'shevora-app.vercel.app'],
    },
  },
}

module.exports = nextConfig
