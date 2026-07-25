import type { PlanData, PlanType } from './types'

// Orden de tiers de plan — no es contenido de plan (precio/features), solo el orden
// relativo para decidir si un cambio es upgrade. El contenido real viene de usePlans()
// (/public/plans/, editable desde "Gestión de Planes" en el Admin).
export const PLAN_ORDER: PlanType[] = ['free', 'starter', 'professional', 'enterprise']

export const MONTHS_PER_YEAR = 12

export function isUpgrade(current: PlanType, target: PlanType): boolean {
  return PLAN_ORDER.indexOf(target) > PLAN_ORDER.indexOf(current)
}

// OJO: `annualSavings` / `annualDiscountPercent` tienen un gemelo en el Admin
// (`apps/frontend_admin/src/features/plans/annual-pricing.ts`), que usa la misma fórmula
// para avisar al admin de lo que está configurando. Son apps independientes (cada una con
// su Docker, sin paquete compartido): si cambias la fórmula aquí, cámbiala allí.

/**
 * Ahorro en USD de pagar el año completo frente a 12 mensualidades. Puede ser negativo
 * si el precio anual está mal configurado (pasa: los precios los edita un admin y el
 * anual se olvida — ver el guardarraíl `price_annual <= 12 * price_monthly` del backend).
 */
export function annualSavings(plan: Pick<PlanData, 'priceMonthly' | 'priceAnnual'>): number {
  return plan.priceMonthly * MONTHS_PER_YEAR - plan.priceAnnual
}

/**
 * Descuento anual del plan en % entero, o `null` si no hay ahorro real que anunciar
 * (sin precio anual, sin descuento, o anual más caro que el mensual). Devolver `null`
 * en vez de 0 obliga al llamador a decidir qué mostrar cuando no hay nada que ofrecer.
 */
export function annualDiscountPercent(
  plan: Pick<PlanData, 'priceMonthly' | 'priceAnnual'>,
): number | null {
  if (plan.priceMonthly <= 0 || plan.priceAnnual <= 0) return null
  const savings = annualSavings(plan)
  if (savings <= 0) return null
  return Math.round((savings / (plan.priceMonthly * MONTHS_PER_YEAR)) * 100)
}

/** Mayor descuento anual entre los planes, para el badge global del toggle. */
export function maxAnnualDiscount(plans: PlanData[]): number | null {
  const discounts = plans
    .map(annualDiscountPercent)
    .filter((d): d is number => d !== null)
  return discounts.length > 0 ? Math.max(...discounts) : null
}
