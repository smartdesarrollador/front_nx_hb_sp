import DigitalDesignPage from '@/features/digital-design/DigitalDesignPage'
import { createPageMetadata } from '@/lib/metadata'

export const metadata = createPageMetadata(
  'Diseño Gráfico Digital — Branding, RRSS y UI | Hub de Servicios',
  'Identidad de marca, diseño para redes sociales, UI/UX, impresión y más. Diseño gráfico profesional con entrega rápida.',
  '/digital-design',
  {
    ogTitle: 'Diseño Gráfico Digital | Hub de Servicios',
    ogDescription:
      'Branding, redes sociales, diseño web, packaging y más. Diseño gráfico profesional.',
  },
)

export default function DigitalDesignRoute() {
  return <DigitalDesignPage />
}
