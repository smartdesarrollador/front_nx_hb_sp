import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useUiStore } from '@/store/uiStore'
import { InvoiceRow } from '../InvoiceRow'
import type { Invoice } from '../../types'

const invoice: Invoice = {
  id: 'inv1',
  number: 'INV-202603-ABCD1234',
  amount: 79,
  currency: 'usd',
  exchange_rate: '3.7500',
  amount_pen: 296.25,
  status: 'paid',
  created_at: '2026-03-01T00:00:00Z',
  period_start: '2026-03-01T00:00:00Z',
  period_end: '2026-04-01T00:00:00Z',
  pdf_url: null,
}

function renderRow(overrides: Partial<Invoice> = {}) {
  render(
    <table>
      <tbody>
        <InvoiceRow invoice={{ ...invoice, ...overrides }} />
      </tbody>
    </table>,
  )
}

describe('InvoiceRow', () => {
  beforeEach(() => {
    useUiStore.setState({ currency: null })
  })

  it('formatea el importe con el símbolo de su moneda', () => {
    // Antes pintaba "USD 79.00", el único formateador de dinero fuera de lib/currency.
    renderRow()

    expect(screen.getByText(/\$79\.00/)).toBeInTheDocument()
  })

  it('muestra lo que se transfirió de verdad y con qué tasa', () => {
    renderRow()

    expect(screen.getByText(/Pagaste S\/ 296\.25/)).toBeInTheDocument()
    expect(screen.getByText(/tasa 3\.7500/)).toBeInTheDocument()
  })

  it('omite la línea de soles cuando no hubo conversión registrada', () => {
    // Al cliente no le aporta un "sin datos"; al operador sí, y ese lo ve en el Admin.
    renderRow({ amount_pen: null, exchange_rate: null })

    expect(screen.queryByText(/Pagaste/)).not.toBeInTheDocument()
    expect(screen.queryByText(/S\//)).not.toBeInTheDocument()
  })

  it('no sigue el switch de moneda: una factura es lo que ya se cobró', () => {
    useUiStore.setState({ currency: 'PEN' })

    renderRow()

    expect(screen.getByText(/\$79\.00/)).toBeInTheDocument()
  })

  it('no revienta con una moneda que Intl no soporta', () => {
    // Stripe puede devolver un código fuera de las monedas soportadas.
    renderRow({ currency: 'eur', amount_pen: null, exchange_rate: null })

    expect(screen.getByText(/EUR 79\.00/)).toBeInTheDocument()
  })
})
