import LandingPageClient from '@/features/landing/LandingPageClient'
import { HomeAnnouncementModal } from '@/features/announcements/components/HomeAnnouncementModal'
import { createPageMetadata } from '@/lib/metadata'

export const metadata = createPageMetadata(
  'Hub de Servicios — Plataforma SaaS todo en uno',
  'Plataforma todo-en-uno para equipos modernos: workspace colaborativo, presencia digital y app nativa, integrados y seguros.',
  '/',
  { ogDescription: 'Workspace, Vista Digital y Desktop App en una sola suscripción.' },
)

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://digisider.com'

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      name: 'Hub de Servicios',
      url: BASE,
      description: 'Plataforma SaaS todo en uno: Workspace, Vista Digital y Desktop.',
    },
    {
      '@type': 'WebSite',
      name: 'Hub de Servicios',
      url: BASE,
    },
  ],
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingPageClient />
      <HomeAnnouncementModal />
    </>
  )
}
