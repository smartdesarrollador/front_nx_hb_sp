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
      instructions_note: '',
    },
    isLoading: false,
  }),
}))

// El tipo de cambio ya no sale de la config de Yape sino de /public/currency/.
const currency = vi.hoisted(() => ({ penRate: 3.75 as number | null }))

vi.mock('@/hooks/useCurrencyConfig', () => ({
  useCurrencyConfig: () => ({
    penRate: currency.penRate,
    defaultCurrency: 'USD',
    isLoading: false,
    isError: false,
  }),
}))

// Estado del token: por defecto vivo. Los tests del panel de recuperación lo cambian.
const tokenStatus = vi.fn(
  (_token: string | null, _enabled: boolean): { data?: { valid: boolean; expires_in: number | null } } =>
    ({ data: { valid: true, expires_in: 86400 } }),
)
vi.mock('@/features/auth/hooks/usePaymentTokenStatus', () => ({
  usePaymentTokenStatus: (token: string | null, enabled: boolean) => tokenStatus(token, enabled),
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
    expect(screen.getByText(/S\/\s*3,202\.50/)).toBeInTheDocument() // 854 × 3.75
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

describe('YapePaymentStep (registro) — cambiar el ciclo en el propio paso de pago', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    uploadProof.mockResolvedValue({ proof_id: 'p1', billing_cycle: 'monthly' })
    activateFree.mockResolvedValue({ activated: true })
  })

  // En este paso ya no se puede retroceder (la cuenta está creada), pero el ciclo no se
  // fija hasta que se envía el comprobante: por eso se puede cambiar aquí.
  // Etiquetas reales y no claves i18n: el componente importa el store de UI, que
  // inicializa i18n, así que `t()` ya resuelve las traducciones en el test.
  function toggle(cycle: 'monthly' | 'annual') {
    return screen.getByRole('button', {
      name: cycle === 'monthly' ? /Mensual/ : /Anual/,
    })
  }

  it('no muestra el toggle si no se puede cambiar el ciclo', () => {
    renderStep() // sin onBillingCycleChange
    expect(screen.queryByRole('button', { name: /Mensual/ })).not.toBeInTheDocument()
  })

  it('no muestra el toggle si el plan no tiene precio anual', () => {
    renderStep({ plan: 'starter', onBillingCycleChange: vi.fn() }) // starter: priceAnnual 0
    expect(screen.queryByRole('button', { name: /Mensual/ })).not.toBeInTheDocument()
  })

  it('permite pasar de anual a mensual y avisa al wizard', async () => {
    const onBillingCycleChange = vi.fn()
    renderStep({ billingCycle: 'annual', onBillingCycleChange })

    fireEvent.click(toggle('monthly'))

    await waitFor(() => expect(onBillingCycleChange).toHaveBeenCalledWith('monthly'))
  })

  it('el importe mostrado sigue al ciclo recibido', () => {
    const { rerender } = render(
      <YapePaymentStep
        paymentUploadToken="tok-1" plan="professional" billingCycle="annual"
        onBillingCycleChange={vi.fn()} onSuccess={vi.fn()} onActivated={vi.fn()}
      />,
    )
    expect(screen.getByText(/S\/\s*3,202\.50/)).toBeInTheDocument()

    rerender(
      <YapePaymentStep
        paymentUploadToken="tok-1" plan="professional" billingCycle="monthly"
        onBillingCycleChange={vi.fn()} onSuccess={vi.fn()} onActivated={vi.fn()}
      />,
    )

    expect(screen.getByText(/S\/\s*296\.25/)).toBeInTheDocument()
  })

  it('no revalida nada si no hay cupón aplicado', async () => {
    renderStep({ billingCycle: 'annual', onBillingCycleChange: vi.fn() })

    fireEvent.click(toggle('monthly'))

    await waitFor(() => expect(validatePromo).not.toHaveBeenCalled())
  })

  it('revalida el cupón contra el ciclo nuevo y actualiza el total', async () => {
    validatePromo
      .mockResolvedValueOnce({ valid: true, code: 'PROMO20', final_price: 683.2 })
      .mockResolvedValueOnce({ valid: true, code: 'PROMO20', final_price: 63.2 })
    renderStep({ billingCycle: 'annual', onBillingCycleChange: vi.fn() })

    fireEvent.click(screen.getByRole('button', { name: /código de descuento/ }))
    fireEvent.change(screen.getByPlaceholderText('CODIGO'), { target: { value: 'PROMO20' } })
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar' }))
    await waitFor(() => expect(validatePromo).toHaveBeenCalledTimes(1))

    fireEvent.click(toggle('monthly'))

    await waitFor(() => expect(validatePromo).toHaveBeenCalledTimes(2))
    // Se revalida con el ciclo NUEVO, no con el que aún tiene la prop
    expect(validatePromo).toHaveBeenLastCalledWith({
      code: 'PROMO20', plan: 'professional', billing_cycle: 'monthly',
    })
  })

  it('quita el cupón con un aviso si deja de aplicar al ciclo nuevo', async () => {
    // Caso real: un cupón de monto fijo que cubre el mensual no cubre el anual.
    validatePromo
      .mockResolvedValueOnce({ valid: true, code: 'FIJO79', final_price: 0 })
      .mockResolvedValueOnce({ valid: false, reason: 'invalid' })
    renderStep({ billingCycle: 'monthly', onBillingCycleChange: vi.fn() })

    fireEvent.click(screen.getByRole('button', { name: /código de descuento/ }))
    fireEvent.change(screen.getByPlaceholderText('CODIGO'), { target: { value: 'FIJO79' } })
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar' }))
    await waitFor(() => expect(validatePromo).toHaveBeenCalledTimes(1))

    fireEvent.click(toggle('annual'))

    await waitFor(() =>
      expect(screen.getByText(/no aplica al plan anual/)).toBeInTheDocument(),
    )
  })

  it('el comprobante se envía con el ciclo cambiado, no con el inicial', async () => {
    // El wizard es la fuente de verdad: al cambiar re-renderiza con el ciclo nuevo.
    const { rerender } = render(
      <YapePaymentStep
        paymentUploadToken="tok-1" plan="professional" billingCycle="annual"
        onBillingCycleChange={vi.fn()} onSuccess={vi.fn()} onActivated={vi.fn()}
      />,
    )
    rerender(
      <YapePaymentStep
        paymentUploadToken="tok-1" plan="professional" billingCycle="monthly"
        onBillingCycleChange={vi.fn()} onSuccess={vi.fn()} onActivated={vi.fn()}
      />,
    )
    attachScreenshot()

    fireEvent.click(screen.getByRole('button', { name: /Enviar comprobante/ }))

    await waitFor(() => expect(uploadProof).toHaveBeenCalledOnce())
    expect(uploadProof).toHaveBeenCalledWith(
      expect.objectContaining({ billing_cycle: 'monthly' }),
    )
  })
})

