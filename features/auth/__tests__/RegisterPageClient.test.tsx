import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import RegisterPageClient from '@/features/auth/RegisterPageClient'

// El hook real usa TanStack Query y estos tests montan sin QueryClientProvider.
// Mockearlo explícitamente además evita que MSW deje pasar la petición en silencio
// (onUnhandledRequest: 'bypass') y el test acabe pasando por la razón equivocada.
vi.mock('@/hooks/useCurrencyConfig', () => ({
  useCurrencyConfig: () => ({
    penRate: 3.75,
    defaultCurrency: 'USD',
    isLoading: false,
    isError: false,
  }),
}))


let searchParams = new URLSearchParams()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  useSearchParams: () => searchParams,
  usePathname: () => '/register',
}))

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

const registerMutate = vi.fn()
vi.mock('@/features/auth/hooks/useRegister', () => ({
  useRegister: () => ({ mutateAsync: registerMutate, isPending: false }),
}))

vi.mock('@/features/auth/components/GoogleOAuthButton', () => ({
  default: () => <button type="button">Google</button>,
}))

// Captura las props con las que el wizard monta el paso de pago: es donde se comprueba
// que el ciclo elegido llega al cobro.
const paymentStepProps = vi.fn()
vi.mock('@/features/auth/components/PaymentStep', () => ({
  default: (props: Record<string, unknown>) => {
    paymentStepProps(props)
    return <div data-testid="payment-step" />
  },
}))

vi.mock('@/features/subscription/hooks/usePlans', () => ({
  usePlans: () => ({
    plans: [
      { id: 'free', displayName: 'Free', priceMonthly: 0, priceAnnual: 0, description: 'Gratis', popular: false, features: [] },
      { id: 'starter', displayName: 'Starter', priceMonthly: 19, priceAnnual: 205, description: 'Pequeños equipos', popular: false, features: [] },
      { id: 'professional', displayName: 'Professional', priceMonthly: 79, priceAnnual: 854, description: 'Escala', popular: true, features: [] },
    ],
    isLoading: false,
  }),
}))

/**
 * Avanza del paso 1 al 3. Los labels del wizard no están asociados a sus inputs, así
 * que se navega por placeholder — que además es lo que ve el usuario.
 */
async function goToPlanStep() {
  render(<RegisterPageClient />)

  fireEvent.change(screen.getByPlaceholderText('tu@empresa.com'), {
    target: { value: 'nuevo@test.com' },
  })
  fireEvent.change(screen.getByPlaceholderText('Mínimo 8 caracteres'), {
    target: { value: 'SecurePass1!' },
  })
  fireEvent.change(screen.getByPlaceholderText('Repite tu contraseña'), {
    target: { value: 'SecurePass1!' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Continuar' }))

  const orgInput = await screen.findByPlaceholderText('Mi Empresa S.A.')
  fireEvent.change(orgInput, { target: { value: 'Mi Empresa' } })
  fireEvent.click(screen.getByRole('button', { name: 'Continuar' }))

  await screen.findByText('Elige tu plan')
}

/**
 * El toggle está traducido (`useTranslation('common')`). En los tests i18next no se
 * inicializa, así que `t()` devuelve la clave: se consulta por ella, no por el texto.
 */
function toggle(cycle: 'monthly' | 'annual') {
  return screen.getByRole('button', {
    // Etiquetas reales: el componente importa el store de UI, que inicializa i18n.
    name: cycle === 'monthly' ? /Mensual/ : /Anual/,
  })
}

describe('RegisterPageClient — toggle de ciclo en el paso 3', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    searchParams = new URLSearchParams()
    // El wizard rehidrata al montar: sin limpiar, un test que llegó al paso de pago
    // arrancaría el siguiente directamente ahí.
    sessionStorage.clear()
    registerMutate.mockResolvedValue({ requires_payment: false })
  })

  it('muestra el toggle con el descuento máximo disponible', async () => {
    await goToPlanStep()

    expect(toggle('monthly')).toBeInTheDocument()
    // starter 19→205 = 10%; professional 79→854 = 10%
    expect(toggle('annual')).toHaveTextContent('hasta')
  })

  it('arranca en mensual y muestra los precios mensuales', async () => {
    await goToPlanStep()

    expect(screen.getByText('$79/mes')).toBeInTheDocument()
    expect(screen.getByText('$19/mes')).toBeInTheDocument()
  })

  it('al cambiar a anual muestra el total del año y el ahorro', async () => {
    await goToPlanStep()

    fireEvent.click(toggle('annual'))

    await waitFor(() => expect(screen.getByText('$854/año')).toBeInTheDocument())
    expect(screen.getByText('$205/año')).toBeInTheDocument()
    expect(screen.getAllByText(/ahorras \$/).length).toBeGreaterThan(0)
    // Free no tiene precio anual: sigue en mensual
    expect(screen.getByText('$0/mes')).toBeInTheDocument()
  })

  it('?cycle=annual preselecciona el ciclo anual', async () => {
    searchParams = new URLSearchParams('plan=professional&cycle=annual')

    await goToPlanStep()

    expect(screen.getByText('$854/año')).toBeInTheDocument()
  })

  it('un ?cycle= inválido cae a mensual sin romper el registro', async () => {
    searchParams = new URLSearchParams('plan=professional&cycle=trimestral')

    await goToPlanStep()

    expect(screen.getByText('$79/mes')).toBeInTheDocument()
    expect(screen.queryByText('$854/año')).not.toBeInTheDocument()
  })

  it('con el trial activo no se ofrece el ciclo (son 30 días gratis)', async () => {
    searchParams = new URLSearchParams('plan=professional&trial=true')

    await goToPlanStep()

    expect(screen.queryByRole('button', { name: /Mensual/ })).not.toBeInTheDocument()
    expect(screen.getByText('Gratis →')).toBeInTheDocument()
  })

  it('el ciclo elegido llega al paso de pago', async () => {
    searchParams = new URLSearchParams('plan=professional')
    registerMutate.mockResolvedValue({
      requires_payment: true,
      payment_upload_token: 'tok-123',
    })
    await goToPlanStep()

    fireEvent.click(toggle('annual'))
    fireEvent.click(screen.getByRole('button', { name: /Crear cuenta/i }))

    await screen.findByTestId('payment-step')
    expect(paymentStepProps).toHaveBeenCalledWith(
      expect.objectContaining({ plan: 'professional', billingCycle: 'annual' }),
    )
  })

  it('sin tocar el toggle, el paso de pago recibe mensual', async () => {
    searchParams = new URLSearchParams('plan=starter')
    registerMutate.mockResolvedValue({
      requires_payment: true,
      payment_upload_token: 'tok-456',
    })
    await goToPlanStep()

    fireEvent.click(screen.getByRole('button', { name: /Crear cuenta/i }))

    await screen.findByTestId('payment-step')
    expect(paymentStepProps).toHaveBeenCalledWith(
      expect.objectContaining({ billingCycle: 'monthly' }),
    )
  })
})

