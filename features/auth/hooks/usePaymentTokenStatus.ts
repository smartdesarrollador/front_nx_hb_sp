'use client'

import { useQuery } from '@tanstack/react-query'
import { publicClient } from '@/lib/axios'

export interface PaymentTokenStatus {
  valid: boolean
  /** Segundos restantes, o null si el token ya no sirve. */
  expires_in: number | null
}

/**
 * ¿El token de subida sigue vivo? Se consulta **solo al rehidratar** el paso de pago
 * (`enabled`), no en el flujo normal: ahí el token acaba de nacer y preguntar sería una
 * llamada de más. Sin esto, un token caducado se descubre después de subir el
 * comprobante, con un 400 que no le explica nada al cliente.
 */
export function usePaymentTokenStatus(token: string | null, enabled: boolean) {
  return useQuery<PaymentTokenStatus>({
    queryKey: ['payment-token-status', token],
    queryFn: () =>
      publicClient
        .get<PaymentTokenStatus>('/auth/payment-token-status', { params: { token } })
        .then((r) => r.data),
    enabled: enabled && Boolean(token),
    // Es un dato con caducidad propia: no tiene sentido servirlo de caché ni reintentar
    // en bucle si la red falla.
    staleTime: 0,
    retry: 1,
  })
}
