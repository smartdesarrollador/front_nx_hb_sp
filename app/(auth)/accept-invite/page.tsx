import { Suspense } from 'react'
import type { Metadata } from 'next'
import AcceptInvitePageClient from '@/features/auth/AcceptInvitePageClient'

export const metadata: Metadata = {
  title: 'Aceptar invitación | Hub de Servicios',
  description: 'Activa tu cuenta y configura tu contraseña.',
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <AcceptInvitePageClient />
    </Suspense>
  )
}
