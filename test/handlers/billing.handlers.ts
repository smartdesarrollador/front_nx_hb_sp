import { http, HttpResponse } from 'msw'

const API = 'http://localhost:8000'

const mockPaymentMethod = {
  id: 'pm1',
  brand: 'visa',
  last4: '4242',
  exp_month: 12,
  exp_year: 2027,
  is_default: true,
  card_type: 'credit',
}

const mockInvoice = {
  id: 'inv1',
  number: 'INV-001',
  amount: 79,
  currency: 'usd',
  exchange_rate: '3.7500',
  amount_pen: 296.25,
  status: 'paid',
  created_at: '2026-03-01T00:00:00Z',
  period_start: '2026-03-01T00:00:00Z',
  period_end: '2026-04-01T00:00:00Z',
  pdf_url: 'https://example.com/invoice.pdf',
}

export const billingHandlers = [
  http.get(`${API}/api/v1/admin/billing/payment-methods`, () =>
    HttpResponse.json([mockPaymentMethod]),
  ),

  http.post(`${API}/api/v1/admin/billing/payment-methods`, () =>
    HttpResponse.json(mockPaymentMethod, { status: 201 }),
  ),

  http.patch(`${API}/api/v1/admin/billing/payment-methods/:id`, () =>
    HttpResponse.json(mockPaymentMethod),
  ),

  http.delete(`${API}/api/v1/admin/billing/payment-methods/:id`, () =>
    new HttpResponse(null, { status: 204 }),
  ),

  http.get(`${API}/api/v1/admin/billing/invoices`, () =>
    HttpResponse.json({ invoices: [mockInvoice] }),
  ),
]
