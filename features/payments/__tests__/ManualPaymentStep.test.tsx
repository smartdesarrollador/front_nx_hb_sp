import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ManualPaymentStep } from '../components/ManualPaymentStep'
import type { PaymentMethodPublic } from '../types'

const YAPE: PaymentMethodPublic = {
  method: 'yape', display_name: 'Yape', charge_currency: 'PEN', requires_reference: false,
  phone: '999888777', holder_name: 'Titular', checkout_url: '', account_email: '',
  instructions_note: '',
}

const PAYPAL: PaymentMethodPublic = {
  method: 'paypal', display_name: 'PayPal', charge_currency: 'USD', requires_reference: true,
  phone: '', holder_name: 'Titular', checkout_url: 'https://paypal.me/miempresa',
  account_email: 'pagos@ejemplo.com', instructions_note: '',
}

const state = vi.hoisted(() => ({
  methods: [] as unknown[],
  displayCurrency: 'USD' as 'USD' | 'PEN',
  penRate: 3.75 as number | null,
}))

vi.mock('../hooks/usePaymentMethods', () => ({
  usePaymentMethods: () => ({ methods: state.methods, isLoading: false, isError: false }),
}))

vi.mock('@/hooks/useDisplayCurrency', () => ({
  useDisplayCurrency: () => ({
    currency: state.displayCurrency,
    isConverted: state.displayCurrency !== 'USD',
    catalog: (usd: number) => `$${usd}`,
    amount: (usd: number) => `$${usd.toFixed(2)}`,
    inCurrency: (usd: number, currency: string, decimals = 2) =>
      currency === 'PEN' && state.penRate !== null
        ? `S/ ${(usd * state.penRate).toFixed(decimals)}`
        : null,
    penRate: state.penRate,
    isLoading: false,
  }),
}))

function makePromo() {
  return {
    applied: null, input: '', setInput: vi.fn(), isOpen: false, toggle: vi.fn(),
    error: null, setError: vi.fn(), isValidating: false,
    apply: vi.fn(), remove: vi.fn(), reject: vi.fn(), revalidate: vi.fn(),
  }
}

function renderStep(props: Partial<React.ComponentProps<typeof ManualPaymentStep>> = {}) {
  const onSubmit = vi.fn()
  render(
    <ManualPaymentStep
      title="Pago de tu suscripción"
      subtitle="Sube el comprobante"
      plan="professional"
      basePrice={79}
      isAnnual={false}
      promo={makePromo()}
      isSubmitting={false}
      onSubmit={onSubmit}
      {...props}
    />,
  )
  return { onSubmit }
}

function attachScreenshot() {
  const input = document.querySelector('input[type="file"]') as HTMLInputElement
  fireEvent.change(input, {
    target: { files: [new File(['png'], 'p.png', { type: 'image/png' })] },
  })
}

describe('ManualPaymentStep — elección de método', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    state.methods = [YAPE, PAYPAL]
    state.displayCurrency = 'USD'
    state.penRate = 3.75
  })

  it('con un solo método no ofrece una elección que no existe', () => {
    state.methods = [YAPE]
    renderStep()

    expect(screen.queryByText('¿Cómo prefieres pagar?')).not.toBeInTheDocument()
    expect(screen.getByText('999888777')).toBeInTheDocument()
  })

  it('en dólares preselecciona el método que cobra en dólares', () => {
    // La moneda que el cliente eligió mirar es la mejor pista de dónde está.
    renderStep()

    const options = screen.getAllByRole('radio')
    expect(options[0]).toHaveTextContent('PayPal')
    expect(options[0]).toHaveAttribute('aria-checked', 'true')
  })

  it('en soles preselecciona el método que cobra en soles', () => {
    state.displayCurrency = 'PEN'
    renderStep()

    const options = screen.getAllByRole('radio')
    expect(options[0]).toHaveTextContent('Yape')
    expect(options[0]).toHaveAttribute('aria-checked', 'true')
  })

  it('la elección del cliente manda sobre el orden por moneda', () => {
    renderStep()

    fireEvent.click(screen.getByRole('radio', { name: /Yape/ }))

    expect(screen.getByText('999888777')).toBeInTheDocument()
  })

  it('avisa cuando no hay ningún método disponible, en vez de un formulario inútil', () => {
    state.methods = []
    renderStep()

    expect(screen.getByText('Pago no disponible temporalmente')).toBeInTheDocument()
    expect(document.querySelector('input[type="file"]')).toBeNull()
  })
})

describe('ManualPaymentStep — la moneda la manda el método, no el catálogo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    state.methods = [YAPE, PAYPAL]
    state.displayCurrency = 'USD'
    state.penRate = 3.75
  })

  it('un método que cobra en soles pide soles', () => {
    state.methods = [YAPE]
    renderStep()

    expect(screen.getByText('S/ 296.25')).toBeInTheDocument()
  })

  it('un método que cobra en dólares NO pinta soles', () => {
    // El recibo de PayPal está en dólares: un «≈ S/» al lado invita a comparar contra
    // un número que no aparece en el comprobante.
    state.methods = [PAYPAL]
    renderStep()

    expect(screen.queryByText(/S\//)).not.toBeInTheDocument()
    expect(screen.getByText('$79.00 USD')).toBeInTheDocument()
  })

  it('el enlace de pago lleva el importe incorporado', () => {
    state.methods = [PAYPAL]
    renderStep()

    expect(screen.getByRole('link', { name: /Pagar en PayPal/ })).toHaveAttribute(
      'href', 'https://paypal.me/miempresa/79.00USD',
    )
  })
})

describe('ManualPaymentStep — envío del comprobante', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    state.methods = [PAYPAL]
    state.displayCurrency = 'USD'
    state.penRate = 3.75
  })

  it('no deja enviar sin la referencia cuando el método la exige', () => {
    renderStep()
    attachScreenshot()

    expect(screen.getByRole('button', { name: /Enviar comprobante/ })).toBeDisabled()
  })

  it('manda el método y la referencia junto a la captura', async () => {
    const { onSubmit } = renderStep()
    attachScreenshot()
    fireEvent.change(screen.getByLabelText('ID de transacción'), {
      target: { value: '  8XY12345AB  ' },
    })

    fireEvent.click(screen.getByRole('button', { name: /Enviar comprobante/ }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce())
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'paypal', transactionReference: '8XY12345AB' }),
    )
  })

  it('un método sin referencia se envía solo con la captura', async () => {
    state.methods = [YAPE]
    const { onSubmit } = renderStep()
    attachScreenshot()

    expect(screen.queryByLabelText('ID de transacción')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Enviar comprobante/ }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce())
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'yape', transactionReference: '' }),
    )
  })

  it('cambiar de método descarta la referencia del anterior', () => {
    state.methods = [PAYPAL, YAPE]
    renderStep()
    fireEvent.change(screen.getByLabelText('ID de transacción'), {
      target: { value: '8XY12345AB' },
    })

    fireEvent.click(screen.getByRole('radio', { name: /Yape/ }))
    fireEvent.click(screen.getByRole('radio', { name: /PayPal/ }))

    expect(screen.getByLabelText('ID de transacción')).toHaveValue('')
  })
})
