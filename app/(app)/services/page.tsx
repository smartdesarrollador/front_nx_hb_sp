import type { Metadata } from 'next'
import ServicesPageClient from '@/features/services/ServicesPageClient'

export const metadata: Metadata = {
  title: 'Mis servicios | Hub de Servicios',
  description: 'Accede y gestiona tus servicios contratados.',
}

export default function ServicesPage() {
  return <ServicesPageClient />
}
