import type { Metadata } from 'next'
import DesktopPageClient from '@/features/desktop/DesktopPageClient'

export const metadata: Metadata = {
  title: 'Descargar Desktop | Hub de Servicios',
  description: 'Descarga la aplicación de escritorio para Windows, macOS y Linux.',
}

export default function DesktopPage() {
  return <DesktopPageClient />
}