describe('RegisterPageClient — recuperar el paso de pago', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    searchParams = new URLSearchParams()
    sessionStorage.clear()
    registerMutate.mockResolvedValue({ requires_payment: false })
  })

  function saved() {
    const raw = sessionStorage.getItem('hub-register-payment')
    return raw ? JSON.parse(raw) : null
  }

  it('guarda el paso de pago en cuanto la cuenta existe', async () => {
    // A partir de "Crear cuenta" ya hay tenant + usuario: perder la página aquí es lo
    // que dejaba cuentas sin pagar y sin salida.
    searchParams = new URLSearchParams('plan=professional')
    registerMutate.mockResolvedValue({
      requires_payment: true,
      payment_upload_token: 'tok-abc',
    })
    await goToPlanStep()

    fireEvent.click(toggle('annual'))
    fireEvent.click(screen.getByRole('button', { name: /Crear cuenta/i }))

    await screen.findByTestId('payment-step')
    expect(saved()).toMatchObject({
      token: 'tok-abc',
      plan: 'professional',
      cycle: 'annual',
      email: 'nuevo@test.com',
      organizationName: 'Mi Empresa',
    })
  })

  it('con un plan gratuito no guarda nada (no hay pago que retomar)', async () => {
    await goToPlanStep()
    fireEvent.click(screen.getByRole('button', { name: /Crear cuenta/i }))

    await waitFor(() => expect(registerMutate).toHaveBeenCalled())
    expect(saved()).toBeNull()
  })

  it('al montar con una sesión guardada abre el paso de pago', async () => {
    sessionStorage.setItem('hub-register-payment', JSON.stringify({
      token: 'tok-restaurado', plan: 'starter', cycle: 'annual',
      email: 'vuelvo@test.com', organizationName: 'Org', savedAt: Date.now(),
    }))

    render(<RegisterPageClient />)

    await screen.findByTestId('payment-step')
    expect(paymentStepProps).toHaveBeenLastCalledWith(
      expect.objectContaining({
        paymentUploadToken: 'tok-restaurado',
        plan: 'starter',
        billingCycle: 'annual',
        // Solo al rehidratar se comprueba si el token sigue vivo.
        verifyToken: true,
      }),
    )
  })

  it('en el camino normal no se comprueba el token (acaba de emitirse)', async () => {
    searchParams = new URLSearchParams('plan=starter')
    registerMutate.mockResolvedValue({
      requires_payment: true,
      payment_upload_token: 'tok-nuevo',
    })
    await goToPlanStep()

    fireEvent.click(screen.getByRole('button', { name: /Crear cuenta/i }))

    await screen.findByTestId('payment-step')
    expect(paymentStepProps).toHaveBeenLastCalledWith(
      expect.objectContaining({ verifyToken: false }),
    )
  })

  it('cambiar el ciclo en el paso de pago se guarda también', async () => {
    sessionStorage.setItem('hub-register-payment', JSON.stringify({
      token: 'tok-1', plan: 'professional', cycle: 'monthly',
      email: 'a@test.com', organizationName: 'Org', savedAt: Date.now(),
    }))
    render(<RegisterPageClient />)
    await screen.findByTestId('payment-step')

    const props = paymentStepProps.mock.calls.at(-1)![0] as {
      onBillingCycleChange: (c: string) => void
    }
    props.onBillingCycleChange('annual')

    await waitFor(() => expect(saved().cycle).toBe('annual'))
  })

  it('al enviar el comprobante deja de haber nada que retomar', async () => {
    sessionStorage.setItem('hub-register-payment', JSON.stringify({
      token: 'tok-1', plan: 'starter', cycle: 'monthly',
      email: 'a@test.com', organizationName: 'Org', savedAt: Date.now(),
    }))
    render(<RegisterPageClient />)
    await screen.findByTestId('payment-step')

    const props = paymentStepProps.mock.calls.at(-1)![0] as { onSuccess: () => void }
    props.onSuccess()

    await waitFor(() => expect(saved()).toBeNull())
  })
})
