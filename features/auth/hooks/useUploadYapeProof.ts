'use client'

import { useMutation } from '@tanstack/react-query'
import { publicClient } from '@/lib/axios'

interface UploadYapeProofRequest {
  payment_upload_token: string
  screenshot: File
  plan: string
  amount: number
}

interface UploadYapeProofResponse {
  message: string
  proof_id: string
}

async function uploadYapeProof(data: UploadYapeProofRequest): Promise<UploadYapeProofResponse> {
  const form = new FormData()
  form.append('payment_upload_token', data.payment_upload_token)
  form.append('screenshot', data.screenshot)
  form.append('plan', data.plan)
  form.append('amount', String(data.amount))
  // Do NOT set Content-Type — axios sets it automatically with multipart boundary for FormData
  const { data: response } = await publicClient.post<UploadYapeProofResponse>(
    '/auth/yape-payment-proof',
    form,
  )
  return response
}

export function useUploadYapeProof() {
  return useMutation<UploadYapeProofResponse, Error, UploadYapeProofRequest>({
    mutationFn: uploadYapeProof,
  })
}
