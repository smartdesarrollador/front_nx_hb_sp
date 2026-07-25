import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LandingPageClient from '@/features/landing/LandingPageClient'
import type { PlanData } from '@/features/subscription/types'

const push = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace: vi.fn(), back: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

// Devuelve la clave + args: permite afirmar QUÉ texto se eligió (p. ej. proCta vs
// proTrialCta) sin depender de la traducción concreta.
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) =>
      opts ? `${key}:${Object.values(opts).join(',')}` : key,
  }),
}))

vi.mock('@/store/authStore', () => ({
  useAuthStore: (selector: (s: { isAuthenticated: boolean }) => unknown) =>
    selector({ isAuthenticated: false }),
}))

vi.mock('@/features/desktop/hooks/useLatestReleases', () => ({
  // Array: el componente hace releases.find() por plataforma.
  useLatestReleases: () => ({ releases: [], isLoading: false }),
}))

vi.mock('@/features/desktop/components/PlatformDownloadCard', () => ({
  PlatformDownloadCard: () => <div />,
}))

vi.mock('@/components/shared/LandingNavbar', () => ({ default: () => <nav /> }))
vi.mock('@/components/shared/LandingFooter', () => ({ default: () => <footer /> }))
vi.mock('@/features/contact/ContactSection', () => ({ default: () => <section /> }))

let mockPlans: PlanData[] = []
vi.mock('@/features/subscription/hooks/usePlans', () => ({
  usePlans: () => ({ plans: mockPlans, isLoading: false }),
}))

function plan(id: PlanData['id'], priceMonthly: number, priceAnnual: number, popular = false): PlanData {
  return {
    id,
    displayName: id,
    priceMonthly,
    priceAnnual,
    description: `desc-${id}`,
    popular,
    features: [{ label: `feat-${id}`, included: true }],
  }
}

const DEFAULT_PLANS = [
  plan('free', 0, 0),
  plan('starter', 19, 205),
  plan('professional', 79, 854, true),
  plan('enterprise', 199, 2149),
]

function toggleAnnual() {
  fireEvent.click(screen.getByRole('button', { name: /billingAnnual/ }))
}

function ctaFor(planId: string) {
  // Cada tarjeta contiene su descripción; el CTA es su último botón.
  const card = screen.getByText(`desc-${planId}`).closest('div[class*="rounded-2xl"]')
  const buttons = card?.querySelectorAll('button')
  return buttons?.[buttons.length - 1] as HTMLButtonElement
}

beforeEach(() => {
  vi.clearAllMocks()
  mockPlans = DEFAULT_PLANS
  global.fetch = vi.fn().mockResolvedValue({ ok: false, json: async () => [] }) as unknown as typeof fetch
})

describe('LandingPageClient — toggle de ciclo', () => {
  it('muestra el toggle con el descuento máximo disponible', () => {
    render(<LandingPageClient />)
    expect(screen.getByRole('button', { name: /billingMonthly/ })).toBeInTheDocument()
    // starter 19→205 y professional 79→854 dan 10%
    expect(screen.getByRole('button', { name: /billingAnnual/ })).toHaveTextContent(
      'billingAnnualDiscount:10',
    )
  })

  it('se oculta si ningún plan tiene ahorro anual', () => {
    mockPlans = [plan('free', 0, 0), plan('starter', 20, 240)] // 240 = 12 × 20 → sin ahorro
    render(<LandingPageClient />)
    expect(screen.queryByRole('button', { name: /billingMonthly/ })).not.toBeInTheDocument()
  })

  it('en anual muestra el total del año y el ahorro por plan', async () => {
    render(<LandingPageClient />)

    toggleAnnual()

    await waitFor(() => {
      expect(screen.getByText(/billedAnnually:205/)).toBeInTheDocument()
    })
    expect(screen.getByText(/billedAnnually:854/)).toBeInTheDocument()
    // Lookahead: sin él, /annualSaving:23/ también casaría con el 239 de enterprise.
    expect(screen.getByText(/annualSaving:23(?!\d)/)).toBeInTheDocument()   // 228 − 205
    expect(screen.getByText(/annualSaving:94(?!\d)/)).toBeInTheDocument()   // 948 − 854
    expect(screen.getByText(/annualSaving:239/)).toBeInTheDocument()        // 2388 − 2149
  })

  it('Free no muestra precio anual (no lo tiene)', () => {
    render(<LandingPageClient />)
    toggleAnnual()
    expect(screen.queryByText(/billedAnnually:0/)).not.toBeInTheDocument()
  })
})

describe('LandingPageClient — CTAs propagan el ciclo', () => {
  it('en mensual, Professional ofrece el trial', () => {
    render(<LandingPageClient />)

    expect(ctaFor('professional')).toHaveTextContent('proTrialCta')
    fireEvent.click(ctaFor('professional'))

    expect(push).toHaveBeenCalledWith('/register?plan=professional&trial=true')
  })

  it('en anual, Professional pasa a contratación normal con el ciclo', () => {
    render(<LandingPageClient />)
    toggleAnnual()

    expect(ctaFor('professional')).toHaveTextContent('proCta')
    fireEvent.click(ctaFor('professional'))

    // Sin trial: elegir anual y caer en un trial ignoraría la elección.
    expect(push).toHaveBeenCalledWith('/register?plan=professional&cycle=annual')
  })

  it('en anual, el resto de planes de pago llevan cycle=annual', () => {
    render(<LandingPageClient />)
    toggleAnnual()

    fireEvent.click(ctaFor('starter'))
    expect(push).toHaveBeenCalledWith('/register?plan=starter&cycle=annual')

    fireEvent.click(ctaFor('enterprise'))
    expect(push).toHaveBeenCalledWith('/register?plan=enterprise&cycle=annual')
  })

  it('Free nunca lleva ciclo', () => {
    render(<LandingPageClient />)
    toggleAnnual()

    fireEvent.click(ctaFor('free'))

    expect(push).toHaveBeenCalledWith('/register?plan=free')
  })

  it('en mensual, los planes de pago no llevan ciclo', () => {
    render(<LandingPageClient />)

    fireEvent.click(ctaFor('starter'))

    expect(push).toHaveBeenCalledWith('/register?plan=starter')
  })
})
