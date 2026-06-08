import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act, waitFor } from '@testing-library/react'
import { renderHookWithProviders } from '@/test/utils'
import { useServiceCatalog } from '@/features/services/hooks/useServiceCatalog'
import { useActiveServices } from '@/features/dashboard/hooks/useActiveServices'
import { useSSO } from '@/features/services/hooks/useSSO'
import { useAuthStore } from '@/store/authStore'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
  redirect: vi.fn(),
}))

beforeEach(() => {
  act(() => useAuthStore.getState().clearAuth())
  act(() => useAuthStore.getState().setAccessToken('test-token'))
  // Mock window.location.href para useSSO
  Object.defineProperty(window, 'location', {
    writable: true,
    value: { href: '', assign: vi.fn() },
  })
})

describe('useServiceCatalog', () => {
  it('retorna el catálogo de servicios disponibles', async () => {
    const { result } = renderHookWithProviders(() => useServiceCatalog())
    await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 })
    expect(Array.isArray(result.current.catalog)).toBe(true)
    expect(result.current.catalog.length).toBeGreaterThan(0)
  })

  it('el servicio tiene name y slug', async () => {
    const { result } = renderHookWithProviders(() => useServiceCatalog())
    await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 })
    const svc = result.current.catalog[0]
    expect(svc).toHaveProperty('name')
    expect(svc).toHaveProperty('slug')
  })
})

describe('useActiveServices (services feature)', () => {
  it('retorna lista de servicios activos', async () => {
    const { result } = renderHookWithProviders(() => useActiveServices())
    await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 })
    expect(result.current.services.length).toBeGreaterThan(0)
  })
})

describe('useSSO', () => {
  it('mutation de SSO existe y está en estado idle', () => {
    const { result } = renderHookWithProviders(() => useSSO())
    expect(result.current.isPending).toBe(false)
    expect(result.current.isIdle).toBe(true)
  })
})
