'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useCurrentSubscription } from '@/features/subscription/hooks/useCurrentSubscription'
import { formatStorage } from '@/features/subscription/formatStorage'

const WARN_RATIO = 0.8
const STORAGE_KEY = 'hub-storage-banner-dismissed'
const RANK = { warning: 1, full: 2 } as const
type Level = keyof typeof RANK

/**
 * Franja global de aviso de almacenamiento en el Hub: advierte al ≥80% y marca "lleno" al 100%,
 * con CTA a Suscripción. Descartable por sesión; reaparece si el nivel escala (warning → full).
 */
export function StorageLimitBanner() {
  const { t } = useTranslation('common')
  const { subscription } = useCurrentSubscription()
  const [dismissed, setDismissed] = useState<Level | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (stored === 'warning' || stored === 'full') setDismissed(stored)
  }, [])

  const storage = subscription?.usage?.storage
  const current = storage?.current_gb ?? 0
  const limit = storage?.limit_gb ?? null

  if (limit === null || limit <= 0) return null // ilimitado o sin dato → sin franja
  const ratio = current / limit
  if (ratio < WARN_RATIO) return null

  const level: Level = ratio >= 1 ? 'full' : 'warning'
  if (dismissed && RANK[level] <= RANK[dismissed]) return null

  const used = formatStorage(current)
  const limitLabel = formatStorage(limit)
  const message =
    level === 'full'
      ? t('storageAtLimit', { used, limit: limitLabel })
      : t('storageNearLimit', { used, limit: limitLabel })

  const styles =
    level === 'full'
      ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
      : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'

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
      <Link href="/subscription" className="font-semibold underline hover:no-underline flex-shrink-0">
        {t('storageUpgradeCta')}
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
