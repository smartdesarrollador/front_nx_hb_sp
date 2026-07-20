'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'

interface YapeUpgradeRequest {
  plan: string
  screenshot: File
  promo_code?: string
}

interface YapeUpgradeResponse {
  message: string
  proof_id: string
}

// El monto NO se envía: el backend lo calcula siempre en servidor
// (precio del plan menos el descuento del cupón, si lo hay).
async function submitYapeUpgrade(data: YapeUpgradeRequest): Promise<YapeUpgradeResponse> {
  const form = new FormData()
  form.append('plan', data.plan)
  form.append('screenshot', data.screenshot)
  if (data.promo_code) {
    form.append('promo_code', data.promo_code)
  }
  const { data: response } = await apiClient.post<YapeUpgradeResponse>(
    '/admin/subscriptions/yape-upgrade',
    form,
    { headers: { 'Content-Type': undefined } },
  )
  return response
}

export function useYapeUpgrade() {
  const queryClient = useQueryClient()
  return useMutation<YapeUpgradeResponse, Error, YapeUpgradeRequest>({
    mutationFn: submitYapeUpgrade,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hub-subscription'] })
    },
  })
}
