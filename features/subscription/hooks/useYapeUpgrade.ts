'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'

interface YapeUpgradeRequest {
  plan: string
  screenshot: File
  amount: number
}

interface YapeUpgradeResponse {
  message: string
  proof_id: string
}

async function submitYapeUpgrade(data: YapeUpgradeRequest): Promise<YapeUpgradeResponse> {
  const form = new FormData()
  form.append('plan', data.plan)
  form.append('screenshot', data.screenshot)
  form.append('amount', String(data.amount))
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
