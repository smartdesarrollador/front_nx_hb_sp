import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useUiStore } from '@/store/uiStore'
import Price from '../Price'

const config = vi.hoisted(() => ({ penRate: 3.75 as number | null }))

vi.mock('@/hooks/useCurrencyConfig', () => ({
  useCurrencyConfig: () => ({
    penRate: config.penRate,
    defaultCurrency: 'USD',
    isLoading: false,
    isError: false,
  }),
}))

describe('Price', () => {
  beforeEach(() => {
    config.penRate = 3.75
    useUiStore.setState({ currency: null })
  })

  it('pinta un único nodo de texto, sin elemento envolvente', () => {
    // Si envolviera en un <span> rompería las clases de tipografía de las tarjetas
    // y el textContent que asertan los tests de la landing.
    const { container } = render(<Price usd={79} />)

    expect(container.innerHTML).toBe('$79')
  })

  it('usa la moneda elegida por el cliente', () => {
    useUiStore.setState({ currency: 'PEN' })

    render(<Price usd={79} />)

    expect(screen.getByText('S/ 296')).toBeInTheDocument()
  })

  it('distingue catálogo de importe a pagar', () => {
    const { container, rerender } = render(<Price usd={79} kind="catalog" />)
    expect(container.innerHTML).toBe('$79')

    rerender(<Price usd={79} kind="amount" />)
    expect(container.innerHTML).toBe('$79.00')
  })

  it('la prop currency fuerza la moneda aunque el switch diga otra', () => {
    const { container } = render(<Price usd={79} currency="PEN" kind="amount" />)

    expect(container.innerHTML).toBe('S/ 296.25')
  })

  it('no pinta nada si se fuerza PEN y no hay tasa', () => {
    config.penRate = null

    const { container } = render(<Price usd={79} currency="PEN" />)

    expect(container.innerHTML).toBe('')
  })
})
