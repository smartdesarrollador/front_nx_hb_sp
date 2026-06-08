import { Suspense } from 'react'
import type { Metadata } from 'next'
import ResetPasswordPageClient from '@/features/auth/ResetPasswordPageClient'

export const metadata: Metadata = {
  title: 'Nueva contraseña | Hub de Servicios',
  description: 'Establece una nueva contraseña para tu cuenta.',
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <ResetPasswordPageClient />
    </Suspense>
  )
}
