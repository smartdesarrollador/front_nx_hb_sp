import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
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

  it('lee el envelope { notifications } del backend', async () => {
    // Regresión: el hook leía `res.data.results`, clave que este endpoint no devuelve,
    // así que la bandeja salía SIEMPRE vacía en la app real. El handler MSW devolvía un
    // array pelado y el test pasaba por la otra rama, ocultando el fallo.
    const { result } = renderHookWithProviders(() => useHubNotifications())
    await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 })
    expect(result.current.notifications[0]).toMatchObject({ id: 'n1', read: false })
    expect(result.current.unreadCount).toBe(1)
  })

  it('tolera un array pelado y un envelope paginado de DRF', async () => {
    for (const payload of [
      [{ id: 'n9', title: 'x', message: '', category: 'system', read: false, created_at: '2026-03-01T00:00:00Z' }],
      { results: [{ id: 'n9', title: 'x', message: '', category: 'system', read: false, created_at: '2026-03-01T00:00:00Z' }] },
    ]) {
      server.use(
        http.get('http://localhost:8000/api/v1/app/notifications/', () =>
          HttpResponse.json(payload),
        ),
      )
      const { result } = renderHookWithProviders(() => useHubNotifications())
      await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 })
      expect(result.current.notifications).toHaveLength(1)
    }
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
