import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://digisider.com'
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard',
        '/services',
        '/subscription',
        '/billing',
        '/team',
        '/support',
        '/notifications',
        '/profile',
        '/desktop',
        '/referrals',
      ],
    },
    sitemap: `${base}/sitemap.xml`,
  }
}
