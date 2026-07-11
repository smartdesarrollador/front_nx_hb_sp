'use client'

import { useState } from 'react'
import { X, ArrowLeft, Check } from 'lucide-react'
import type { PlanData, PlanType } from '../types'
import { isUpgrade } from '../plans-data'
import YapeUpgradeStep from './YapeUpgradeStep'

interface Props {
  plans: PlanData[]
  currentPlan: PlanType
  /** Si se pasa, salta el paso de selección y abre directo en 'yape' para ese plan. */
  initialPlan?: PlanType
  onClose: () => void
}

type Step = 'select' | 'yape' | 'success'

export default function UpgradePlanDrawer({ plans, currentPlan, initialPlan, onClose }: Props) {
  const [step, setStep]               = useState<Step>(initialPlan ? 'yape' : 'select')
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(initialPlan ?? null)

  const upgradablePlans = plans.filter((p) => isUpgrade(currentPlan, p.id))
  const selectedPlanData = selectedPlan ? plans.find((p) => p.id === selectedPlan) ?? null : null

  function handleSelectPlan(plan: PlanType) {
    setSelectedPlan(plan)
    setStep('yape')
  }

  function handleSuccess() {
    setStep('success')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Actualizar plan"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-lg bg-white dark:bg-gray-900 shadow-2xl flex flex-col h-full overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <div className="flex items-center gap-3">
            {step === 'yape' && (
              <button
                onClick={() => setStep('select')}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Volver a selección de plan"
              >
                <ArrowLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            )}
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {step === 'select' && 'Elige tu nuevo plan'}
              {step === 'yape' && 'Confirmar pago con Yape'}
              {step === 'success' && '¡Comprobante enviado!'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-5">
          {step === 'select' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Plan actual: <span className="font-semibold capitalize text-gray-700 dark:text-gray-300">{currentPlan}</span>
              </p>

              {upgradablePlans.length === 0 ? (
                <p className="text-sm text-gray-500">Ya estás en el plan máximo disponible.</p>
              ) : (
                <div className="space-y-3">
                  {upgradablePlans.map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => handleSelectPlan(plan.id)}
                      className={`w-full text-left rounded-xl border-2 p-4 transition-all hover:border-primary-400 hover:shadow-sm ${
                        plan.popular
                          ? 'border-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-700'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 dark:text-white">
                            {plan.displayName}
                          </span>
                          {plan.popular && (
                            <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full font-semibold">
                              Popular
                            </span>
                          )}
                        </div>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          ${plan.priceMonthly}
                          <span className="text-sm font-normal text-gray-500">/mes</span>
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                        {plan.description}
                      </p>
                      <ul className="space-y-1">
                        {plan.features.filter((f) => f.included).slice(0, 4).map((f) => (
                          <li key={f.label} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                            {f.label}
                          </li>
                        ))}
                      </ul>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 'yape' && selectedPlan && (
            <YapeUpgradeStep
              plan={selectedPlan}
              priceMonthly={selectedPlanData?.priceMonthly ?? 0}
              onSuccess={handleSuccess}
            />
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                ¡Comprobante enviado!
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                Revisaremos tu pago en breve. Recibirás un email de confirmación cuando
                tu plan sea activado.
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors"
              >
                Entendido
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
