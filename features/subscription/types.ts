export type PlanType = 'free' | 'starter' | 'professional' | 'enterprise'
export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'incomplete'
  | 'unpaid'
  | 'pending_payment'
export type BillingCycle = 'monthly' | 'annual'

/**
 * Estado de vencimiento derivado en el backend (no persistido) — la lógica de fechas
 * vive en apps/subscriptions/services.py::get_renewal_state para que el Hub y el
 * endpoint de pago compartan un único criterio. Ver ADR-008.
 */
export type RenewalState = 'active' | 'expiring_soon' | 'grace' | 'expired'

export interface SubscriptionUsage {
  users: { current: number; limit: number | null }
  storage: { current_gb: number; limit_gb: number | null }
  services: { current: number; limit: number | null }
}

export interface CurrentSubscription {
  id: string
  plan: PlanType
  plan_display: string
  status: SubscriptionStatus
  billing_cycle: BillingCycle
  cancel_at_period_end: boolean
  trial_end: string | null
  current_period_end: string | null
  grace_until: string | null
  renewal_state: RenewalState
  /** Negativo si el período ya venció; null si no hay período. */
  days_until_expiry: number | null
  /** El backend aceptaría hoy un pago del plan actual (ventana de 15 días o gracia). */
  is_renewable: boolean
  /** Hay un comprobante esperando revisión: el pago se deshabilita (evita el 409). */
  has_pending_proof: boolean
  mrr: number
  usage: SubscriptionUsage
  professional_trial_used?: boolean
}

export interface PlanFeature {
  label: string
  included: boolean
}

export interface PlanData {
  id: PlanType
  displayName: string
  priceMonthly: number
  priceAnnual: number
  description: string
  popular: boolean
  features: PlanFeature[]
}
