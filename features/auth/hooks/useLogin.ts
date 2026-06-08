'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/features/auth/AuthContext'

export function useLogin(options?: { skipNavigate?: boolean }) {
  const router = useRouter()
  const { login } = useAuthContext()
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
    onSuccess: (result) => {
      if ('ok' in result && !options?.skipNavigate) router.push('/dashboard')
    },
  })
}
