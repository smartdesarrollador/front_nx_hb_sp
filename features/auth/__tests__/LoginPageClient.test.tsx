import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { renderWithProviders } from '@/test/utils'
import LoginPageClient from '@/features/auth/LoginPageClient'
import { act } from 'react'
import { useAuthStore } from '@/store/authStore'

const API = 'http://localhost:8000'

const mockPush = vi.fn()
const mockSearchParamsFn = vi.fn(() => new URLSearchParams())

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn(), back: vi.fn() }),
  useSearchParams: () => mockSearchParamsFn(),
  usePathname: () => '/',
  redirect: vi.fn(),
}))

beforeEach(() => {
  mockPush.mockClear()
  mockSearchParamsFn.mockImplementation(() => new URLSearchParams())
  act(() => useAuthStore.getState().clearAuth())
  localStorage.clear()
})

describe('LoginPageClient', () => {
  it('renderiza el formulario con campos email y contraseña', () => {
    renderWithProviders(<LoginPageClient />)
    expect(screen.getByPlaceholderText('tu@empresa.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
  })

  it('muestra link ¿Olvidaste tu contraseña?', () => {
    renderWithProviders(<LoginPageClient />)
    expect(screen.getByRole('link', { name: /olvidaste tu contraseña/i })).toBeInTheDocument()
  })

  it('muestra mensaje de reset_success cuando ?reset_success=true', () => {
    mockSearchParamsFn.mockImplementation(() => new URLSearchParams('reset_success=true'))
    renderWithProviders(<LoginPageClient />)
    expect(screen.getByText(/contraseña restablecida correctamente/i)).toBeInTheDocument()
  })

  it('muestra banner de desktop cuando ?source=desktop', () => {
    mockSearchParamsFn.mockImplementation(() => new URLSearchParams('source=desktop&state=abc'))
    renderWithProviders(<LoginPageClient />)
    expect(screen.getByText(/iniciando sesión desde tu app de escritorio/i)).toBeInTheDocument()
  })

  it('muestra error de credenciales inválidas tras submit fallido', async () => {
    server.use(
      http.post(`${API}/api/v1/auth/login`, () =>
        HttpResponse.json({ non_field_errors: ['Invalid credentials'] }, { status: 401 }),
      ),
    )
    renderWithProviders(<LoginPageClient />)
    await userEvent.type(screen.getByPlaceholderText('tu@empresa.com'), 'bad@acme.com')
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'wrongpass')
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))
    await waitFor(
      () => expect(screen.getByText(/credenciales inválidas/i)).toBeInTheDocument(),
      { timeout: 5000 },
    )
  })

  it('muestra banner de email no verificado cuando respuesta tiene email_not_verified', async () => {
    server.use(
      http.post(`${API}/api/v1/auth/login`, () =>
        HttpResponse.json(
          { non_field_errors: ['email_not_verified'] },
          { status: 400 },
        ),
      ),
    )
    renderWithProviders(<LoginPageClient />)
    await userEvent.type(screen.getByPlaceholderText('tu@empresa.com'), 'user@acme.com')
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'pass123')
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))
    await waitFor(
      () => expect(screen.getByText(/debes verificar tu email/i)).toBeInTheDocument(),
      { timeout: 5000 },
    )
  })

  it('muestra formulario MFA cuando login retorna mfa_required', async () => {
    server.use(
      http.post(`${API}/api/v1/auth/login`, () =>
        HttpResponse.json({ mfa_required: true, mfa_token: 'tok-mfa' }),
      ),
    )
    renderWithProviders(<LoginPageClient />)
    await userEvent.type(screen.getByPlaceholderText('tu@empresa.com'), 'user@acme.com')
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'pass123')
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))
    await waitFor(
      () => expect(screen.getByText(/verificación mfa/i)).toBeInTheDocument(),
      { timeout: 5000 },
    )
  })

  it('login exitoso navega a /dashboard', async () => {
    renderWithProviders(<LoginPageClient />)
    await userEvent.type(screen.getByPlaceholderText('tu@empresa.com'), 'user@acme.com')
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'pass123')
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/dashboard'), { timeout: 5000 })
  })
})
