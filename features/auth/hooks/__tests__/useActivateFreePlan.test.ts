import { describe, it, expect } from 'vitest'
import { act, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { renderHookWithProviders } from '@/test/utils'
import { useActivateFreePlan } from '@/features/auth/hooks/useActivateFreePlan'

const API = 'http://localhost:8000'
const ACTIVATE_URL = `${API}/api/v1/auth/yape-activate-free`

describe('useActivateFreePlan', () => {
  it('envía token, plan y cupón; recibe activated:true', async () => {
    let capturedBody: unknown
    server.use(
      http.post(ACTIVATE_URL, async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json({
          message: 'Plan activated with a 100% discount promo code.',
          activated: true,
        })
      }),
    )

    const { result } = renderHookWithProviders(() => useActivateFreePlan())
    await act(async () => {
      result.current.mutate({
        payment_upload_token: 'tok-789',
        plan: 'starter',
        promo_code: 'GRATIS100',
      })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(capturedBody).toEqual({
      payment_upload_token: 'tok-789',
      plan: 'starter',
      promo_code: 'GRATIS100',
    })
    expect(result.current.data?.activated).toBe(true)
  })

  it('un 400 (cupón no cubre el 100%) deja el error disponible', async () => {
    server.use(
      http.post(ACTIVATE_URL, () =>
        HttpResponse.json(
          { detail: 'El cupón no cubre el 100% del plan.', promo_reason: 'not_free' },
          { status: 400 },
        ),
      ),
    )

    const { result } = renderHookWithProviders(() => useActivateFreePlan())
    await act(async () => {
      result.current.mutate({
        payment_upload_token: 'tok-789',
        plan: 'starter',
        promo_code: 'SOLO50',
      })
    })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
