import { describe, it, expect } from 'vitest'
import { waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { renderHookWithProviders } from '@/test/utils'
import { useCurrencyConfig } from '../useCurrencyConfig'

const CURRENCY_URL = 'http://localhost:8000/api/v1/public/currency/'

describe('useCurrencyConfig', () => {
  it('expone la tasa ya parseada y la moneda por defecto', async () => {
    const { result } = renderHookWithProviders(() => useCurrencyConfig())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.penRate).toBe(3.75)
    expect(result.current.defaultCurrency).toBe('USD')
  })

  it('no inventa una tasa cuando el backend falla', async () => {
    server.use(http.get(CURRENCY_URL, () => new HttpResponse(null, { status: 500 })))

    const { result } = renderHookWithProviders(() => useCurrencyConfig())

    await waitFor(() => expect(result.current.isError).toBe(true))
    // El fallback hardcodeado `?? '3.75'` que había en los pasos de Yape pintaba un
    // importe plausible y equivocado. Sin tasa, no hay tasa.
    expect(result.current.penRate).toBeNull()
    expect(result.current.defaultCurrency).toBeNull()
  })

  it('trata una tasa inválida del backend como ausencia de tasa', async () => {
    server.use(
      http.get(CURRENCY_URL, () =>
        HttpResponse.json({
          base_currency: 'USD',
          supported_currencies: ['USD', 'PEN'],
          rates: { USD: '1.0000', PEN: '0.0000' },
          default_display_currency: 'USD',
          updated_at: null,
        }),
      ),
    )

    const { result } = renderHookWithProviders(() => useCurrencyConfig())

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.penRate).toBeNull()
  })
})
