'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'

import type { BillingCycle } from '../types'

interface UpgradePaymentRequest {
  plan: string
  screenshot: File
  /** Método elegido. El backend lo valida contra los habilitados; default: yape. */
  method?: string
  /** ID de la transacción; obligatorio en los métodos que lo emiten (PayPal). */
  transaction_reference?: string
  promo_code?: string
  billing_cycle?: BillingCycle
}

interface UpgradePaymentResponse {
  message: string
  proof_id: string
  /** true si se pagó el plan que ya se tenía (renovación) en vez de un plan superior. */
  is_renewal: boolean
  billing_cycle: BillingCycle
}

export const PENDING_PROOF_MESSAGE =
  'Ya tienes un comprobante en revisión. Te avisaremos por email en cuanto lo validemos.'

// El monto NO se envía: el backend lo calcula siempre en servidor
// (precio del plan y ciclo, menos el descuento del cupón si lo hay).
async function submitUpgradePayment(data: UpgradePaymentRequest): Promise<UpgradePaymentResponse> {
  const form = new FormData()
  form.append('plan', data.plan)
  form.append('screenshot', data.screenshot)
  if (data.method) {
    form.append('method', data.method)
  }
  if (data.transaction_reference) {
    form.append('transaction_reference', data.transaction_reference)
  }
  if (data.promo_code) {
    form.append('promo_code', data.promo_code)
  }
  if (data.billing_cycle) {
    form.append('billing_cycle', data.billing_cycle)
  }
  // Trailing slash requerido: en producción NEXT_PUBLIC_API_URL apunta directo al
  // dominio del backend (sin pasar por el rewrite de next.config.ts que en dev
  // agrega la barra), así que debe coincidir exacto con el path de Django
  // (`plan-upgrade/`) o Django responde 500/405 vía APPEND_SLASH (ver LL-001/LL-005).
  try {
    const { data: response } = await apiClient.post<UpgradePaymentResponse>(
      '/admin/subscriptions/plan-upgrade/',
      form,
      { headers: { 'Content-Type': undefined } },
    )
    return response
  } catch (err) {
    // 409 = ya hay un comprobante pendiente de revisión (el backend impide crear dos:
    // ambos podrían aprobarse y cobrar dos veces). Es un estado esperable, no un fallo,
    // así que se traduce a un mensaje accionable en vez del error crudo de axios.
    const status = (err as { response?: { status?: number } }).response?.status
    if (status === 409) {
      throw new Error(PENDING_PROOF_MESSAGE)
    }
    throw err
  }
}

export function useUpgradePayment() {
  const queryClient = useQueryClient()
  return useMutation<UpgradePaymentResponse, Error, UpgradePaymentRequest>({
    mutationFn: submitUpgradePayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hub-subscription'] })
    },
  })
}
