import { Suspense } from 'react'
import type { Metadata } from 'next'
import VerifyEmailPageClient from '@/features/auth/VerifyEmailPageClient'

export const metadata: Metadata = {
  title: 'Verificar email | Hub de Servicios',
  description: 'Verifica tu dirección de email para activar tu cuenta.',
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <VerifyEmailPageClient />
    </Suspense>
  )
}
