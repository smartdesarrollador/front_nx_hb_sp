'use client'

import { useUpgradePayment } from '../hooks/useUpgradePayment'
import type { BillingCycle } from '../types'
import { ManualPaymentStep } from '@/features/payments/components/ManualPaymentStep'
import { extractPromoRejection, usePromoCode } from '@/features/payments/hooks/usePromoCode'
import type { ProofSubmission } from '@/features/payments/types'

interface Props {
  plan: string
  priceMonthly: number
  priceAnnual: number
  billingCycle: BillingCycle
  /** Se está pagando el plan actual (renovación), no uno superior. Solo afecta rótulos. */
  isRenewal?: boolean
  onSuccess: () => void
}

/**
 * Pago manual desde una cuenta ya existente (upgrade o renovación). La pantalla es
 * `ManualPaymentStep`; aquí solo vive lo propio de este camino: la mutación autenticada
 * y los rótulos de renovación.
 */
export default function UpgradePaymentStep({
  plan, priceMonthly, priceAnnual, billingCycle, isRenewal, onSuccess,
}: Props) {
  const { mutateAsync, isPending, isError, error } = useUpgradePayment()
  const promo = usePromoCode(plan, billingCycle)

  // El precio base es el del ciclo elegido. El backend lo recalcula igual
  // (plan_upgrade_views.py nunca confía en el monto del cliente); esto solo garantiza
  // que el importe mostrado coincida con el que se va a cobrar.
  const isAnnual = billingCycle === 'annual' && priceAnnual > 0
  const basePrice = isAnnual ? priceAnnual : priceMonthly
  const periodLabel = isAnnual ? 'año' : 'mes'

  async function handleSubmit({ file, method, transactionReference, promoCode }: ProofSubmission) {
    try {
      await mutateAsync({
        plan,
        screenshot: file,
        method,
        billing_cycle: billingCycle,
        ...(transactionReference ? { transaction_reference: transactionReference } : {}),
        ...(promoCode ? { promo_code: promoCode } : {}),
      })
      onSuccess()
    } catch (err) {
      // Cupón rechazado en el submit (p. ej. se agotó entre validar y enviar):
      // se quita el cupón y se puede reintentar el envío sin él.
      const rejection = extractPromoRejection(err)
      if (rejection) {
        promo.reject(`${rejection} Puedes reintentar sin el cupón.`)
      }
    }
  }

  return (
    <ManualPaymentStep
      title="Pago de tu suscripción"
      subtitle={
        isRenewal
          ? `Realiza el pago y sube el comprobante para renovar tu plan por 1 ${periodLabel} más.`
          : 'Realiza el pago y sube el comprobante para activar tu nuevo plan.'
      }
      plan={plan}
      basePrice={basePrice}
      isAnnual={isAnnual}
      promo={promo}
      isSubmitting={isPending}
      errorMessage={
        isError && !extractPromoRejection(error)
          ? (error as Error)?.message ?? 'Error al enviar el comprobante. Intenta de nuevo.'
          : null
      }
      onSubmit={handleSubmit}
    />
  )
}
