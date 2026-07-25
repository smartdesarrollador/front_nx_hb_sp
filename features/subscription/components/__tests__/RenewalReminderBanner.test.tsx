import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RenewalReminderBanner } from '@/features/subscription/components/RenewalReminderBanner'
import type { CurrentSubscription, RenewalState } from '@/features/subscription/types'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => {
      if (!opts) return key
      // Emula la pluralización de i18next (sufijos _one/_other) para poder afirmar
      // qué variante se elegiría con los `count` reales.
      const resolved =
        key === 'planExpiringSoon' && typeof opts.count === 'number'
          ? `${key}_${opts.count === 1 ? 'one' : 'other'}`
          : key
      const args = Object.entries(opts)
        .map(([k, v]) => `${k}=${String(v)}`)
        .join(',')
      return `${resolved}:${args}`
    },
  }),
}))

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

vi.mock('@/features/subscription/hooks/useCurrentSubscription', () => ({
  useCurrentSubscription: vi.fn(),
}))

import { useCurrentSubscription } from '@/features/subscription/hooks/useCurrentSubscription'

const mockHook = useCurrentSubscription as unknown as ReturnType<typeof vi.fn>

function mockSubscription(overrides: Partial<CurrentSubscription> = {}) {
  mockHook.mockReturnValue({
    subscription: {
      plan: 'professional',
      plan_display: 'Professional',
      renewal_state: 'active' as RenewalState,
      days_until_expiry: 30,
      grace_until: null,
      has_pending_proof: false,
      ...overrides,
    },
    isLoading: false,
  })
}

describe('RenewalReminderBanner — cuándo aparece', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
  })

  it('no se muestra con el plan vigente', () => {
    mockSubscription({ renewal_state: 'active' })
    const { container } = render(<RenewalReminderBanner />)
    expect(container).toBeEmptyDOMElement()
  })

  it('no se muestra sin datos de suscripción', () => {
    mockHook.mockReturnValue({ subscription: null, isLoading: false })
    const { container } = render(<RenewalReminderBanner />)
    expect(container).toBeEmptyDOMElement()
  })

  it('avisa cuando el plan está por vencer, con los días restantes', () => {
    mockSubscription({ renewal_state: 'expiring_soon', days_until_expiry: 7 })
    render(<RenewalReminderBanner />)
    expect(screen.getByRole('status')).toHaveTextContent('planExpiringSoon_other')
    expect(screen.getByRole('status')).toHaveTextContent('count=7')
    expect(screen.getByRole('link')).toHaveAttribute('href', '/subscription')
  })

  it('usa el singular cuando queda un día', () => {
    mockSubscription({ renewal_state: 'expiring_soon', days_until_expiry: 1 })
    render(<RenewalReminderBanner />)
    expect(screen.getByRole('status')).toHaveTextContent('planExpiringSoon_one')
  })

  it('en gracia muestra la fecha límite de acceso', () => {
    mockSubscription({
      renewal_state: 'grace',
      days_until_expiry: -2,
      grace_until: '2026-07-31T00:00:00Z',
    })
    render(<RenewalReminderBanner />)
    expect(screen.getByRole('status')).toHaveTextContent('planInGrace')
    expect(screen.getByRole('status')).toHaveTextContent('31 de julio de 2026')
  })

  it('tras expirar ofrece reactivar, sin nombrar el plan', () => {
    // Tras degradar, `plan_display` ya es "Free": interpolarlo daría el absurdo
    // "Tu plan Free venció" (detectado probando con una cuenta real).
    mockSubscription({ renewal_state: 'expired', plan_display: 'Free' })
    render(<RenewalReminderBanner />)
    expect(screen.getByRole('status')).toHaveTextContent('planExpired')
    expect(screen.getByRole('status')).not.toHaveTextContent('plan=Free')
    expect(screen.getByRole('link')).toHaveTextContent('planReactivateCta')
  })

  it('se calla si ya hay un comprobante en revisión', () => {
    // El cliente ya pagó: insistir sería incorrecto, y el pago daría 409.
    mockSubscription({ renewal_state: 'grace', has_pending_proof: true })
    const { container } = render(<RenewalReminderBanner />)
    expect(container).toBeEmptyDOMElement()
  })
})

describe('RenewalReminderBanner — descarte y escalado', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
  })

  it('se oculta al descartar y lo recuerda en la sesión', () => {
    mockSubscription({ renewal_state: 'expiring_soon', days_until_expiry: 5 })
    const { unmount } = render(<RenewalReminderBanner />)

    fireEvent.click(screen.getByRole('button', { name: 'close' }))
    expect(screen.queryByRole('status')).not.toBeInTheDocument()

    unmount()
    const { container } = render(<RenewalReminderBanner />)
    expect(container).toBeEmptyDOMElement()
  })

  it('reaparece cuando el estado escala de expiring_soon a grace', () => {
    sessionStorage.setItem('hub-renewal-banner-dismissed', 'expiring_soon')
    mockSubscription({ renewal_state: 'grace', grace_until: '2026-07-31T00:00:00Z' })

    render(<RenewalReminderBanner />)

    expect(screen.getByRole('status')).toHaveTextContent('planInGrace')
  })

  it('reaparece cuando escala de grace a expired', () => {
    sessionStorage.setItem('hub-renewal-banner-dismissed', 'grace')
    mockSubscription({ renewal_state: 'expired' })

    render(<RenewalReminderBanner />)

    expect(screen.getByRole('status')).toHaveTextContent('planExpired')
  })

  it('sigue oculto si el estado no escala', () => {
    sessionStorage.setItem('hub-renewal-banner-dismissed', 'expired')
    mockSubscription({ renewal_state: 'grace' })

    const { container } = render(<RenewalReminderBanner />)

    expect(container).toBeEmptyDOMElement()
  })
})
