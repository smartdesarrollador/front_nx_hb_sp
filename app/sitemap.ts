import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://digisider.com'
  const now = new Date()
  return [
    { url: base,                          lastModified: now, changeFrequency: 'monthly', priority: 1   },
    { url: `${base}/paginas-web`,         lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/marketing-digital`,   lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/automatizaciones`,    lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/register`,            lastModified: now, changeFrequency: 'yearly',  priority: 0.6 },
    { url: `${base}/login`,               lastModified: now, changeFrequency: 'yearly',  priority: 0.4 },
  ]
}
