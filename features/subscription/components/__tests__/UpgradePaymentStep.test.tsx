import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import UpgradePaymentStep from '@/features/subscription/components/UpgradePaymentStep'

const mutateAsync = vi.fn()
const validateAsync = vi.fn()

vi.mock('@/features/subscription/hooks/useUpgradePayment', () => ({
  useUpgradePayment: () => ({ mutateAsync, isPending: false, isError: false, error: null }),
  PENDING_PROOF_MESSAGE: 'pending',
}))

// Los métodos de pago salen del catálogo público:
// la fila `yape` llega ahí con su `charge_currency`.
const methods = vi.hoisted(() => ({
  list: [
    {
      method: 'yape', display_name: 'Yape', charge_currency: 'PEN' as const,
      requires_reference: false, phone: '999888777', holder_name: 'Titular',
      checkout_url: '', account_email: '', instructions_note: '',
    },
  ],
}))

vi.mock('@/features/payments/hooks/usePaymentMethods', () => ({
  usePaymentMethods: () => ({ methods: methods.list, isLoading: false, isError: false }),
}))

// El tipo de cambio sale de /public/currency/.
const currency = vi.hoisted(() => ({ penRate: 3.75 as number | null }))

vi.mock('@/hooks/useCurrencyConfig', () => ({
  useCurrencyConfig: () => ({
    penRate: currency.penRate,
    defaultCurrency: 'USD',
    isLoading: false,
    isError: false,
  }),
}))

vi.mock('@/features/auth/hooks/useValidatePromotion', () => ({
  useValidatePromotion: () => ({ mutateAsync: validateAsync, isPending: false }),
  PROMO_REASON_MESSAGES: { invalid: 'El código no es válido.' },
}))

function renderStep(props: Partial<React.ComponentProps<typeof UpgradePaymentStep>> = {}) {
  const onSuccess = vi.fn()
  render(
    <UpgradePaymentStep
      plan="professional"
      priceMonthly={79}
      priceAnnual={854}
      billingCycle="monthly"
      onSuccess={onSuccess}
      {...props}
    />,
  )
  return { onSuccess }
}

function attachScreenshot() {
  const input = document.querySelector('input[type="file"]') as HTMLInputElement
  const file = new File(['png'], 'proof.png', { type: 'image/png' })
  fireEvent.change(input, { target: { files: [file] } })
}

describe('UpgradePaymentStep — ciclo de facturación', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    currency.penRate = 3.75
    mutateAsync.mockResolvedValue({ proof_id: 'p1', is_renewal: false, billing_cycle: 'monthly' })
  })

  it('en mensual muestra el precio mensual y su equivalente en soles', () => {
    renderStep()
    expect(screen.getByText('S/ 296.25')).toBeInTheDocument() // 79 * 3.75
    expect(screen.getByText('mensual')).toBeInTheDocument()
    expect(screen.getByText(/\$79\/mes/)).toBeInTheDocument()
  })

  it('en anual usa el precio del año completo', () => {
    renderStep({ billingCycle: 'annual' })
    expect(screen.getByText('S/ 3,202.50')).toBeInTheDocument() // 854 * 3.75
    expect(screen.getByText('anual')).toBeInTheDocument()
    expect(screen.getByText(/\$854\/año/)).toBeInTheDocument()
  })

  it('cae a mensual si el plan no tiene precio anual configurado', () => {
    renderStep({ billingCycle: 'annual', priceAnnual: 0 })
    expect(screen.getByText('S/ 296.25')).toBeInTheDocument()
  })

  it('envía billing_cycle en el submit', async () => {
    renderStep({ billingCycle: 'annual' })
    attachScreenshot()

    fireEvent.click(screen.getByRole('button', { name: /Enviar comprobante/ }))

    await waitFor(() => expect(mutateAsync).toHaveBeenCalledOnce())
    expect(mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ plan: 'professional', billing_cycle: 'annual' }),
    )
  })

  it('valida el cupón contra el ciclo elegido', async () => {
    validateAsync.mockResolvedValue({ valid: true, code: 'ANUAL20', final_price: 683.2 })
    renderStep({ billingCycle: 'annual' })

    fireEvent.click(screen.getByRole('button', { name: /código de descuento/ }))
    fireEvent.change(screen.getByPlaceholderText('CODIGO'), { target: { value: 'ANUAL20' } })
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar' }))

    await waitFor(() => expect(validateAsync).toHaveBeenCalledOnce())
    expect(validateAsync).toHaveBeenCalledWith({
      code: 'ANUAL20', plan: 'professional', billing_cycle: 'annual',
    })
  })

  it('rotula la renovación como un período más', () => {
    renderStep({ isRenewal: true, billingCycle: 'annual' })
    expect(screen.getByText(/renovar tu plan por 1 año más/)).toBeInTheDocument()
  })

  it('sin tipo de cambio pide el importe en dólares y avisa, en vez de inventar soles', () => {
    // El `?? '3.75'` que había antes pintaba un importe plausible y equivocado.
    currency.penRate = null
    renderStep()

    expect(screen.queryByText(/S\//)).not.toBeInTheDocument()
    expect(screen.getByText('$79.00 USD')).toBeInTheDocument()
    expect(screen.getByText(/tipo de cambio de tu banco/)).toBeInTheDocument()
  })

  it('con cupón manda el importe en soles que calculó el backend', async () => {
    // 683.20 × 3.75 daría S/ 2562.00; el backend dice otra cosa y es la que vale.
    validateAsync.mockResolvedValue({
      valid: true, code: 'ANUAL20', final_price: 683.2, final_price_pen: 2500,
    })
    renderStep({ billingCycle: 'annual' })

    fireEvent.click(screen.getByRole('button', { name: /código de descuento/ }))
    fireEvent.change(screen.getByPlaceholderText('CODIGO'), { target: { value: 'ANUAL20' } })
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar' }))

    expect(await screen.findByText('S/ 2,500.00')).toBeInTheDocument()
  })
})
