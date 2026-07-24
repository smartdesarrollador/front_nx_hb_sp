'use client'

import Link from 'next/link'
import { HardDrive } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useCurrentSubscription } from '@/features/subscription/hooks/useCurrentSubscription'
import { formatStorage } from '@/features/subscription/formatStorage'

export function StorageUsageBar() {
  const { t } = useTranslation('dashboard')
  const { subscription, isLoading } = useCurrentSubscription()

  const storage = subscription?.usage?.storage
  const current = storage?.current_gb ?? 0
  const limit = storage?.limit_gb ?? null

  const unlimited = limit === null
  const ratio = unlimited ? 0 : Math.min(current / limit, 1)
  const pct = ratio * 100

  const barColor = unlimited
    ? 'bg-blue-500'
    : pct >= 90
      ? 'bg-red-500'
      : pct >= 70
        ? 'bg-yellow-500'
        : 'bg-green-500'

  const limitReached = !unlimited && current >= limit
  const nearLimit = !unlimited && pct >= 90

  const usageLabel =
    limit === null
      ? t('storageUnlimited')
      : t('storageUsage', { current: formatStorage(current), limit: formatStorage(limit) })

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3" />
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full" />
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <HardDrive size={16} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {t('storageTitle')}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">{usageLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          {limitReached && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
              {t('storageLimitReached')}
            </span>
          )}
          {nearLimit && (
            <Link
              href="/subscription"
              className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
            >
              {t('storageUpgrade')}
            </Link>
          )}
        </div>
      </div>
      <div
        className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={unlimited ? 0 : Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: unlimited ? '100%' : `${pct}%` }}
        />
      </div>
    </div>
  )
}
