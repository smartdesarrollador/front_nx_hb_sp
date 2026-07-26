import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CurrentPlanCard from '@/features/subscription/components/CurrentPlanCard'
import type { CurrentSubscription, RenewalState } from '@/features/subscription/types'

// El hook real usa TanStack Query y estos tests montan sin QueryClientProvider.
// Mockearlo explícitamente además evita que MSW deje pasar la petición en silencio
// (onUnhandledRequest: 'bypass') y el test acabe pasando por la razón equivocada.
vi.mock('@/hooks/useCurrencyConfig', () => ({
  useCurrencyConfig: () => ({
    penRate: 3.75,
    defaultCurrency: 'USD',
    isLoading: false,
    isError: false,
  }),
}))


function makeSubscription(overrides: Partial<CurrentSubscription> = {}): CurrentSubscription {
  return {
    id: 'sub-1',
    plan: 'professional',
    plan_display: 'Professional',
    status: 'active',
    billing_cycle: 'monthly',
    cancel_at_period_end: false,
    trial_end: null,
    current_period_end: '2026-08-24T00:00:00Z',
    grace_until: null,
    renewal_state: 'active',
    days_until_expiry: 30,
    is_renewable: false,
    has_pending_proof: false,
    pending_plan: null,
    mrr: 79,
    usage: {
      users: { current: 1, limit: 25 },
      storage: { current_gb: 0, limit_gb: 20 },
      services: { current: 3, limit: null },
    },
    ...overrides,
  }
}

function renderCard(overrides: Partial<CurrentSubscription> = {}, props = {}) {
  const onRenew = vi.fn()
  const onChangePlan = vi.fn()
  const onCancelRequest = vi.fn()
  const onCompletePayment = vi.fn()
  render(
    <CurrentPlanCard
      subscription={makeSubscription(overrides)}
      isLoading={false}
      canUpgradePlan
      onChangePlan={onChangePlan}
      onRenew={onRenew}
      onCompletePayment={onCompletePayment}
      onCancelRequest={onCancelRequest}
      {...props}
    />,
  )
  return { onRenew, onChangePlan, onCancelRequest, onCompletePayment }
}

