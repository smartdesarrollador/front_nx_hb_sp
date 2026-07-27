'use client'

import { useState } from 'react'
import {
  PROMO_REASON_MESSAGES,
  useValidatePromotion,
  type PromoReason,
  type PromoValidationResult,
} from '@/features/auth/hooks/useValidatePromotion'
import type { BillingCycle } from '@/features/subscription/types'

export function promoMessage(reason: string | undefined): string {
  return PROMO_REASON_MESSAGES[reason as PromoReason] ?? 'El código no es válido.'
}

/**
 * Mensaje de un cupón rechazado por el backend **al enviar** el comprobante (p. ej. se
 * agotó entre validarlo y enviarlo). `null` si el error no es del cupón.
 */
export function extractPromoRejection(err: unknown): string | null {
  const data = (err as { response?: { data?: { promo_reason?: string; detail?: string } } })
    .response?.data
  if (!data?.promo_reason) return null
  return data.detail ?? promoMessage(data.promo_reason)
}

export interface PromoState {
  applied: PromoValidationResult | null
  input: string
  setInput: (value: string) => void
  isOpen: boolean
  toggle: () => void
  error: string | null
  setError: (message: string | null) => void
  isValidating: boolean
  apply: () => Promise<void>
  remove: () => void
  /** Descarta el cupón y explica por qué, tras un rechazo del backend en el envío. */
  reject: (message: string) => void
  revalidate: (cycle: BillingCycle) => Promise<void>
}

/**
 * Estado del código de descuento, compartido por los dos caminos de pago manual
 * (registro y upgrade/renovación), que hasta ahora lo tenían duplicado línea a línea.
 *
 * `revalidate` existe porque **cambiar de ciclo invalida el descuento**: se calculó
 * contra el precio del otro ciclo, y un monto fijo que cubría el mensual puede quedarse
 * corto en el anual. Lo dispara el padre —el paso de registro es el único con toggle de
 * ciclo— y por eso este estado vive fuera del componente de UI.
 */
export function usePromoCode(plan: string, billingCycle: BillingCycle): PromoState {
  const [applied, setApplied] = useState<PromoValidationResult | null>(null)
  const [input, setInput] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validate = useValidatePromotion()

  async function apply() {
    const code = input.trim().toUpperCase()
    if (!code) return
    setError(null)
    try {
      const result = await validate.mutateAsync({ code, plan, billing_cycle: billingCycle })
      if (result.valid) {
        setApplied(result)
      } else {
        setApplied(null)
        setError(promoMessage(result.reason))
      }
    } catch {
      setApplied(null)
      setError('No se pudo validar el código. Intenta de nuevo.')
    }
  }

  function remove() {
    setApplied(null)
    setInput('')
    setError(null)
  }

  function reject(message: string) {
    setApplied(null)
    setError(message)
  }

  /**
   * Se revalida con el `cycle` recibido y no con la prop `billingCycle`: el padre acaba
   * de pedir el cambio y React todavía no lo ha aplicado.
   */
  async function revalidate(cycle: BillingCycle) {
    const code = applied?.code
    if (!code) return

    setError(null)
    try {
      const result = await validate.mutateAsync({ code, plan, billing_cycle: cycle })
      if (result.valid) {
        // Un porcentaje sigue valiendo y se recalcula solo; un monto fijo que cubría el
        // mensual puede dejar de cubrir el anual y pasar a ser un descuento parcial.
        setApplied(result)
      } else {
        setApplied(null)
        setError(
          `El cupón ${code} no aplica al plan ${cycle === 'annual' ? 'anual' : 'mensual'}. ` +
          promoMessage(result.reason),
        )
      }
    } catch {
      setApplied(null)
      setError('No se pudo revalidar el código con el ciclo nuevo. Vuelve a aplicarlo.')
    }
  }

  return {
    applied,
    input,
    setInput,
    isOpen,
    toggle: () => setIsOpen((v) => !v),
    error,
    setError,
    isValidating: validate.isPending,
    apply,
    remove,
    reject,
    revalidate,
  }
}
