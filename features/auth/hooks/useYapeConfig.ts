'use client'

import { useQuery } from '@tanstack/react-query'
import { publicClient } from '@/lib/axios'

export interface YapeConfigPublic {
  phone: string
  holder_name: string
  is_enabled: boolean
  exchange_rate: string
  instructions_note: string
}

export function useYapeConfig() {
  return useQuery<YapeConfigPublic>({
    queryKey: ['yape-config-public'],
    queryFn: () =>
      publicClient.get<YapeConfigPublic>('/public/yape-payment/config/').then((r) => r.data),
    staleTime: 5 * 60_000,
    retry: 2,
  })
}
