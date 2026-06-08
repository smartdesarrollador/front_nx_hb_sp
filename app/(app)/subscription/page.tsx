import type { Metadata } from 'next'
import SubscriptionPageClient from '@/features/subscription/SubscriptionPageClient'

export const metadata: Metadata = {
  title: 'Suscripción | Hub de Servicios',
  description: 'Gestiona tu plan y uso de la plataforma.',
}

export default function SubscriptionPage() {
  return <SubscriptionPageClient />
}
