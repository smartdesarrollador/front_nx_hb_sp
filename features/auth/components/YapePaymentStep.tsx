'use client'

import { PartyPopper } from 'lucide-react'
import { useUploadYapeProof } from '@/features/auth/hooks/useUploadYapeProof'
import { usePaymentTokenStatus } from '@/features/auth/hooks/usePaymentTokenStatus'
import { useActivateFreePlan } from '@/features/auth/hooks/useActivateFreePlan'
import { usePlans } from '@/features/subscription/hooks/usePlans'
import BillingCycleToggle from '@/features/subscription/components/BillingCycleToggle'
import { annualDiscountPercent } from '@/features/subscription/plans-data'
import type { BillingCycle } from '@/features/subscription/types'
import { ManualPaymentStep } from '@/features/payments/components/ManualPaymentStep'
import { extractPromoRejection, usePromoCode } from '@/features/payments/hooks/usePromoCode'
import type { ProofSubmission } from '@/features/payments/types'
import { useCurrencyConfig } from '@/hooks/useCurrencyConfig'

interface Props {
  paymentUploadToken: string
  plan: string
  /** Ciclo elegido en el paso 3. Determina precio y duración del período. */
  billingCycle?: BillingCycle
  /**
   * Permite cambiar el ciclo aquí mismo. En este paso ya no hay vuelta atrás —la cuenta
   * se creó al pulsar "Crear cuenta"— pero el ciclo es lo único que aún no está decidido
   * en el backend: solo se materializa al crear el comprobante. Sin esta prop, el toggle
   * no se muestra.
   */
  onBillingCycleChange?: (cycle: BillingCycle) => void
  /**
   * Comprobar contra el backend que el token siga vivo antes de pedir el comprobante.
   * Solo tiene sentido al rehidratar el paso (refresco / back): recién emitido no hay
   * nada que comprobar, y preguntar sería una llamada de más en el camino feliz.
   */
  verifyToken?: boolean
  onSuccess: () => void
  /** Cupón 100%: la cuenta se activa sin comprobante */
  onActivated: () => void
}

/**
 * Pago manual durante el registro. La pantalla es `ManualPaymentStep`; aquí vive lo
 * propio de este camino: el token de subida, el toggle de ciclo (que obliga a revalidar
 * el cupón) y la activación directa cuando un cupón cubre el 100%.
 */
