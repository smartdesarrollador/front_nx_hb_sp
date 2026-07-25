'use client'

import { useTranslation } from 'react-i18next'
import type { NotificationFilter } from '../types'

// Claves dentro del namespace 'notifications' (ver i18n/config.ts), sin prefijo.
export const FILTER_LABELS: Record<NotificationFilter, string> = {
  all: 'all',
  billing: 'billing',
  security: 'security',
  services: 'services',
  system: 'system',
}

const FILTERS: NotificationFilter[] = ['all', 'billing', 'security', 'services', 'system']

interface Props {
  activeFilter: NotificationFilter
  onChange: (f: NotificationFilter) => void
  unreadCount: number
}

export default function NotificationFilters({ activeFilter, onChange, unreadCount: _unreadCount }: Props) {
  const { t } = useTranslation('notifications')
  return (
    <div role="tablist" className="flex items-center gap-2 flex-wrap">
      {FILTERS.map((filter) => (
        <button
          key={filter}
          role="tab"
          aria-selected={activeFilter === filter}
          onClick={() => onChange(filter)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            activeFilter === filter
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {t(FILTER_LABELS[filter])}
        </button>
      ))}
    </div>
  )
}
