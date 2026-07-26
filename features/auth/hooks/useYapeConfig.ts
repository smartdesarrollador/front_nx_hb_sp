'use client'

import { useQuery } from '@tanstack/react-query'
import { publicClient } from '@/lib/axios'

/**
 * `exchange_rate` ya no está aquí: el tipo de cambio se lee de `/public/currency/`
 * (ver `hooks/useCurrencyConfig`). El backend todavía sirve el campo por
 * compatibilidad, pero nadie lo consume — es lo que permite retirarlo.
 */
export interface YapeConfigPublic {
  phone: string
  holder_name: string
  is_enabled: boolean
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
