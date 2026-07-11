import type { PlanType } from './types'

// Orden de tiers de plan — no es contenido de plan (precio/features), solo el orden
// relativo para decidir si un cambio es upgrade. El contenido real viene de usePlans()
// (/public/plans/, editable desde "Gestión de Planes" en el Admin).
const PLAN_ORDER: PlanType[] = ['free', 'starter', 'professional', 'enterprise']

export function isUpgrade(current: PlanType, target: PlanType): boolean {
  return PLAN_ORDER.indexOf(target) > PLAN_ORDER.indexOf(current)
}
