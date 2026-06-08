'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, XCircle } from 'lucide-react'
import { publicClient } from '@/lib/axios'
import { useAuthStore } from '@/store/authStore'
import { setRefreshTokenCookie } from '@/lib/auth-cookie'
import type { User, Tenant } from '@/types/auth'

export default function GoogleCallbackClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (!code) {
      setError('No se recibió el código de autorización de Google.')
      return
    }

    publicClient
      .post<{
        access_token: string
        refresh_token: string
        user: User
        tenant: Tenant
      }>('/auth/google/callback/', { code, state })
      .then(({ data }) => {
        useAuthStore.getState().setUser(data.user)
        useAuthStore.getState().setTenant(data.tenant)
        useAuthStore.getState().setAccessToken(data.access_token)
        localStorage.setItem('hub-refreshToken', data.refresh_token)
        localStorage.setItem('hub-authUser', JSON.stringify(data.user))
        localStorage.setItem('hub-authTenant', JSON.stringify(data.tenant))
        setRefreshTokenCookie(data.refresh_token)
        router.push('/dashboard')
      })
      .catch(() => {
        setError('No se pudo completar el inicio de sesión con Google. Intenta de nuevo.')
      })
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
