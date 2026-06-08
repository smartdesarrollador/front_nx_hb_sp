import { describe, it, expect, beforeEach } from 'vitest'
import { act, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { renderHookWithProviders } from '@/test/utils'
import { useRegister } from '@/features/auth/hooks/useRegister'

const API = 'http://localhost:8000'

const validPayload = {
  name: 'Nuevo Usuario',
  email: 'nuevo@acme.com',
  password: 'SecurePass123',
  organization_name: 'Acme Corp',
  plan: 'starter',
}

beforeEach(() => {
  localStorage.clear()
})

describe('useRegister', () => {
  it('registro exitoso pone isSuccess en true', async () => {
    const { result } = renderHookWithProviders(() => useRegister())
    await act(async () => {
      result.current.mutate(validPayload)
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })
  })

  it('registro enviado con los campos correctos', async () => {
    let capturedBody: unknown
    server.use(
      http.post(`${API}/api/v1/auth/register`, async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json({ message: 'Registration successful' }, { status: 201 })
      }),
    )
    const { result } = renderHookWithProviders(() => useRegister())
    await act(async () => {
      result.current.mutate(validPayload)
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })
    expect(capturedBody).toMatchObject({
      email: 'nuevo@acme.com',
      organization_name: 'Acme Corp',
      plan: 'starter',
    })
  })

  it('error de servidor pone isError en true', async () => {
    server.use(
      http.post(`${API}/api/v1/auth/register`, () =>
        HttpResponse.json({ email: ['Email already exists'] }, { status: 400 }),
      ),
    )
    const { result } = renderHookWithProviders(() => useRegister())
    await act(async () => {
      result.current.mutate(validPayload)
    })
    await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 5000 })
  })
})
