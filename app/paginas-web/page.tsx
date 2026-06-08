import PaginasWebPage from '@/features/paginas-web/PaginasWebPage'
import { createPageMetadata } from '@/lib/metadata'

export const metadata = createPageMetadata(
  'Desarrollo Web — Portales, Tiendas, Landing Pages | Hub de Servicios',
  'Creamos tu página web profesional: portales, tiendas virtuales, landing pages, blogs y portafolios. Diseño responsive, SEO y panel de administración incluido.',
  '/paginas-web',
  {
    ogTitle: 'Desarrollo Web Profesional | Hub de Servicios',
    ogDescription: 'Portales, tiendas virtuales, landing pages y más. Diseño responsive + SEO incluido.',
  },
)

export default function PaginasWebRoute() {
  return <PaginasWebPage />
}
