'use client'

import { useMutation } from '@tanstack/react-query'
import { publicClient } from '@/lib/axios'

export interface ContactFormData {
  name: string
  email: string
  phone?: string
  message: string
  recaptcha_token: string
}

export function useSubmitContact() {
  return useMutation({
    mutationFn: (data: ContactFormData) =>
      publicClient.post('/public/contact', data),
  })
}
