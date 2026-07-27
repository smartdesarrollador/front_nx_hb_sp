'use client'

import { useMutation } from '@tanstack/react-query'
import { publicClient } from '@/lib/axios'

import type { BillingCycle } from '@/features/subscription/types'

interface UploadPaymentProofRequest {
  payment_upload_token: string
  screenshot: File
  plan: string
  /** Método elegido. El backend lo valida contra los habilitados; default: yape. */
  method?: string
  /** ID de la transacción; obligatorio en los métodos que lo emiten (PayPal). */
  transaction_reference?: string
  promo_code?: string
  /** Determina precio y duración del período (30 vs. 365 d). Default del backend: monthly. */
  billing_cycle?: BillingCycle
}

interface UploadPaymentProofResponse {
  message: string
  proof_id: string
  billing_cycle: BillingCycle
}

// El monto NO se envía: el backend lo calcula siempre en servidor
// (precio del plan y ciclo, menos el descuento del cupón si lo hay).
async function uploadPaymentProof(data: UploadPaymentProofRequest): Promise<UploadPaymentProofResponse> {
  const form = new FormData()
  form.append('payment_upload_token', data.payment_upload_token)
  form.append('screenshot', data.screenshot)
  form.append('plan', data.plan)
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
  const { data: response } = await publicClient.post<UploadPaymentProofResponse>(
    '/auth/payment-proof',
    form,
    { headers: { 'Content-Type': undefined } },
  )
  return response
}

export function useUploadPaymentProof() {
  return useMutation<UploadPaymentProofResponse, Error, UploadPaymentProofRequest>({
    mutationFn: uploadPaymentProof,
  })
}
