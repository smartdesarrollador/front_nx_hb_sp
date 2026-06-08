import type { Metadata } from 'next'
import SupportPageClient from '@/features/support/SupportPageClient'

export const metadata: Metadata = {
  title: 'Soporte | Hub de Servicios',
  description: 'Gestiona tus tickets de soporte y contacta con el equipo.',
}

export default function SupportPage() {
  return <SupportPageClient />
}
