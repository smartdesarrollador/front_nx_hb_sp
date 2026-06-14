'use client'

import { useMutation } from '@tanstack/react-query'
import { useAuthContext } from '@/features/auth/AuthContext'
import type { RegisterRequest } from '@/features/auth/AuthContext'
import type { RegisterResponse } from '@/types/auth'

export function useRegister() {
  const { register } = useAuthContext()
  return useMutation<RegisterResponse, Error, RegisterRequest>({
    mutationFn: (data: RegisterRequest) => register(data),
  })
}
