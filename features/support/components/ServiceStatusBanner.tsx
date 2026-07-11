'use client'

import { CheckCircle2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function ServiceStatusBanner() {
  const { t } = useTranslation('support')
  return (
    <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700">
      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
      <span className="font-medium">{t('serviceStatus')}:</span>
      <span>{t('serviceStatusOk')}</span>
    </div>
  )
}
