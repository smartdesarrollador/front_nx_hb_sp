'use client'

import { useQuery } from '@tanstack/react-query'
import { publicClient } from '@/lib/axios'
import type { PaymentMethodPublic } from '../types'

interface PaymentMethodsResponse {
  methods: PaymentMethodPublic[]
}

/**
 * Métodos por los que se puede pagar ahora mismo, en el orden que fija el Admin.
 *
 * Va por `publicClient` porque el paso de pago del **registro** ocurre antes de que
 * exista sesión. Sustituye a `useYapeConfig`: la lista ya trae los datos de Yape, y
 * además excluye los métodos que el admin dejó a medio configurar — ofrecer un método
 * sin destino de pago lleva al cliente hasta el final del flujo para nada.
 */
export function usePaymentMethods() {
  const { data, isLoading, isError } = useQuery<PaymentMethodsResponse>({
    queryKey: ['payment-methods-public'],
    queryFn: () =>
      publicClient.get<PaymentMethodsResponse>('/public/payment-methods/').then((r) => r.data),
    staleTime: 5 * 60_000,
    retry: 2,
  })

  return { methods: data?.methods ?? [], isLoading, isError }
}