describe('CurrentPlanCard — semáforo de vencimiento', () => {
  beforeEach(() => vi.clearAllMocks())

  it('en active no ofrece renovar', () => {
    renderCard()
    expect(screen.getByRole('button', { name: 'Cambiar plan' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Renovar plan' })).not.toBeInTheDocument()
    expect(screen.getByText('Próxima renovación')).toBeInTheDocument()
  })

  it('en expiring_soon avisa los días restantes y ofrece renovar', () => {
    const { onRenew } = renderCard({ renewal_state: 'expiring_soon', days_until_expiry: 8, is_renewable: true })

    expect(screen.getByRole('status')).toHaveTextContent('Tu plan vence en 8 días')
    fireEvent.click(screen.getByRole('button', { name: 'Renovar plan' }))
    expect(onRenew).toHaveBeenCalledOnce()
  })

  it('usa singular cuando queda un día', () => {
    renderCard({ renewal_state: 'expiring_soon', days_until_expiry: 1, is_renewable: true })
    expect(screen.getByRole('status')).toHaveTextContent('vence en 1 día')
  })

  it('en grace muestra la fecha límite de acceso', () => {
    renderCard({
      renewal_state: 'grace',
      status: 'past_due',
      days_until_expiry: -2,
      grace_until: '2026-07-31T00:00:00Z',
      is_renewable: true,
    })

    expect(screen.getByRole('status')).toHaveTextContent('para renovar sin perder acceso')
    expect(screen.getByText('Acceso hasta')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Renovar plan' })).toBeInTheDocument()
  })

  it('en expired ofrece reactivar y usa el flujo de cambio de plan', () => {
    const { onRenew, onChangePlan } = renderCard({
      plan: 'free',
      plan_display: 'Free',
      renewal_state: 'expired',
      days_until_expiry: -20,
      is_renewable: false,
    })

    expect(screen.getByRole('status')).toHaveTextContent('volvió a Free')
    fireEvent.click(screen.getByRole('button', { name: 'Reactivar plan' }))
    expect(onChangePlan).toHaveBeenCalledOnce()
    expect(onRenew).not.toHaveBeenCalled()
  })
})

describe('CurrentPlanCard — comprobante pendiente', () => {
  beforeEach(() => vi.clearAllMocks())

  it('tiene prioridad sobre el aviso de vencimiento y deshabilita el CTA', () => {
    const { onRenew } = renderCard({
      renewal_state: 'grace',
      status: 'past_due',
      grace_until: '2026-07-31T00:00:00Z',
      is_renewable: true,
      has_pending_proof: true,
    })

    // El texto aparece dos veces (banner y CTA deshabilitado): se comprueba cada uno
    // por su rol, no por texto suelto.
    expect(screen.getByRole('status')).toHaveTextContent('Comprobante en revisión')
    expect(screen.getByRole('status')).toHaveTextContent('Ya recibimos tu pago')
    expect(screen.queryByText(/para renovar sin perder acceso/)).not.toBeInTheDocument()

    const cta = screen.getByRole('button', { name: 'Comprobante en revisión' })
    expect(cta).toBeDisabled()
    fireEvent.click(cta)
    expect(onRenew).not.toHaveBeenCalled()
  })
})

describe('CurrentPlanCard — otros estados', () => {
  beforeEach(() => vi.clearAllMocks())

  it('muestra el aviso de cancelación y oculta el botón de cancelar', () => {
    renderCard({ cancel_at_period_end: true })
    expect(screen.getByText(/se cancelará el/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Cancelar suscripción' })).not.toBeInTheDocument()
  })

  it('etiqueta la facturación anual con /año', () => {
    renderCard({ billing_cycle: 'annual', mrr: 854 })
    expect(screen.getByText('Facturación anual')).toBeInTheDocument()
    expect(screen.getByText('$854.00/año')).toBeInTheDocument()
  })

  it('sin permiso de gestión no muestra CTAs', () => {
    renderCard({ renewal_state: 'expiring_soon', is_renewable: true }, { canUpgradePlan: false })
    expect(screen.queryByRole('button', { name: 'Renovar plan' })).not.toBeInTheDocument()
  })

  it('tolera un renewal_state desconocido cayendo a active', () => {
    renderCard({ renewal_state: 'wat' as RenewalState })
    expect(screen.getByRole('button', { name: 'Cambiar plan' })).toBeInTheDocument()
  })

  it('mantiene el banner de trial Professional', () => {
    renderCard({ status: 'trialing', trial_end: '2026-08-01T00:00:00Z' })
    expect(screen.getByText('Prueba Professional activa')).toBeInTheDocument()
  })
})

describe('CurrentPlanCard — registro con el pago a medias', () => {
  beforeEach(() => vi.clearAllMocks())

  // La cuenta existe en Free porque el registro no toca tenant.plan: sin este aviso el
  // cliente no tiene ninguna señal de qué contrató ni de que puede terminar de pagar.
  const abandoned = {
    plan: 'free' as const,
    plan_display: 'Free',
    status: 'pending_payment' as const,
    pending_plan: 'professional' as const,
    current_period_end: null,
    days_until_expiry: null,
  }

  it('avisa del plan que quedó sin pagar y ofrece completarlo', () => {
    const { onCompletePayment } = renderCard(abandoned)

    expect(screen.getByRole('status')).toHaveTextContent('activa tu plan Professional')
    fireEvent.click(screen.getByRole('button', { name: 'Completar pago' }))
    expect(onCompletePayment).toHaveBeenCalledWith('professional')
  })

  it('el badge dice "Pago pendiente", no "en revisión"', () => {
    // Nunca envió comprobante: leer "en revisión" le haría esperar una activación que
    // no iba a llegar.
    renderCard(abandoned)

    expect(screen.getByText('Pago pendiente')).toBeInTheDocument()
    expect(screen.queryByText('Pago en revisión')).not.toBeInTheDocument()
  })

  it('con un comprobante ya enviado manda el aviso de revisión', () => {
    renderCard({ ...abandoned, has_pending_proof: true })

    expect(screen.getByRole('status')).toHaveTextContent('Comprobante en revisión')
    expect(screen.queryByRole('button', { name: 'Completar pago' })).not.toBeInTheDocument()
    expect(screen.getByText('Pago en revisión')).toBeInTheDocument()
  })

  it('sin permiso de facturación se informa pero no se ofrece pagar', () => {
    renderCard(abandoned, { canUpgradePlan: false })

    expect(screen.getByRole('status')).toHaveTextContent('activa tu plan Professional')
    expect(screen.queryByRole('button', { name: 'Completar pago' })).not.toBeInTheDocument()
  })

  it('una suscripción normal no muestra nada de esto', () => {
    renderCard()

    expect(screen.queryByText(/activa tu plan/)).not.toBeInTheDocument()
  })
})
