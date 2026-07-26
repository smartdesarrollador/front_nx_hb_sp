'use client'

import { useMutation } from '@tanstack/react-query'
import { publicClient } from '@/lib/axios'

export type PromoReason =
  | 'invalid'
  | 'expired'
  | 'depleted'
  | 'plan_not_applicable'
  | 'new_customers_only'
  | 'customer_limit'
  | 'not_free'

export interface PromoValidationResult {
  valid: boolean
  reason?: PromoReason
  code?: string
  type?: 'percentage' | 'fixed_amount'
  value?: number
  original_price?: number
  discount_amount?: number
  final_price?: number
  /** El backend ya devuelve el importe convertido; su `exchange_rate` no se consume. */
  final_price_pen?: number
}

interface ValidatePromotionRequest {
  code: string
  plan: string
  /** Determina sobre qué precio del plan se calcula el descuento. Default: monthly. */
  billing_cycle?: 'monthly' | 'annual'
}

export const PROMO_REASON_MESSAGES: Record<PromoReason, string> = {
  invalid: 'El código no es válido.',
  expired: 'El código ha expirado.',
  depleted: 'El código alcanzó su límite de usos.',
  plan_not_applicable: 'El código no aplica al plan seleccionado.',
  new_customers_only: 'El código es solo para clientes nuevos.',
  customer_limit: 'Ya usaste este código el máximo de veces permitido.',
  not_free: 'El cupón no cubre el 100% del plan.',
}

async function validatePromotion(data: ValidatePromotionRequest): Promise<PromoValidationResult> {
  const { data: response } = await publicClient.post<PromoValidationResult>(
    '/public/promotions/validate/',
    data,
  )
  return response
}

export function useValidatePromotion() {
  return useMutation<PromoValidationResult, Error, ValidatePromotionRequest>({
    mutationFn: validatePromotion,
  })
}
