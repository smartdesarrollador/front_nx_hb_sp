import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { createTestQueryClient } from '@/test/utils'
import { AuthProvider, useAuthContext } from '@/features/auth/AuthContext'
import { useAuthStore } from '@/store/authStore'

const API = 'http://localhost:8000'

function TestConsumer({ action }: { action: 'login' | 'logout' | 'register' | 'loginMfa' | 'loginError' }) {
  const { login, logout, register, isLoading } = useAuthContext()
  const [result, setResult] = React.useState<string>('')
  const [error, setError] = React.useState<string>('')

  React.useEffect(() => {
    if (action === 'login') {
      login('user@acme.com', 'pass123')
        .then((r) => setResult(JSON.stringify(r)))
        .catch((e) => setError(String(e)))
    } else if (action === 'loginMfa') {
      login('mfa@acme.com', 'pass123')
        .then((r) => setResult(JSON.stringify(r)))
        .catch((e) => setError(String(e)))
    } else if (action === 'loginError') {
      login('bad@acme.com', 'wrong')
        .then((r) => setResult(JSON.stringify(r)))
        .catch(() => setError('login-failed'))
    } else if (action === 'logout') {
      logout().then(() => setResult('logged-out')).catch(() => setError('logout-failed'))
    } else if (action === 'register') {
      register({
        name: 'Nuevo Usuario',
        email: 'nuevo@acme.com',
        password: 'pass123',
        organization_name: 'Acme',
        plan: 'starter',
      }).then(() => setResult('registered')).catch(() => setError('register-failed'))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (isLoading) return <div>loading</div>
  if (error) return <div data-testid="error">{error}</div>
  if (result) return <div data-testid="result">{result}</div>
  return <div data-testid="idle">idle</div>
}

import React from 'react'

function renderWithQC(ui: React.ReactElement) {
  const qc = createTestQueryClient()
  return render(
    <QueryClientProvider client={qc}>
      <AuthProvider>{ui}</AuthProvider>
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  act(() => useAuthStore.getState().clearAuth())
  localStorage.clear()
})

describe('AuthContext', () => {
  it('login exitoso: retorna { ok: true } y actualiza el store', async () => {
    renderWithQC(<TestConsumer action="login" />)
    await waitFor(() => expect(screen.getByTestId('result')).toBeInTheDocument(), { timeout: 5000 })
    expect(screen.getByTestId('result').textContent).toContain('"ok":true')
    expect(useAuthStore.getState().user?.email).toBe('user@acme.com')
    expect(useAuthStore.getState().tenant?.name).toBe('Acme Corp')
  })

  it('login con MFA: retorna { mfaRequired: true, mfaToken }', async () => {
    server.use(
      http.post(`${API}/api/v1/auth/login`, () =>
        HttpResponse.json({ mfa_required: true, mfa_token: 'tok-mfa-123' }),
      ),
    )
    renderWithQC(<TestConsumer action="loginMfa" />)
    await waitFor(() => expect(screen.getByTestId('result')).toBeInTheDocument(), { timeout: 5000 })
    const r = JSON.parse(screen.getByTestId('result').textContent ?? '{}')
    expect(r.mfaRequired).toBe(true)
    expect(r.mfaToken).toBe('tok-mfa-123')
  })

  it('login fallido (401): lanza error', async () => {
    server.use(
      http.post(`${API}/api/v1/auth/login`, () =>
        HttpResponse.json({ non_field_errors: ['Invalid credentials'] }, { status: 401 }),
      ),
    )
    renderWithQC(<TestConsumer action="loginError" />)
    await waitFor(() => expect(screen.getByTestId('error')).toBeInTheDocument(), { timeout: 5000 })
    expect(screen.getByTestId('error').textContent).toBe('login-failed')
  })

  it('logout: llama al endpoint y limpia el store', async () => {
    act(() => {
      useAuthStore.getState().setUser({
        id: 'u1', email: 'user@acme.com', name: 'Test', firstName: 'Test', lastName: 'User',
        roles: ['Owner'], permissions: [], status: 'active', mfaEnabled: false, tenantId: 't1',
        lastLogin: null, createdAt: '2026-01-01T00:00:00Z',
      })
    })
    renderWithQC(<TestConsumer action="logout" />)
    await waitFor(() => expect(screen.getByTestId('result')).toBeInTheDocument(), { timeout: 5000 })
    expect(screen.getByTestId('result').textContent).toBe('logged-out')
    expect(useAuthStore.getState().user).toBeNull()
  })

  it('register: POST /auth/register y resuelve sin error', async () => {
    renderWithQC(<TestConsumer action="register" />)
    await waitFor(() => expect(screen.getByTestId('result')).toBeInTheDocument(), { timeout: 5000 })
    expect(screen.getByTestId('result').textContent).toBe('registered')
  })

  it('session restore sin token: isLoading pasa a false sin petición', async () => {
    function LoadingConsumer() {
      const { isLoading } = useAuthContext()
      return <div data-testid="loading">{String(isLoading)}</div>
    }
    renderWithQC(<LoadingConsumer />)
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'), { timeout: 3000 })
    expect(useAuthStore.getState().user).toBeNull()
  })

  it('session restore con token inválido: llama clearAuth', async () => {
    localStorage.setItem('hub-refreshToken', 'expired-token')
    localStorage.setItem('hub-authUser', JSON.stringify({ id: 'u1', email: 'old@acme.com' }))
    server.use(
      http.post(`${API}/api/v1/auth/refresh-token`, () =>
        HttpResponse.json({ detail: 'Token expired' }, { status: 401 }),
      ),
    )
    function LoadingConsumer() {
      const { isLoading } = useAuthContext()
      return <div data-testid="loading">{String(isLoading)}</div>
    }
    renderWithQC(<LoadingConsumer />)
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'), { timeout: 5000 })
    expect(useAuthStore.getState().user).toBeNull()
  })
})
