import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import YapeUpgradeStep from '@/features/subscription/components/YapeUpgradeStep'

const mutateAsync = vi.fn()
const validateAsync = vi.fn()

vi.mock('@/features/subscription/hooks/useYapeUpgrade', () => ({
  useYapeUpgrade: () => ({ mutateAsync, isPending: false, isError: false, error: null }),
  PENDING_PROOF_MESSAGE: 'pending',
}))

vi.mock('@/features/auth/hooks/useYapeConfig', () => ({
  useYapeConfig: () => ({
    data: {
      is_enabled: true,
      phone: '999888777',
      holder_name: 'Titular Test',
      exchange_rate: '3.75',
      instructions_note: '',
    },
    isLoading: false,
  }),
}))

vi.mock('@/features/auth/hooks/useValidatePromotion', () => ({
  useValidatePromotion: () => ({ mutateAsync: validateAsync, isPending: false }),
  PROMO_REASON_MESSAGES: { invalid: 'El código no es válido.' },
}))

function renderStep(props: Partial<React.ComponentProps<typeof YapeUpgradeStep>> = {}) {
  const onSuccess = vi.fn()
  render(
    <YapeUpgradeStep
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

describe('YapeUpgradeStep — ciclo de facturación', () => {
  beforeEach(() => {
    vi.clearAllMocks()
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
    expect(screen.getByText('S/ 3202.50')).toBeInTheDocument() // 854 * 3.75
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
})
