import type { Metadata } from 'next'
import NotificationsPageClient from '@/features/notifications/NotificationsPageClient'

export const metadata: Metadata = {
  title: 'Notificaciones | Hub de Servicios',
  description: 'Revisa tus notificaciones de seguridad, facturación y servicios.',
}

export default function NotificationsPage() {
  return <NotificationsPageClient />
}
