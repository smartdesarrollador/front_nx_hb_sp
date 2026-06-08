import { Suspense } from 'react'
import type { Metadata } from 'next'
import LoginPageClient from '@/features/auth/LoginPageClient'

export const metadata: Metadata = {
  title: 'Iniciar sesión | Hub de Servicios',
  description: 'Accede a tu cuenta del Hub de Servicios.',
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <LoginPageClient />
    </Suspense>
  )
}
