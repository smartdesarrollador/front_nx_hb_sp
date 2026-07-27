'use client'

import { useMutation } from '@tanstack/react-query'
import { publicClient } from '@/lib/axios'

import type { BillingCycle } from '@/features/subscription/types'

interface ActivateFreePlanRequest {
  payment_upload_token: string
  plan: string
  promo_code: string
  /**
   * El cupón debe cubrir el 100% del precio de ESTE ciclo, y de él sale la duración
   * del período activado (30 vs. 365 días).
   */
  billing_cycle?: BillingCycle
}

interface ActivateFreePlanResponse {
  message: string
  activated: boolean
}

async function activateFreePlan(data: ActivateFreePlanRequest): Promise<ActivateFreePlanResponse> {
  const { data: response } = await publicClient.post<ActivateFreePlanResponse>(
    '/auth/activate-free-plan',
    data,
  )
  return response
}

export function useActivateFreePlan() {
  return useMutation<ActivateFreePlanResponse, Error, ActivateFreePlanRequest>({
    mutationFn: activateFreePlan,
  })
}
