'use client'

import { useMutation } from '@tanstack/react-query'
import { publicClient } from '@/lib/axios'

interface ActivateFreePlanRequest {
  payment_upload_token: string
  plan: string
  promo_code: string
}

interface ActivateFreePlanResponse {
  message: string
  activated: boolean
}

async function activateFreePlan(data: ActivateFreePlanRequest): Promise<ActivateFreePlanResponse> {
  const { data: response } = await publicClient.post<ActivateFreePlanResponse>(
    '/auth/yape-activate-free',
    data,
  )
  return response
}

export function useActivateFreePlan() {
  return useMutation<ActivateFreePlanResponse, Error, ActivateFreePlanRequest>({
    mutationFn: activateFreePlan,
  })
}
