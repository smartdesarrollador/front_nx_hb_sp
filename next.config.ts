import type { NextConfig } from 'next'

const API_TARGET = process.env.API_TARGET ?? 'http://localhost:8000'

const config: NextConfig = {
  output: 'standalone',
  skipTrailingSlashRedirect: true,
  async rewrites() {
    // NPM strips trailing slashes before requests reach Next.js.
    // Django auth URLs have no trailing slash (login, register, etc.) BUT
    // sso/ and google/ sub-paths DO have trailing slashes. Order matters:
    // more-specific rules first.
    return [
      {
        source: '/api/v1/auth/sso/:path*',
        destination: `${API_TARGET}/api/v1/auth/sso/:path*/`,
      },
      {
        source: '/api/v1/auth/google/:path*',
        destination: `${API_TARGET}/api/v1/auth/google/:path*/`,
      },
      {
        source: '/api/v1/auth/:path*',
        destination: `${API_TARGET}/api/v1/auth/:path*`,
      },
      {
        source: '/api/:path*',
        destination: `${API_TARGET}/api/:path*/`,
      },
    ]
  },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**.s3.amazonaws.com' }],
  },
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/_next/image(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=3600' },
        ],
      },
    ]
  },
}

export default config
