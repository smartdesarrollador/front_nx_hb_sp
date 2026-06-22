import AprendeIAPage from '@/features/aprende-inteligencia-artificial/AprendeIAPage'
import { createPageMetadata } from '@/lib/metadata'

export const metadata = createPageMetadata(
  'Aprende IA — Asesoría y Capacitación en Inteligencia Artificial | Hub de Servicios',
  'Clases, talleres y asesoría en IA para personas, equipos y empresas. ChatGPT, Copilot, APIs de IA y más. Online y presencial.',
  '/aprende-inteligencia-artificial',
  {
    ogTitle: 'Capacitación en Inteligencia Artificial | Hub de Servicios',
    ogDescription:
      'Aprende a usar ChatGPT, Copilot, GitHub Copilot y APIs de IA. Formación práctica para todos los niveles.',
  },
)

export default function AprendeIARoute() {
  return <AprendeIAPage />
}
