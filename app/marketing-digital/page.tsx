import MarketingDigitalPage from '@/features/marketing-digital/MarketingDigitalPage'
import { createPageMetadata } from '@/lib/metadata'

export const metadata = createPageMetadata(
  'Marketing Digital — SEO, Publicidad y Redes Sociales | Hub de Servicios',
  'SEO, publicidad digital, gestión de redes sociales, marketing de contenidos y email marketing. Estrategias personalizadas con resultados medibles.',
  '/marketing-digital',
  {
    ogTitle: 'Marketing Digital Profesional | Hub de Servicios',
    ogDescription: 'SEO, publicidad, redes sociales y email marketing. Certificaciones Google y Meta.',
  },
)

export default function MarketingDigitalRoute() {
  return <MarketingDigitalPage />
}
