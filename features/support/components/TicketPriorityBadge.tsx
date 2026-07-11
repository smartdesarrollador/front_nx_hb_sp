'use client'

import { useTranslation } from 'react-i18next'
import type { TicketPriority } from '../types'

export const PRIORITY_CONFIG: Record<TicketPriority, { label: string; className: string }> = {
  urgente: { label: 'priorityUrgente', className: 'bg-red-100 text-red-700' },
  alta:    { label: 'priorityAlta',    className: 'bg-orange-100 text-orange-700' },
  media:   { label: 'priorityMedia',   className: 'bg-yellow-100 text-yellow-700' },
  baja:    { label: 'priorityBaja',    className: 'bg-gray-100 text-gray-600' },
}

interface Props { priority: TicketPriority }

export default function TicketPriorityBadge({ priority }: Props) {
  const { t } = useTranslation('support')
  const config = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG.baja
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {t(config.label)}
    </span>
  )
}
