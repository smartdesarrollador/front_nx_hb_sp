import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { renderHookWithProviders } from '@/test/utils'
import { useLogin } from '@/features/auth/hooks/useLogin'
import { useAuthStore } from '@/store/authStore'

const API = 'http://localhost:8000'

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn(), back: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
  redirect: vi.fn(),
}))

beforeEach(() => {
  mockPush.mockClear()
  act(() => useAuthStore.getState().clearAuth())
  localStorage.clear()
})

describe('useLogin', () => {
  it('login exitoso navega a /dashboard', async () => {
    const { result } = renderHookWithProviders(() => useLogin())
    await act(async () => {
      result.current.mutate({ email: 'user@acme.com', password: 'pass123' })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })
    expect(mockPush).toHaveBeenCalledWith('/dashboard')
  })

  it('con skipNavigate: true NO navega tras éxito', async () => {
    const { result } = renderHookWithProviders(() => useLogin({ skipNavigate: true }))
    await act(async () => {
      result.current.mutate({ email: 'user@acme.com', password: 'pass123' })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('login con MFA retorna { mfaRequired: true }', async () => {
    server.use(
      http.post(`${API}/api/v1/auth/login`, () =>
        HttpResponse.json({ mfa_required: true, mfa_token: 'tok-mfa' }),
      ),
    )
    const { result } = renderHookWithProviders(() => useLogin())
    await act(async () => {
      result.current.mutate({ email: 'user@acme.com', password: 'pass123' })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })
    expect(result.current.data).toMatchObject({ mfaRequired: true })
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('login fallido pone isError en true', async () => {
    server.use(
      http.post(`${API}/api/v1/auth/login`, () =>
        HttpResponse.json({ non_field_errors: ['Invalid credentials'] }, { status: 401 }),
      ),
    )
    const { result } = renderHookWithProviders(() => useLogin())
    await act(async () => {
      result.current.mutate({ email: 'bad@acme.com', password: 'wrong' })
    })
    await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 5000 })
    expect(mockPush).not.toHaveBeenCalled()
  })
})
