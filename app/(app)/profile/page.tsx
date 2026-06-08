import type { Metadata } from 'next'
import ProfilePageClient from '@/features/profile/ProfilePageClient'

export const metadata: Metadata = {
  title: 'Mi perfil | Hub de Servicios',
  description: 'Gestiona tu información personal, seguridad y preferencias.',
}

export default function ProfilePage() {
  return <ProfilePageClient />
}
