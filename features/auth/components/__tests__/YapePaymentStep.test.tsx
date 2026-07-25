import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import YapePaymentStep from '@/features/auth/components/YapePaymentStep'

const uploadProof = vi.fn()
const activateFree = vi.fn()
const validatePromo = vi.fn()

vi.mock('@/features/auth/hooks/useUploadYapeProof', () => ({
  useUploadYapeProof: () => ({
    mutateAsync: uploadProof, isPending: false, isError: false, error: null,
  }),
}))

vi.mock('@/features/auth/hooks/useActivateFreePlan', () => ({
  useActivateFreePlan: () => ({ mutateAsync: activateFree, isPending: false }),
}))

vi.mock('@/features/auth/hooks/useValidatePromotion', () => ({
  useValidatePromotion: () => ({ mutateAsync: validatePromo, isPending: false }),
  PROMO_REASON_MESSAGES: { invalid: 'El código no es válido.' },
}))

vi.mock('@/features/auth/hooks/useYapeConfig', () => ({
  useYapeConfig: () => ({
    data: {
      is_enabled: true, phone: '999888777', holder_name: 'Titular',
      exchange_rate: '3.75', instructions_note: '',
    },
    isLoading: false,
  }),
}))

vi.mock('@/features/subscription/hooks/usePlans', () => ({
  usePlans: () => ({
    plans: [
      { id: 'professional', displayName: 'Professional', priceMonthly: 79, priceAnnual: 854, description: '', popular: true, features: [] },
      { id: 'starter', displayName: 'Starter', priceMonthly: 19, priceAnnual: 0, description: '', popular: false, features: [] },
    ],
    isLoading: false,
  }),
}))

function renderStep(props: Partial<React.ComponentProps<typeof YapePaymentStep>> = {}) {
  render(
    <YapePaymentStep
      paymentUploadToken="tok-1"
      plan="professional"
      billingCycle="monthly"
      onSuccess={vi.fn()}
      onActivated={vi.fn()}
      {...props}
    />,
  )
}

function attachScreenshot() {
  const input = document.querySelector('input[type="file"]') as HTMLInputElement
  fireEvent.change(input, {
    target: { files: [new File(['png'], 'p.png', { type: 'image/png' })] },
  })
}

describe('YapePaymentStep (registro) — ciclo de facturación', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    uploadProof.mockResolvedValue({ proof_id: 'p1', billing_cycle: 'monthly' })
    activateFree.mockResolvedValue({ activated: true })
  })

  it('en mensual cobra el precio mensual', () => {
    renderStep()
    expect(screen.getByText(/S\/\s*296\.25/)).toBeInTheDocument() // 79 × 3.75
    expect(screen.getByText('mensual')).toBeInTheDocument()
  })

  it('en anual cobra el precio del año completo', () => {
    renderStep({ billingCycle: 'annual' })
    expect(screen.getByText(/S\/\s*3202\.50/)).toBeInTheDocument() // 854 × 3.75
    expect(screen.getByText('anual')).toBeInTheDocument()
  })

  it('cae a mensual si el plan no tiene precio anual configurado', () => {
    renderStep({ plan: 'starter', billingCycle: 'annual' })
    expect(screen.getByText(/S\/\s*71\.25/)).toBeInTheDocument() // 19 × 3.75
    expect(screen.getByText('mensual')).toBeInTheDocument()
  })

  it('envía billing_cycle al subir el comprobante', async () => {
    renderStep({ billingCycle: 'annual' })
    attachScreenshot()

    fireEvent.click(screen.getByRole('button', { name: /Enviar comprobante/ }))

    await waitFor(() => expect(uploadProof).toHaveBeenCalledOnce())
    expect(uploadProof).toHaveBeenCalledWith(
      expect.objectContaining({ plan: 'professional', billing_cycle: 'annual' }),
    )
  })

  it('valida el cupón contra el ciclo elegido', async () => {
    validatePromo.mockResolvedValue({ valid: true, code: 'ANUAL20', final_price: 683.2 })
    renderStep({ billingCycle: 'annual' })

    fireEvent.click(screen.getByRole('button', { name: /código de descuento/ }))
    fireEvent.change(screen.getByPlaceholderText('CODIGO'), { target: { value: 'ANUAL20' } })
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar' }))

    await waitFor(() => expect(validatePromo).toHaveBeenCalledOnce())
    expect(validatePromo).toHaveBeenCalledWith({
      code: 'ANUAL20', plan: 'professional', billing_cycle: 'annual',
    })
  })

  it('envía el ciclo al activar con un cupón del 100%', async () => {
    validatePromo.mockResolvedValue({ valid: true, code: 'GRATIS100', final_price: 0 })
    renderStep({ billingCycle: 'annual' })

    fireEvent.click(screen.getByRole('button', { name: /código de descuento/ }))
    fireEvent.change(screen.getByPlaceholderText('CODIGO'), { target: { value: 'GRATIS100' } })
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar' }))
    await waitFor(() => expect(validatePromo).toHaveBeenCalled())

    const activateBtn = await screen.findByRole('button', { name: /Activar/i })
    fireEvent.click(activateBtn)

    await waitFor(() => expect(activateFree).toHaveBeenCalledOnce())
    expect(activateFree).toHaveBeenCalledWith(
      expect.objectContaining({ promo_code: 'GRATIS100', billing_cycle: 'annual' }),
    )
  })
})
