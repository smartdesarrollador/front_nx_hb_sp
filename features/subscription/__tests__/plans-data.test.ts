import { describe, it, expect } from 'vitest'
import {
  annualDiscountPercent,
  annualSavings,
  isUpgrade,
  maxAnnualDiscount,
} from '@/features/subscription/plans-data'
import type { PlanData, PlanType } from '@/features/subscription/types'

function plan(id: PlanType, priceMonthly: number, priceAnnual: number): PlanData {
  return {
    id,
    displayName: id,
    priceMonthly,
    priceAnnual,
    description: '',
    popular: false,
    features: [],
  }
}

describe('annualSavings', () => {
  it('devuelve el ahorro de pagar el año frente a 12 mensualidades', () => {
    expect(annualSavings(plan('professional', 79, 854))).toBe(94) // 948 - 854
  })

  it('es negativo cuando el anual está mal configurado', () => {
    // Caso real: se editó el mensual y el anual quedó con el valor del catálogo.
    expect(annualSavings(plan('starter', 19, 313))).toBe(-85) // 228 - 313
  })
})

describe('annualDiscountPercent', () => {
  it('calcula el descuento sobre 12 mensualidades', () => {
    expect(annualDiscountPercent(plan('professional', 79, 854))).toBe(10)
    expect(annualDiscountPercent(plan('enterprise', 199, 2149))).toBe(10)
  })

  it('devuelve null cuando el anual equivale a 12 meses (sin descuento)', () => {
    expect(annualDiscountPercent(plan('starter', 20, 240))).toBeNull()
  })

  it('devuelve null cuando el anual es MÁS caro que 12 meses', () => {
    // No se anuncia un descuento que no existe: es el bug que tenía el badge fijo.
    expect(annualDiscountPercent(plan('starter', 19, 313))).toBeNull()
  })

  it('devuelve null sin precio anual', () => {
    expect(annualDiscountPercent(plan('starter', 19, 0))).toBeNull()
  })

  it('devuelve null para el plan free', () => {
    expect(annualDiscountPercent(plan('free', 0, 0))).toBeNull()
  })

  it('redondea a entero', () => {
    expect(annualDiscountPercent(plan('starter', 19, 205))).toBe(10) // 228 -> 205 = 10.08%
  })
})

describe('maxAnnualDiscount', () => {
  it('devuelve el mayor descuento entre los planes', () => {
    const plans = [
      plan('free', 0, 0),
      plan('starter', 20, 240),      // sin descuento
      plan('professional', 79, 854), // 10%
      plan('enterprise', 100, 600),  // 50%
    ]
    expect(maxAnnualDiscount(plans)).toBe(50)
  })

  it('devuelve null si ningún plan tiene descuento', () => {
    expect(maxAnnualDiscount([plan('free', 0, 0), plan('starter', 19, 313)])).toBeNull()
  })

  it('devuelve null con lista vacía', () => {
    expect(maxAnnualDiscount([])).toBeNull()
  })
})

describe('isUpgrade', () => {
  it('solo es upgrade hacia un tier superior', () => {
    expect(isUpgrade('free', 'starter')).toBe(true)
    expect(isUpgrade('professional', 'enterprise')).toBe(true)
    expect(isUpgrade('professional', 'professional')).toBe(false)
    expect(isUpgrade('enterprise', 'starter')).toBe(false)
  })
})
