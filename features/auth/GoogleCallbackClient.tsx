'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, XCircle } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { setRefreshTokenCookie } from '@/lib/auth-cookie'
import type { User, Tenant } from '@/types/auth'

export default function GoogleCallbackClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      const messages: Record<string, string> = {
        invalid_state: 'La sesión expiró. Intenta de nuevo.',
        token_exchange_failed: 'No se pudo conectar con Google. Intenta de nuevo.',
        userinfo_failed: 'No se pudo obtener información de tu cuenta Google.',
        email_not_verified: 'Tu cuenta de Google no tiene el email verificado.',
        missing_email: 'Google no proporcionó un email. Intenta con otra cuenta.',
        user_creation_failed: 'No se pudo crear tu cuenta. Intenta de nuevo.',
        account_suspended: 'Tu cuenta está suspendida. Contacta al soporte.',
        access_denied: 'Cancelaste el inicio de sesión con Google.',
      }
      setError(messages[errorParam] ?? 'Error al iniciar sesión con Google.')
      return
    }

    // Backend already exchanged the code and sends tokens in query params
    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')
    const userB64 = searchParams.get('user')
    const tenantB64 = searchParams.get('tenant')

    if (!accessToken || !refreshToken || !userB64 || !tenantB64) {
      setError('No se recibieron los datos de sesión. Intenta de nuevo.')
      return
    }

    try {
      const user = JSON.parse(atob(userB64)) as User
      const tenant = JSON.parse(atob(tenantB64)) as Tenant

      useAuthStore.getState().setUser(user)
      useAuthStore.getState().setTenant(tenant)
      useAuthStore.getState().setAccessToken(accessToken)
      localStorage.setItem('hub-refreshToken', refreshToken)
      localStorage.setItem('hub-authUser', JSON.stringify(user))
      localStorage.setItem('hub-authTenant', JSON.stringify(tenant))
      setRefreshTokenCookie(refreshToken)

      router.push('/dashboard')
    } catch {
      setError('Error al procesar los datos de sesión. Intenta de nuevo.')
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 w-full max-w-md text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
            <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Error al iniciar sesión
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{error}</p>
          <Link
            href="/login"
            className="inline-block bg-primary-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-primary-700 transition-colors text-sm"
          >
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-10 w-10 text-primary-600 mx-auto animate-spin" />
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Completando inicio de sesión con Google...
        </p>
      </div>
    </div>
  )
}
