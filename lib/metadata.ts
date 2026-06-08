import type { Metadata } from 'next'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://digisider.com'

export function createPageMetadata(
  title: string,
  description: string,
  path: string,
  options?: { ogTitle?: string; ogDescription?: string },
): Metadata {
  const ogTitle = options?.ogTitle ?? title
  const ogDesc = options?.ogDescription ?? description
  return {
    title,
    description,
    alternates: { canonical: `${BASE}${path}` },
    openGraph: { title: ogTitle, description: ogDesc, url: `${BASE}${path}`, type: 'website' },
    twitter: { card: 'summary_large_image', title: ogTitle, description: ogDesc },
  }
}
