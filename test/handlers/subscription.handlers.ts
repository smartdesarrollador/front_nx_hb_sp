import { http, HttpResponse } from 'msw'

const API = 'http://localhost:8000'

const mockSubscription = {
  id: 'sub1',
  plan: 'professional',
  plan_display: 'Professional',
  status: 'active',
  billing_cycle: 'monthly',
  current_period_start: '2026-03-01T00:00:00Z',
  current_period_end: '2026-04-01T00:00:00Z',
  cancel_at_period_end: false,
  mrr: 79,
  trial_start: null,
  trial_end: null,
  created_at: '2026-01-01T00:00:00Z',
  // Campos derivados de CurrentSubscriptionSerializer. Estaban ausentes aquí y el mock
  // dejaba de parecerse a la respuesta real: un handler incompleto convierte los tests
  // en un falso guardarraíl (LL-106).
  grace_until: null,
  renewal_state: 'active',
  days_until_expiry: 30,
  is_renewable: false,
  has_pending_proof: false,
  pending_plan: null,
  usage: {
    users: { current: 5, limit: 25 },
    storage: { current_gb: 2, limit_gb: 20 },
    services: { current: 2, limit: null },
  },
}

export const subscriptionHandlers = [
  http.get(`${API}/api/v1/admin/subscriptions/current`, () =>
    HttpResponse.json({ subscription: mockSubscription }),
  ),

  http.post(`${API}/api/v1/admin/subscriptions/upgrade`, () =>
    HttpResponse.json({ message: 'Upgraded successfully' }),
  ),

  http.post(`${API}/api/v1/admin/subscriptions/cancel`, () =>
    HttpResponse.json({ message: 'Cancelled successfully' }),
  ),
]
