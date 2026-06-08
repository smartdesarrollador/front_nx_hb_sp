'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react'

const REASON_MESSAGES: Record<string, string> = {
  token_expired: 'El enlace de acceso expiró (válido por 60 segundos). Por favor intenta de nuevo.',
  already_used: 'El enlace de acceso ya fue utilizado. Cada enlace es de un solo uso.',
  tenant_inactive: 'Tu suscripción no está activa. Verifica el estado de tu cuenta.',
  service_unavailable: 'El servicio no está disponible en este momento.',
}

const SERVICE_NAMES: Record<string, string> = {
  workspace: 'Workspace',
  vista: 'Vista Digital',
  digital_services: 'Servicios Digitales',
}

export default function SSOErrorPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const reason = searchParams.get('reason') ?? ''
  const service = searchParams.get('service') ?? ''

  const message = REASON_MESSAGES[reason] ?? 'No se pudo conectar al servicio. Inténtalo de nuevo.'
  const serviceName = SERVICE_NAMES[service] ?? 'el servicio'

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 w-full max-w-md text-center space-y-5">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
          <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Error al acceder a {serviceName}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <button
            onClick={() => router.push('/services')}
            className="inline-flex items-center justify-center gap-2 bg-primary-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-primary-700 transition-colors text-sm"
          >
            <RefreshCw className="h-4 w-4" />
            Reintentar acceso
          </button>

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
