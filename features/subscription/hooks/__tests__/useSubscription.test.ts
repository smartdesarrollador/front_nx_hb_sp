import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { renderHookWithProviders } from '@/test/utils'
import { useCurrentSubscription } from '@/features/subscription/hooks/useCurrentSubscription'
import { useCancelSubscription } from '@/features/subscription/hooks/useCancelSubscription'
import { useAuthStore } from '@/store/authStore'

const API = 'http://localhost:8000'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
  redirect: vi.fn(),
}))

beforeEach(() => {
  act(() => useAuthStore.getState().clearAuth())
  act(() => useAuthStore.getState().setAccessToken('test-token'))
})

describe('useCurrentSubscription', () => {
  it('retorna subscription con plan', async () => {
    const { result } = renderHookWithProviders(() => useCurrentSubscription())
    await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 })
    expect(result.current.subscription?.plan).toBe('professional')
  })

  it('isLoading pasa a false', async () => {
    const { result } = renderHookWithProviders(() => useCurrentSubscription())
    await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 })
  })
})

describe('useCancelSubscription', () => {
  it('cancelación exitosa pone isSuccess en true', async () => {
    server.use(
      http.post(`${API}/api/v1/admin/subscriptions/cancel/`, () =>
        HttpResponse.json({ message: 'Cancelled successfully' }),
      ),
    )
    const { result } = renderHookWithProviders(() => useCancelSubscription())
    await act(async () => {
      result.current.mutate({ reason: 'Switching to another service' })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })
  })
})
