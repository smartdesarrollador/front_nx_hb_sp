'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { BillingCycle, PlanType } from './types'
import { useCurrentSubscription } from './hooks/useCurrentSubscription'
import { useCancelSubscription } from './hooks/useCancelSubscription'
import { useStartTrial } from './hooks/useStartTrial'
import { usePlans } from './hooks/usePlans'
import CurrentPlanCard from './components/CurrentPlanCard'
import UsageMeters from './components/UsageMeters'
import PlanComparisonGrid from './components/PlanComparisonGrid'
import UpgradePlanDrawer from './components/UpgradePlanDrawer'
import CancelSubscriptionModal from './components/CancelSubscriptionModal'
import { usePermissions } from '@/hooks/usePermissions'

export default function SubscriptionPage() {
  const { t } = useTranslation('hub')
  const { subscription, isLoading } = useCurrentSubscription()
  const { canManageBilling, canUpgradePlan } = usePermissions()
  const { mutate: cancelPlan, isPending: canceling } = useCancelSubscription()
  const { mutate: startTrial } = useStartTrial()
  const { plans } = usePlans()

  const canTrial =
    subscription?.plan === 'free' && !subscription?.professional_trial_used && canManageBilling

  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly')
  const [upgradeTarget, setUpgradeTarget] = useState<PlanType | null>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)

  const handleCancelConfirm = (reason?: string) => {
    cancelPlan(
      { reason },
      { onSuccess: () => setShowCancelModal(false) },
    )
  }

  const scrollToPlans = () => {
    document.getElementById('plan-comparison')?.scrollIntoView({ behavior: 'smooth' })
  }

  // Renovar = abrir el drawer con el plan actual preseleccionado (mismo flujo de pago que
  // el upgrade, ADR-008 decisión 3). Un tenant ya degradado a Free no renueva: vuelve a
  // contratar desde la grilla, así que ahí solo hacemos scroll.
  const handleRenew = () => {
    if (subscription && subscription.is_renewable) setUpgradeTarget(subscription.plan)
    else scrollToPlans()
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {t('subscription.title', 'Suscripción')}
        </h1>
        <p className="text-gray-500 mt-1">
          {t('subscription.subtitle', 'Gestiona tu plan y uso de la plataforma')}
        </p>
      </div>

      {!canManageBilling && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
          Solo el Owner puede gestionar la suscripción.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CurrentPlanCard
          subscription={subscription}
          isLoading={isLoading}
          canUpgradePlan={canUpgradePlan}
          onChangePlan={scrollToPlans}
          onRenew={handleRenew}
          onCancelRequest={() => setShowCancelModal(true)}
        />
        <UsageMeters usage={subscription?.usage ?? null} isLoading={isLoading} />
      </div>

      {canManageBilling && (
        <div id="plan-comparison">
          <PlanComparisonGrid
            plans={plans}
            currentPlan={subscription?.plan ?? 'free'}
            billingCycle={billingCycle}
            onBillingCycleChange={setBillingCycle}
            onUpgrade={setUpgradeTarget}
            canUpgrade={canUpgradePlan}
            isRenewable={subscription?.is_renewable && !subscription?.has_pending_proof}
            onTrial={(plan) => { if (plan === 'professional') startTrial() }}
            canTrial={canTrial}
          />
        </div>
      )}

      {upgradeTarget && (
        <UpgradePlanDrawer
          plans={plans}
          currentPlan={subscription?.plan ?? 'free'}
          initialPlan={upgradeTarget}
          billingCycle={billingCycle}
          onClose={() => setUpgradeTarget(null)}
        />
      )}
      <CancelSubscriptionModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelConfirm}
        isPending={canceling}
      />
    </div>
  )
}
