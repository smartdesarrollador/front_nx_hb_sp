'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { publicClient } from '@/lib/axios'

interface ResetPasswordRequest {
  token: string
  password: string
}

export function useResetPassword() {
  const router = useRouter()
  return useMutation({
    mutationFn: ({ token, password }: ResetPasswordRequest) =>
      publicClient.post('/auth/reset-password/', { token, password }),
    onSuccess: () => router.push('/login?reset_success=true'),
  })
}
