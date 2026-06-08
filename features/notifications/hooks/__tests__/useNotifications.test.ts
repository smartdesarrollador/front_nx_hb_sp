import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act, waitFor } from '@testing-library/react'
import { renderHookWithProviders } from '@/test/utils'
import { useHubNotifications } from '@/features/notifications/hooks/useHubNotifications'
import { useMarkAsRead } from '@/features/notifications/hooks/useMarkAsRead'
import { useMarkAllAsRead } from '@/features/notifications/hooks/useMarkAllAsRead'
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
})

describe('useHubNotifications', () => {
  it('retorna lista de notificaciones', async () => {
    const { result } = renderHookWithProviders(() => useHubNotifications())
    await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 })
    expect(Array.isArray(result.current.notifications)).toBe(true)
    expect(result.current.notifications.length).toBeGreaterThan(0)
  })

  it('unreadCount cuenta las notificaciones no leídas', async () => {
    const { result } = renderHookWithProviders(() => useHubNotifications())
    await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 })
    expect(typeof result.current.unreadCount).toBe('number')
  })
})

describe('useMarkAsRead', () => {
  it('marcar como leída pone isSuccess en true', async () => {
    const { result } = renderHookWithProviders(() => useMarkAsRead())
    await act(async () => {
      result.current.mutate('n1')
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })
  })
})

describe('useMarkAllAsRead', () => {
  it('marcar todas como leídas pone isSuccess en true', async () => {
    const { result } = renderHookWithProviders(() => useMarkAllAsRead())
    await act(async () => {
      result.current.mutate()
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })
  })
})
