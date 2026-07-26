import type { TenantService } from '@/types/hub'

export interface SubscriptionSummary {
  plan: string
  plan_display: string
  status: 'active' | 'trial' | 'past_due' | 'cancelled'
  next_billing_date: string | null
  mrr: number
  /** Ya venía en la respuesta (mismo endpoint que useCurrentSubscription); faltaba declararlo. */
  billing_cycle: 'monthly' | 'annual'
  cancel_at_period_end: boolean
}

export interface SupportSummary {
  open_tickets: number
  in_attention: number
}

export interface ReferralSummary {
  active_referrals: number
  earned_credits: number
}

export interface DashboardSummary {
  subscription: SubscriptionSummary | null
  support: SupportSummary
  referrals: ReferralSummary | null
  isLoading: boolean
}

export type { TenantService }
