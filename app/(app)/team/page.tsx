import type { Metadata } from 'next'
import TeamPageClient from '@/features/team/TeamPageClient'

export const metadata: Metadata = {
  title: 'Equipo | Hub de Servicios',
  description: 'Gestiona los miembros e invitaciones de tu equipo.',
}

export default function TeamPage() {
  return <TeamPageClient />
}
