import { describe, it, expect } from 'vitest'
import {
  AMOUNT_DECIMALS,
  convertUsd,
  formatMoney,
  formatUsd,
  isCurrency,
  parseRate,
} from '../currency'

describe('isCurrency', () => {
  it('acepta las monedas soportadas', () => {
    expect(isCurrency('USD')).toBe(true)
    expect(isCurrency('PEN')).toBe(true)
  })

  it('rechaza cualquier otra cosa, para que un localStorage manipulado no rompa nada', () => {
    expect(isCurrency('EUR')).toBe(false)
    expect(isCurrency('')).toBe(false)
    expect(isCurrency(null)).toBe(false)
    expect(isCurrency(undefined)).toBe(false)
  })
})

describe('parseRate', () => {
  it('convierte el string de 4 decimales que emite el backend', () => {
    expect(parseRate('3.7500')).toBe(3.75)
    expect(parseRate(3.9)).toBe(3.9)
  })

  it('devuelve null ante ausencia de valor, en vez de un default', () => {
    expect(parseRate(null)).toBeNull()
    expect(parseRate(undefined)).toBeNull()
    expect(parseRate('')).toBeNull()
  })

  it('devuelve null ante basura o valores no utilizables', () => {
    expect(parseRate('abc')).toBeNull()
    expect(parseRate('0')).toBeNull()
    expect(parseRate('0.0000')).toBeNull()
    expect(parseRate('-3.75')).toBeNull()
    expect(parseRate(NaN)).toBeNull()
  })
})

describe('convertUsd', () => {
  it('multiplica por la tasa', () => {
    expect(convertUsd(79, 3.75)).toBe(296.25)
    expect(convertUsd(0, 3.75)).toBe(0)
  })

  it('devuelve null sin tasa o con un importe no numérico', () => {
    expect(convertUsd(79, null)).toBeNull()
    expect(convertUsd(NaN, 3.75)).toBeNull()
  })
})

describe('formatMoney', () => {
  it('formatea precios de catálogo sin decimales', () => {
    expect(formatMoney(79, 'USD')).toBe('$79')
    expect(formatMoney(296.25, 'PEN')).toBe('S/ 296')
  })

  it('formatea importes a pagar con 2 decimales', () => {
    expect(formatMoney(854, 'USD', AMOUNT_DECIMALS)).toBe('$854.00')
    expect(formatMoney(296.25, 'PEN', AMOUNT_DECIMALS)).toBe('S/ 296.25')
  })

  it('agrupa los miles', () => {
    // Cambio visible respecto al `$2149` que se concatenaba a mano antes.
    expect(formatMoney(2149, 'USD')).toBe('$2,149')
    expect(formatMoney(3202.5, 'PEN', AMOUNT_DECIMALS)).toBe('S/ 3,202.50')
  })

  it('normaliza el espacio duro que mete Intl entre el símbolo y el número', () => {
    expect(formatMoney(296, 'PEN')).not.toContain('\u00A0')
  })

  it('redondea half-up', () => {
    expect(formatMoney(296.5, 'PEN')).toBe('S/ 297')
    expect(formatMoney(296.4, 'PEN')).toBe('S/ 296')
  })
})

describe('formatUsd', () => {
  it('en la moneda base ignora la tasa: funciona incluso sin ella', () => {
    expect(formatUsd(79, 'USD', null)).toBe('$79')
  })

  it('convierte a soles con la tasa vigente', () => {
    expect(formatUsd(79, 'PEN', 3.75)).toBe('S/ 296')
    expect(formatUsd(19, 'PEN', 3.75)).toBe('S/ 71')
    expect(formatUsd(79, 'PEN', 3.9)).toBe('S/ 308')
  })

  it('devuelve null si se piden soles sin tasa, para que el llamador decida', () => {
    // Nunca un `?? 3.75`: pintaría un precio inventado con total confianza.
    expect(formatUsd(79, 'PEN', null)).toBeNull()
  })

  it('respeta los decimales del importe a pagar', () => {
    expect(formatUsd(79, 'PEN', 3.75, AMOUNT_DECIMALS)).toBe('S/ 296.25')
  })
})
