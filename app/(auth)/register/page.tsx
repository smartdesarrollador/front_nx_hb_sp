import { Suspense } from 'react'
import type { Metadata } from 'next'
import RegisterPageClient from '@/features/auth/RegisterPageClient'

export const metadata: Metadata = {
  title: 'Crear cuenta | Hub de Servicios',
  description: 'Crea tu cuenta y comienza a usar el Hub de Servicios.',
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <RegisterPageClient />
    </Suspense>
  )
}
