'use client'

import { useQuery } from '@tanstack/react-query'
import { publicClient } from '@/lib/axios'
import type { FooterConfig } from '../types'

export function useFooterConfig() {
  const { data, isLoading } = useQuery({
    queryKey: ['footer-config'],
    queryFn: () =>
      publicClient.get<FooterConfig>('/public/footer').then((r) => r.data),
    staleTime: 10 * 60 * 1000,
  })

  return { footer: data, isLoading }
}