describe('YapePaymentStep (registro) — token muerto al volver al paso de pago', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    tokenStatus.mockReturnValue({ data: { valid: true, expires_in: 86400 } })
  })

  it('con el token caducado no pide el comprobante y explica la salida', () => {
    // Rechazarlo después de subir el screenshot sería un 400 opaco tras el esfuerzo.
    tokenStatus.mockReturnValue({ data: { valid: false, expires_in: null } })

    renderStep({ verifyToken: true })

    expect(screen.getByText('El enlace de pago caducó')).toBeInTheDocument()
    expect(screen.getByText(/Tu cuenta ya está creada/)).toBeInTheDocument()
    // La salida es la sesión normal: repetir el registro daría "email ya registrado".
    expect(screen.getByRole('link', { name: /Ir al inicio de sesión/ })).toHaveAttribute(
      'href', '/login',
    )
    expect(screen.queryByRole('button', { name: /Enviar comprobante/ })).not.toBeInTheDocument()
  })

  it('con el token vivo el paso funciona con normalidad', () => {
    renderStep({ verifyToken: true })

    expect(screen.queryByText('El enlace de pago caducó')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Enviar comprobante/ })).toBeInTheDocument()
  })

  it('sin rehidratar no se consulta el estado del token', () => {
    renderStep()

    expect(tokenStatus).toHaveBeenCalledWith('tok-1', false)
    expect(screen.getByRole('button', { name: /Enviar comprobante/ })).toBeInTheDocument()
  })

  it('mientras no hay respuesta todavía, no se asume lo peor', () => {
    // Un flash del panel de "caducó" mientras carga asustaría a quien sí puede pagar.
    tokenStatus.mockReturnValue({ data: undefined } as never)

    renderStep({ verifyToken: true })

    expect(screen.queryByText('El enlace de pago caducó')).not.toBeInTheDocument()
  })
})
