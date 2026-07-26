import { http, HttpResponse } from 'msw'

const API = 'http://localhost:8000'

export const currencyHandlers = [
  http.get(`${API}/api/v1/public/currency/`, () =>
    HttpResponse.json({
      base_currency: 'USD',
      supported_currencies: ['USD', 'PEN'],
      rates: { USD: '1.0000', PEN: '3.7500' },
      default_display_currency: 'USD',
      updated_at: '2026-07-01T00:00:00Z',
    }),
  ),
]