export default function YapePaymentStep({
  paymentUploadToken, plan, billingCycle = 'monthly', onBillingCycleChange,
  verifyToken = false, onSuccess, onActivated,
}: Props) {
  const { plans, isLoading: plansLoading } = usePlans()
  const { isLoading: rateLoading } = useCurrencyConfig()
  const tokenStatus = usePaymentTokenStatus(paymentUploadToken, verifyToken)
  const { mutateAsync, isPending, isError, error } = useUploadYapeProof()
  const activateFree = useActivateFreePlan()
  const promo = usePromoCode(plan, billingCycle)

  // Precio real del plan (modelo Plan del backend) — nunca hardcodeado. El backend
  // recalcula el monto de todos modos; esto solo garantiza que lo mostrado coincida
  // con lo que se va a cobrar.
  const planData = plans.find((p) => p.id === plan)
  const isAnnual = billingCycle === 'annual' && (planData?.priceAnnual ?? 0) > 0
  const basePrice = (isAnnual ? planData?.priceAnnual : planData?.priceMonthly) ?? 0
  // `null` cuando el plan no tiene ahorro anual → sin toggle que ofrecer.
  const cycleDiscount = planData ? annualDiscountPercent(planData) : null
  const isFreeWithPromo = promo.applied !== null && promo.applied.final_price === 0

  /**
   * Cambiar de ciclo obliga a revalidar el cupón: su descuento se calculó contra el
   * precio del OTRO ciclo. Sin esto se mostraría un total que el backend recalcularía
   * distinto (el monto siempre se recalcula en servidor).
   *
   * Handler explícito y no `useEffect` sobre billingCycle: la intención queda a la
   * vista y no depende del orden en que React aplique el estado — por eso se revalida
   * con el `cycle` recibido, no con la prop, que aún no se ha actualizado.
   */
  async function handleCycleChange(cycle: BillingCycle) {
    if (cycle === billingCycle) return
    onBillingCycleChange?.(cycle)
    await promo.revalidate(cycle)
  }

  async function handleSubmit({ file, method, transactionReference, promoCode }: ProofSubmission) {
    try {
      await mutateAsync({
        payment_upload_token: paymentUploadToken,
        screenshot: file,
        method,
        plan,
        billing_cycle: billingCycle,
        ...(transactionReference ? { transaction_reference: transactionReference } : {}),
        ...(promoCode ? { promo_code: promoCode } : {}),
      })
      onSuccess()
    } catch (err) {
      // Cupón rechazado en el submit (p. ej. se agotó entre validar y enviar):
      // el token sigue vivo — se quita el cupón y el usuario puede reintentar.
      const rejection = extractPromoRejection(err)
      if (rejection) {
        promo.reject(`${rejection} Puedes reintentar sin el cupón.`)
      }
    }
  }

  async function handleActivateFree() {
    const code = promo.applied?.code
    if (!code) return
    promo.setError(null)
    try {
      await activateFree.mutateAsync({
        payment_upload_token: paymentUploadToken,
        plan,
        promo_code: code,
        billing_cycle: billingCycle,
      })
      onActivated()
    } catch (err) {
      const rejection = extractPromoRejection(err)
      promo.reject(rejection ?? 'No se pudo activar la cuenta. Intenta de nuevo.')
    }
  }

  // Token muerto al rehidratar (caducado o ya usado). Se avisa ANTES de pedir el
  // comprobante: descubrirlo después de subirlo sería un 400 opaco tras el esfuerzo.
  // La cuenta ya existe, así que el camino de vuelta es la sesión normal, no repetir el
  // registro (el email daría "ya registrado").
  if (verifyToken && tokenStatus.data && !tokenStatus.data.valid) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          El enlace de pago caducó
        </h2>
        <div
          className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20 p-4 text-sm text-amber-800 dark:text-amber-300 space-y-2"
          role="status"
        >
          <p className="font-medium">Tu cuenta ya está creada — no la pierdas.</p>
          <p>
            Verifica tu email con el enlace que te enviamos, inicia sesión y completa el
            pago desde <strong>Suscripción</strong>. Tu plan te estará esperando ahí.
          </p>
        </div>
        <a
          href="/login"
          className="block w-full text-center bg-primary-600 text-white py-2.5 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
        >
          Ir al inicio de sesión
        </a>
      </div>
    )
  }

  return (
    <ManualPaymentStep
      title="Pago de tu suscripción"
      subtitle="Realiza el pago y sube el comprobante para activar tu cuenta."
      plan={plan}
      basePrice={basePrice}
      isAnnual={isAnnual}
      promo={promo}
      isSubmitting={isPending}
      isLoadingExtra={plansLoading || rateLoading}
      errorMessage={
        isError && !extractPromoRejection(error)
          ? (error as Error)?.message ?? 'Error al enviar el comprobante. Intenta de nuevo.'
          : null
      }
      onSubmit={handleSubmit}
      headerSlot={
        /* Aquí ya no se puede retroceder (la cuenta está creada), pero el ciclo sigue
           siendo editable: no se fija hasta que se envía el comprobante. Se oculta si el
           plan no tiene precio anual — no se ofrece una elección sin efecto. */
        onBillingCycleChange && cycleDiscount !== null ? (
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ¿Prefieres otro ciclo?
            </span>
            <div className={promo.isValidating ? 'pointer-events-none opacity-60' : ''}>
              <BillingCycleToggle
                value={billingCycle}
                onChange={handleCycleChange}
                discountPercent={cycleDiscount}
              />
            </div>
          </div>
        ) : null
      }
      footerSlot={
        isFreeWithPromo ? (
          <>
            <button
              type="button"
              onClick={handleActivateFree}
              disabled={activateFree.isPending}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <PartyPopper className="w-4 h-4" />
              {activateFree.isPending ? 'Activando cuenta...' : 'Activar mi cuenta'}
            </button>
            <p className="text-center text-xs text-gray-400">
              Tu cuenta se activará de inmediato, sin pago ni comprobante.
            </p>
          </>
        ) : null
      }
    />
  )
}
