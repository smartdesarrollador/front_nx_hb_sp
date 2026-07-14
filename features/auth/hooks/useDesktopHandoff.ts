'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthContext } from '@/features/auth/AuthContext'
import { useAuthStore } from '@/store/authStore'
import { clearRefreshTokenCookie } from '@/lib/auth-cookie'
import { buildDesktopDeepLinkUrl } from '@/features/auth/utils/buildDesktopDeepLinkUrl'

type DesktopHandoffStatus = 'none' | 'checking' | 'redirecting-desktop' | 'redirecting-login'

interface DesktopHandoffResult {
  status: DesktopHandoffStatus
  deepLinkUrl: string | null
}

export function useDesktopHandoff(): DesktopHandoffResult {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isLoading } = useAuthContext()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const hasFiredRef = useRef(false)

  const [result, setResult] = useState<DesktopHandoffResult>(() => {
    const source = searchParams.get('source')
    const state = searchParams.get('state')
    return source === 'desktop' && state
      ? { status: 'checking', deepLinkUrl: null }
      : { status: 'none', deepLinkUrl: null }
  })

  useEffect(() => {
    if (hasFiredRef.current) return
    if (result.status === 'none') return
    if (isLoading) return

    const state = searchParams.get('state')
    if (!state) return

    hasFiredRef.current = true

    if (isAuthenticated) {
      const url = buildDesktopDeepLinkUrl(state)
      setResult({ status: 'redirecting-desktop', deepLinkUrl: url })
      window.location.href = url
      router.replace('/dashboard')
    } else {
      // Defensive: guarantees no redirect loop even if the cookie/localStorage
      // ever end up desynced (middleware only checks cookie presence).
      clearRefreshTokenCookie()
      setResult({ status: 'redirecting-login', deepLinkUrl: null })
      router.replace(`/login?source=desktop&state=${encodeURIComponent(state)}`)
    }
  }, [isLoading, isAuthenticated, result.status, router, searchParams])

  return result
}
