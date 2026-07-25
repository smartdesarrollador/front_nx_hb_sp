'use client'

import { Check, X } from 'lucide-react'
import type { BillingCycle, PlanData, PlanType } from '../types'
import { annualDiscountPercent, annualSavings, isUpgrade, maxAnnualDiscount, MONTHS_PER_YEAR } from '../plans-data'
import BillingCycleToggle from './BillingCycleToggle'

interface PlanCardProps {
  plan: PlanData
  currentPlan: PlanType
  billingCycle: BillingCycle
  onSelect: (plan: PlanType) => void
  canUpgrade: boolean
  /** El plan actual es renovable hoy: su botón pasa de inerte a "Renovar plan". */
  isRenewable?: boolean
  onTrial?: (plan: PlanType) => void
  canTrial?: boolean
}

function PlanCard({
  plan, currentPlan, billingCycle, onSelect, canUpgrade, isRenewable, onTrial, canTrial,
}: PlanCardProps) {
  const isCurrent = plan.id === currentPlan
  const canRenew = Boolean(isCurrent && isRenewable && canUpgrade)
  const canSelect = (canUpgrade && isUpgrade(currentPlan, plan.id)) || canRenew
  const isAnnual = billingCycle === 'annual' && plan.priceAnnual > 0
  const price = isAnnual ? Math.round(plan.priceAnnual / MONTHS_PER_YEAR) : plan.priceMonthly
  const discount = annualDiscountPercent(plan)
  const savings = annualSavings(plan)

  let borderClass = 'border-gray-200'
  if (isCurrent) borderClass = 'border-primary-500 ring-2 ring-primary-500/30'
  else if (plan.popular) borderClass = 'border-indigo-300'

  return (
    <div className={`bg-white rounded-xl border-2 ${borderClass} p-5 flex flex-col relative`}>
      {isCurrent && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
          Plan Actual
        </span>
      )}
      {plan.popular && !isCurrent && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
          Más Popular
        </span>
      )}

      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900">{plan.displayName}</h3>
        <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
        <div className="mt-3">
          <span className="text-3xl font-bold text-gray-900">${price}</span>
          <span className="text-gray-500 text-sm">/mes</span>
          {isAnnual && (
            <p className="text-xs text-gray-400 mt-1">
              ${plan.priceAnnual}/año facturado de una vez
              {discount !== null && (
                <span className="text-green-600 font-medium"> · ahorras ${savings} (−{discount}%)</span>
              )}
            </p>
          )}
        </div>
      </div>

      <ul className="space-y-2 flex-1 mb-5">
        {plan.features.map((f) => (
          <li key={f.label} className="flex items-center gap-2 text-sm">
            {f.included ? (
              <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
            ) : (
              <X className="w-4 h-4 text-gray-300 flex-shrink-0" />
            )}
            <span className={f.included ? 'text-gray-700' : 'text-gray-400'}>{f.label}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => canSelect && onSelect(plan.id)}
        disabled={!canSelect}
        className={`w-full py-2 px-4 rounded-lg text-sm font-semibold transition-colors ${
          canSelect
            ? 'bg-primary-600 text-white hover:bg-primary-700'
            : isCurrent
              ? 'bg-gray-100 text-gray-400 cursor-default'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        {canRenew
          ? 'Renovar plan'
          : isCurrent
            ? 'Plan actual'
            : canSelect
              ? 'Actualizar plan'
              : 'Plan inferior'}
      </button>

      {plan.id === 'professional' && canTrial && !isCurrent && onTrial && (
        <button
          onClick={() => onTrial('professional')}
          className="w-full mt-2 py-1.5 px-4 rounded-lg text-sm font-medium border border-primary-600 text-primary-600 hover:bg-primary-50 transition-colors"
        >
          Probar 30 días gratis
        </button>
      )}
    </div>
  )
}

interface Props {
  plans: PlanData[]
  currentPlan: PlanType
  billingCycle: BillingCycle
  onBillingCycleChange: (cycle: BillingCycle) => void
  onUpgrade: (plan: PlanType) => void
  canUpgrade: boolean
  isRenewable?: boolean
  onTrial?: (plan: PlanType) => void
  canTrial?: boolean
}

export default function PlanComparisonGrid({
  plans,
  currentPlan,
  billingCycle,
  onBillingCycleChange,
  onUpgrade,
  canUpgrade,
  isRenewable,
  onTrial,
  canTrial,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Planes disponibles</h2>
        <BillingCycleToggle
          value={billingCycle}
          onChange={onBillingCycleChange}
          discountPercent={maxAnnualDiscount(plans)}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            currentPlan={currentPlan}
            billingCycle={billingCycle}
            onSelect={onUpgrade}
            canUpgrade={canUpgrade}
            isRenewable={isRenewable}
            onTrial={onTrial}
            canTrial={canTrial}
          />
        ))}
      </div>
    </div>
  )
}
