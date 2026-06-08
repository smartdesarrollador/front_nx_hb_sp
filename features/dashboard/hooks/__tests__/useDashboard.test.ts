import { describe, it, expect, beforeEach } from 'vitest'
import { act, waitFor } from '@testing-library/react'
import { renderHookWithProviders } from '@/test/utils'
import { useDashboardSummary } from '@/features/dashboard/hooks/useDashboardSummary'
import { useActiveServices } from '@/features/dashboard/hooks/useActiveServices'
import { useAuthStore } from '@/store/authStore'

beforeEach(() => {
  act(() => useAuthStore.getState().clearAuth())
  // Setear un token para que apiClient pase el interceptor sin problema
  act(() => useAuthStore.getState().setAccessToken('test-token'))
})

describe('useDashboardSummary', () => {
  it('isLoading pasa a false cuando todas las queries resuelven', async () => {
    const { result } = renderHookWithProviders(() => useDashboardSummary())
    await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 })
  })

  it('subscription.plan_display está presente', async () => {
    const { result } = renderHookWithProviders(() => useDashboardSummary())
    await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 })
    expect(result.current.subscription?.plan_display).toBeTruthy()
  })

  it('support.open_tickets es un número', async () => {
    const { result } = renderHookWithProviders(() => useDashboardSummary())
    await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 })
    expect(typeof result.current.support.open_tickets).toBe('number')
  })
})

describe('useActiveServices', () => {
  it('retorna lista de servicios activos', async () => {
    const { result } = renderHookWithProviders(() => useActiveServices())
    await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 })
    expect(Array.isArray(result.current.services)).toBe(true)
    expect(result.current.services.length).toBeGreaterThan(0)
  })

  it('isLoading pasa a false', async () => {
    const { result } = renderHookWithProviders(() => useActiveServices())
    await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 })
  })
})
