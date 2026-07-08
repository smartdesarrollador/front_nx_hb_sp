'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { publicClient } from '@/lib/axios'

interface AcceptInviteRequest {
  token: string
  password: string
}

export function useAcceptInvite() {
  const router = useRouter()
  return useMutation({
    mutationFn: ({ token, password }: AcceptInviteRequest) =>
      publicClient.post('/auth/accept-invite', { token, password }),
    onSuccess: () => router.push('/login?invite_success=true'),
  })
}
