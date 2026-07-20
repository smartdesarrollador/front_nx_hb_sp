'use client'

import { useMutation } from '@tanstack/react-query'
import { publicClient } from '@/lib/axios'

interface UploadYapeProofRequest {
  payment_upload_token: string
  screenshot: File
  plan: string
  promo_code?: string
}

interface UploadYapeProofResponse {
  message: string
  proof_id: string
}

// El monto NO se envía: el backend lo calcula siempre en servidor
// (precio del plan menos el descuento del cupón, si lo hay).
async function uploadYapeProof(data: UploadYapeProofRequest): Promise<UploadYapeProofResponse> {
  const form = new FormData()
  form.append('payment_upload_token', data.payment_upload_token)
  form.append('screenshot', data.screenshot)
  form.append('plan', data.plan)
  if (data.promo_code) {
    form.append('promo_code', data.promo_code)
  }
  const { data: response } = await publicClient.post<UploadYapeProofResponse>(
    '/auth/yape-payment-proof',
    form,
    { headers: { 'Content-Type': undefined } },
  )
  return response
}

export function useUploadYapeProof() {
  return useMutation<UploadYapeProofResponse, Error, UploadYapeProofRequest>({
    mutationFn: uploadYapeProof,
  })
}
