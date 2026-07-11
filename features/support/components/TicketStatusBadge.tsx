'use client'

import { useTranslation } from 'react-i18next'
import type { TicketStatus } from '../types'

export const STATUS_CONFIG: Record<TicketStatus, { label: string; className: string }> = {
  open:           { label: 'statusOpen',         className: 'bg-blue-100 text-blue-700' },
  in_progress:    { label: 'statusInProgress',   className: 'bg-yellow-100 text-yellow-700' },
  waiting_client: { label: 'statusWaitingClient', className: 'bg-orange-100 text-orange-700' },
  resolved:       { label: 'statusResolved',     className: 'bg-green-100 text-green-700' },
  closed:         { label: 'statusClosed',       className: 'bg-gray-100 text-gray-600' },
}

interface Props { status: TicketStatus }

export default function TicketStatusBadge({ status }: Props) {
  const { t } = useTranslation('support')
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.open
  const label = t(config.label)
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {label}
    </span>
  )
}
