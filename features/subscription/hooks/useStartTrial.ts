'use client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { CurrentSubscription } from '../types'

interface StartTrialResponse {
  subscription: CurrentSubscription
  trial_end: string
}

export function useStartTrial() {
  const queryClient = useQueryClient()
  return useMutation<StartTrialResponse, Error, void>({
    mutationFn: () =>
      apiClient.post<StartTrialResponse>('/admin/subscriptions/trial').then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hub-subscription'] })
    },
  })
}
