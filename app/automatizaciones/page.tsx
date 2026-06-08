import AutomatizacionesPage from '@/features/automatizaciones/AutomatizacionesPage'
import { createPageMetadata } from '@/lib/metadata'

export const metadata = createPageMetadata(
  'Automatizaciones con n8n — Workflows y Chatbots IA | Hub de Servicios',
  'Automatiza ventas, CRM, WhatsApp y email marketing con n8n e inteligencia artificial. +400 integraciones, datos en tu infraestructura.',
  '/automatizaciones',
  {
    ogTitle: 'Automatizaciones con n8n e IA | Hub de Servicios',
    ogDescription: 'Workflows, chatbots de WhatsApp, CRM automation y más con n8n self-hosted.',
  },
)

export default function AutomatizacionesRoute() {
  return <AutomatizacionesPage />
}
