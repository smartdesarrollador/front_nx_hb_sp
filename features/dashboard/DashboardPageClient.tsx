'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePermissions } from '@/hooks/usePermissions'
import { useFeatureGate } from '@/hooks/useFeatureGate'
import { useDesktopHandoff } from '@/features/auth/hooks/useDesktopHandoff'
import { useDashboardSummary } from './hooks/useDashboardSummary'
import { useActiveServices } from './hooks/useActiveServices'
import { SummaryCards } from './components/SummaryCards'
import { ActiveServicesList } from './components/ActiveServicesList'
import { ServiceUpgradeCatalog } from './components/ServiceUpgradeCatalog'
import { PlanUsageBanner } from './components/PlanUsageBanner'
import UpgradePlanDrawer from '@/features/subscription/components/UpgradePlanDrawer'
import { usePlans } from '@/features/subscription/hooks/usePlans'
import { DashboardAnnouncementModal } from '@/features/announcements/components/DashboardAnnouncementModal'
import type { PlanType } from '@/features/subscription/types'

export default function DashboardPage() {
  const { status: desktopHandoffStatus, deepLinkUrl } = useDesktopHandoff()
  const { t } = useTranslation('dashboard')
  const { canManageBilling } = usePermissions()
  const { getLimit } = useFeatureGate()
  const summary = useDashboardSummary()
  const { services, isLoading: servicesLoading } = useActiveServices()
  const { plans } = usePlans()
  const [showUpgradeDrawer, setShowUpgradeDrawer] = useState(false)

  const limitUsers = getLimit('users')
  const currentPlan = (summary.subscription?.plan ?? 'free') as PlanType

  if (desktopHandoffStatus !== 'none') {
    return (
      <div className="text-center py-16">
        {desktopHandoffStatus === 'checking' && (
          <p className="text-gray-500 dark:text-gray-400">Verificando tu sesión…</p>
        )}
        {desktopHandoffStatus === 'redirecting-desktop' && (
          <>
            <div className="text-4xl mb-4">✅</div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Sesión iniciada en tu app de escritorio
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
              Si el sidebar no se actualizó automáticamente, haz clic en el botón:
            </p>
            {deepLinkUrl && (
              <a
                href={deepLinkUrl}
                className="inline-block bg-primary-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-primary-700 transition-colors text-sm"
              >
                Abrir en el sidebar
              </a>
            )}
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-4">
              Puedes cerrar esta pestaña una vez que el sidebar muestre tu perfil.
            </p>
          </>
        )}
        {desktopHandoffStatus === 'redirecting-login' && (
          <p className="text-gray-500 dark:text-gray-400">Redirigiendo…</p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('welcome')}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{t('accountSummary')}</p>
      </div>

      <PlanUsageBanner currentUsers={0} limitUsers={limitUsers} />

      <SummaryCards
        summary={summary}
        canManageBilling={canManageBilling}
        onUpgradePlan={() => setShowUpgradeDrawer(true)}
      />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('myServices')}</h2>
        <ActiveServicesList services={services} isLoading={servicesLoading} />
      </section>

      <ServiceUpgradeCatalog activeServiceIds={services.map((s) => s.id)} />

      {showUpgradeDrawer && (
        <UpgradePlanDrawer
          plans={plans}
          currentPlan={currentPlan}
          onClose={() => setShowUpgradeDrawer(false)}
        />
      )}

      <DashboardAnnouncementModal />
    </div>
  )
}
