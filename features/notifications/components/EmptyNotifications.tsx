'use client'

import { Bell } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { NotificationFilter } from '../types'

interface Props {
  filter: NotificationFilter
}

export default function EmptyNotifications({ filter: _filter }: Props) {
  const { t } = useTranslation('notifications')
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
      <Bell className="w-10 h-10 mb-3" />
      <p className="text-sm">{t('noNotifications')}</p>
    </div>
  )
}
