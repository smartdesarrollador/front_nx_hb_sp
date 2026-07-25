'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useCurrentSubscription } from '@/features/subscription/hooks/useCurrentSubscription'
import type { RenewalState } from '@/features/subscription/types'

const STORAGE_KEY = 'hub-renewal-banner-dismissed'

// Orden de gravedad: descartar un aviso NO silencia el siguiente. Quien oculta
// "vence en 7 días" vuelve a ver la franja cuando el plan entra en gracia y luego
// cuando expira — cada escalón es una noticia distinta. Mismo criterio que
// StorageLimitBanner (warning → full).
const RANK: Record<string, number> = { expiring_soon: 1, grace: 2, expired: 3 }
type Level = keyof typeof RANK

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Franja global de aviso de vencimiento del plan en el Hub.
 *
 * El detalle completo vive en la página Suscripción, pero un cliente que no entra ahí
 * no se entera de que su plan está por vencer hasta que pierde acceso. Esta franja lo
 * pone delante en cualquier pantalla, igual que la de almacenamiento.
 *
 * `renewal_state` lo deriva el backend (services.py::get_renewal_state): la UI no
 * recalcula fechas, así que no puede discrepar del criterio que aplica el endpoint de
 * pago. No añade requests — comparte la query `['hub-subscription']`.
 */
export function RenewalReminderBanner() {
  const { t } = useTranslation('common')
  const { subscription } = useCurrentSubscription()
  const [dismissed, setDismissed] = useState<Level | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (stored && stored in RANK) setDismissed(stored as Level)
  }, [])

  const state: RenewalState | undefined = subscription?.renewal_state
  if (!state || !(state in RANK)) return null // 'active' o sin datos → sin franja

  // Ya envió comprobante: la pelota está en nuestro tejado, no en el suyo. Insistir en
  // que renueve sería incorrecto (y el pago volvería a fallar con 409).
  if (subscription?.has_pending_proof) return null

  const level = state as Level
  if (dismissed && RANK[level] <= RANK[dismissed]) return null

  const plan = subscription?.plan_display ?? ''
  const days = subscription?.days_until_expiry ?? 0

  const message =
    level === 'expired'
      // Sin nombre de plan: tras degradar, `plan_display` ya es "Free", así que
      // interpolarlo daría el absurdo "Tu plan Free venció".
      ? t('planExpired')
      : level === 'grace'
        ? t('planInGrace', { date: formatDate(subscription?.grace_until ?? null) })
        : t('planExpiringSoon', { plan, count: Math.max(days, 0) })

  const styles =
    level === 'expiring_soon'
      ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
      : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'

  const dismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, level)
    setDismissed(level)
  }

  return (
    <div
      role="status"
      className={`flex items-center gap-3 border-b px-6 py-2 text-xs sm:text-sm ${styles}`}
    >
      <AlertTriangle size={16} className="flex-shrink-0" />
      <span className="flex-1">{message}</span>
      <Link
        href="/subscription"
        className="font-semibold underline hover:no-underline flex-shrink-0"
      >
        {level === 'expired' ? t('planReactivateCta') : t('planRenewCta')}
      </Link>
      <button
        type="button"
        onClick={dismiss}
        aria-label={t('close')}
        className="flex-shrink-0 opacity-70 hover:opacity-100"
      >
        <X size={16} />
      </button>
    </div>
  )
}
