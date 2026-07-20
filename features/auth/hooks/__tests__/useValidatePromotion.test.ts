import { describe, it, expect } from 'vitest'
import { act, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { renderHookWithProviders } from '@/test/utils'
import { useValidatePromotion } from '@/features/auth/hooks/useValidatePromotion'

const API = 'http://localhost:8000'
const VALIDATE_URL = `${API}/api/v1/public/promotions/validate/`

describe('useValidatePromotion', () => {
  it('envía {code, plan} y recibe el desglose cuando el cupón es válido', async () => {
    let capturedBody: unknown
    server.use(
      http.post(VALIDATE_URL, async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json({
          valid: true,
          code: 'VERANO20',
          type: 'percentage',
          value: 20,
          original_price: 19,
          discount_amount: 3.8,
          final_price: 15.2,
          exchange_rate: '3.75',
          final_price_pen: 57,
        })
      }),
    )

    const { result } = renderHookWithProviders(() => useValidatePromotion())
    await act(async () => {
      result.current.mutate({ code: 'VERANO20', plan: 'starter' })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(capturedBody).toEqual({ code: 'VERANO20', plan: 'starter' })
    expect(result.current.data?.valid).toBe(true)
    expect(result.current.data?.final_price).toBe(15.2)
    expect(result.current.data?.final_price_pen).toBe(57)
  })

  it('un cupón inválido llega como valid:false con reason (respuesta 200)', async () => {
    server.use(
      http.post(VALIDATE_URL, () =>
        HttpResponse.json({ valid: false, reason: 'depleted' }),
      ),
    )

    const { result } = renderHookWithProviders(() => useValidatePromotion())
    await act(async () => {
      result.current.mutate({ code: 'AGOTADO', plan: 'starter' })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual({ valid: false, reason: 'depleted' })
  })
})
