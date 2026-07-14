import { describe, it, expect, beforeEach, vi } from 'vitest'
import { waitFor } from '@testing-library/react'
import { renderHookWithProviders } from '@/test/utils'
import { useDesktopHandoff } from '@/features/auth/hooks/useDesktopHandoff'
import { useAuthStore } from '@/store/authStore'

const mockReplace = vi.fn()
const mockSearchParamsFn = vi.fn(() => new URLSearchParams())

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: mockReplace, back: vi.fn() }),
  useSearchParams: () => mockSearchParamsFn(),
  usePathname: () => '/',
  redirect: vi.fn(),
}))

function clearCookies() {
  document.cookie.split(';').forEach((c) => {
    const name = c.split('=')[0].trim()
    if (name) document.cookie = `${name}=; path=/; max-age=0`
  })
}

beforeEach(() => {
  mockReplace.mockClear()
  mockSearchParamsFn.mockImplementation(() => new URLSearchParams())
  useAuthStore.getState().clearAuth()
  localStorage.clear()
  clearCookies()
})

describe('useDesktopHandoff', () => {
  it('sin ?source=desktop no hace nada', async () => {
    const { result } = renderHookWithProviders(() => useDesktopHandoff())
    await waitFor(() => expect(result.current.status).toBe('none'))
    expect(mockReplace).not.toHaveBeenCalled()
  })

  it('con ?source=desktop&state pero sin sesión válida, redirige a /login preservando el state', async () => {
    document.cookie = 'hub-refreshToken=stale; path=/'
    mockSearchParamsFn.mockImplementation(() => new URLSearchParams('source=desktop&state=abc'))

    const { result } = renderHookWithProviders(() => useDesktopHandoff())

    await waitFor(() => expect(result.current.status).toBe('redirecting-login'), { timeout: 5000 })
    expect(mockReplace).toHaveBeenCalledWith('/login?source=desktop&state=abc')
    // defensive cleanup: guarantees no bounce loop with middleware
    expect(document.cookie).not.toContain('hub-refreshToken=stale')
  })

  it('con ?source=desktop&state y sesión ya activa, construye el deep link y limpia la URL', async () => {
    localStorage.setItem('hub-refreshToken', 'valid-refresh-token')
    localStorage.setItem(
      'hub-authUser',
      JSON.stringify({ id: 'u1', email: 'user@acme.com', name: 'Test User' }),
    )
    localStorage.setItem(
      'hub-authTenant',
      JSON.stringify({ id: 't1', name: 'Acme Corp', slug: 'acme' }),
    )
    mockSearchParamsFn.mockImplementation(() => new URLSearchParams('source=desktop&state=abc'))

    const { result } = renderHookWithProviders(() => useDesktopHandoff())

    await waitFor(() => expect(result.current.status).toBe('redirecting-desktop'), { timeout: 5000 })
    expect(result.current.deepLinkUrl).toMatch(/^rbacdesktop:\/\/auth\?payload=.*&state=abc$/)
    expect(mockReplace).toHaveBeenCalledWith('/dashboard')
    expect(mockReplace).toHaveBeenCalledTimes(1)
  })
})
