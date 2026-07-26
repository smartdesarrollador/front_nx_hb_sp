import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useUiStore } from '@/store/uiStore'
import { useDisplayCurrency } from '../useDisplayCurrency'

const config = vi.hoisted(() => ({
  penRate: 3.75 as number | null,
  defaultCurrency: 'USD' as 'USD' | 'PEN' | null,
}))

vi.mock('../useCurrencyConfig', () => ({
  useCurrencyConfig: () => ({
    penRate: config.penRate,
    defaultCurrency: config.defaultCurrency,
    isLoading: false,
    isError: false,
  }),
}))

describe('useDisplayCurrency', () => {
  beforeEach(() => {
    config.penRate = 3.75
    config.defaultCurrency = 'USD'
    useUiStore.setState({ currency: null })
  })

  it('sin preferencia usa la moneda por defecto del backend', () => {
    const { result } = renderHook(() => useDisplayCurrency())

    expect(result.current.currency).toBe('USD')
    expect(result.current.isConverted).toBe(false)
    expect(result.current.catalog(79)).toBe('$79')
  })

  it('sin preferencia sigue el defecto aunque el backend diga PEN', () => {
    config.defaultCurrency = 'PEN'

    const { result } = renderHook(() => useDisplayCurrency())

    expect(result.current.currency).toBe('PEN')
    expect(result.current.catalog(79)).toBe('S/ 296')
  })

  it('la preferencia explícita gana sobre el defecto', () => {
    useUiStore.setState({ currency: 'PEN' })

    const { result } = renderHook(() => useDisplayCurrency())

    expect(result.current.currency).toBe('PEN')
    expect(result.current.isConverted).toBe(true)
  })

  it('cae a la moneda base si se pide PEN y no hay tasa utilizable', () => {
    // El caso que impide pintar un `S/ 0` o un `S/ NaN`: sin tasa se muestra la
    // moneda en la que realmente se cobra.
    useUiStore.setState({ currency: 'PEN' })
    config.penRate = null

    const { result } = renderHook(() => useDisplayCurrency())

    expect(result.current.currency).toBe('USD')
    expect(result.current.isConverted).toBe(false)
    expect(result.current.catalog(79)).toBe('$79')
  })

  it('distingue precio de catálogo e importe a pagar', () => {
    useUiStore.setState({ currency: 'PEN' })

    const { result } = renderHook(() => useDisplayCurrency())

    expect(result.current.catalog(79)).toBe('S/ 296')
    expect(result.current.amount(79)).toBe('S/ 296.25')
  })

  it('inCurrency fuerza la moneda aunque la preferencia sea otra', () => {
    // Contrato que usan los pasos de Yape: el sol es el importe exacto a transferir,
    // se muestre lo que se muestre en el resto del Hub.
    const { result } = renderHook(() => useDisplayCurrency())

    expect(result.current.currency).toBe('USD')
    expect(result.current.inCurrency(79, 'PEN', 2)).toBe('S/ 296.25')
  })

  it('inCurrency devuelve null sin tasa, para que el llamador avise', () => {
    config.penRate = null

    const { result } = renderHook(() => useDisplayCurrency())

    expect(result.current.inCurrency(79, 'PEN', 2)).toBeNull()
  })
})
