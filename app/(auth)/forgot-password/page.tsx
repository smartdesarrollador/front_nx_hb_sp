import type { Metadata } from 'next'
import ForgotPasswordPageClient from '@/features/auth/ForgotPasswordPageClient'

export const metadata: Metadata = {
  title: 'Recuperar contraseña | Hub de Servicios',
  description: 'Restablece tu contraseña del Hub de Servicios.',
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordPageClient />
}
