import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { renderHookWithProviders } from '@/test/utils'
import { usePaymentMethods } from '@/features/billing/hooks/usePaymentMethods'
import { useInvoices } from '@/features/billing/hooks/useInvoices'
import { useAuthStore } from '@/store/authStore'

const API = 'http://localhost:8000'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
  redirect: vi.fn(),
}))

// Override handlers para que coincidan con la forma esperada por los hooks
const paymentMethodFixture = {
  id: 'pm1', brand: 'visa', last4: '4242', exp_month: 12,
  exp_year: 2027, is_default: true, card_type: 'credit',
}
const invoiceFixture = {
  id: 'inv1', number: 'INV-001', amount: 79, currency: 'usd',
  status: 'paid', created_at: '2026-03-01T00:00:00Z', pdf_url: 'https://example.com/inv.pdf',
}

beforeEach(() => {
  act(() => useAuthStore.getState().clearAuth())
  act(() => useAuthStore.getState().setAccessToken('test-token'))
  server.use(
    http.get(`${API}/api/v1/admin/billing/payment-methods/`, () =>
      HttpResponse.json({ payment_methods: [paymentMethodFixture] }),
    ),
    http.get(`${API}/api/v1/admin/billing/invoices/`, () =>
      HttpResponse.json({ invoices: [invoiceFixture] }),
    ),
  )
})

describe('usePaymentMethods', () => {
  it('retorna lista de métodos de pago', async () => {
    const { result } = renderHookWithProviders(() => usePaymentMethods())
    await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 })
    expect(Array.isArray(result.current.methods)).toBe(true)
    expect(result.current.methods.length).toBeGreaterThan(0)
  })

  it('método de pago tiene brand y last4', async () => {
    const { result } = renderHookWithProviders(() => usePaymentMethods())
    await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 })
    const method = result.current.methods[0]
    expect(method).toHaveProperty('brand')
    expect(method).toHaveProperty('last4')
  })
})

describe('useInvoices', () => {
  it('retorna lista de facturas', async () => {
    const { result } = renderHookWithProviders(() => useInvoices())
    await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 })
    expect(Array.isArray(result.current.invoices)).toBe(true)
    expect(result.current.invoices.length).toBeGreaterThan(0)
  })

  it('isLoading pasa a false', async () => {
    const { result } = renderHookWithProviders(() => useInvoices())
    await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 })
  })
})
