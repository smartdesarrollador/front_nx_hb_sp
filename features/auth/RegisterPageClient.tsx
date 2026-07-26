'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertCircle, Check, Clock } from 'lucide-react'
import AuthLayout from '@/features/auth/components/AuthLayout'
import GoogleOAuthButton from '@/features/auth/components/GoogleOAuthButton'
import YapePaymentStep from '@/features/auth/components/YapePaymentStep'
import { useRegister } from '@/features/auth/hooks/useRegister'
import {
  clearRegisterPaymentSession,
  loadRegisterPaymentSession,
  saveRegisterPaymentSession,
} from '@/features/auth/registerPaymentSession'
import { usePlans } from '@/features/subscription/hooks/usePlans'
import BillingCycleToggle from '@/features/subscription/components/BillingCycleToggle'
import {
  MONTHS_PER_YEAR,
  annualDiscountPercent,
  annualSavings,
  maxAnnualDiscount,
} from '@/features/subscription/plans-data'
import type { BillingCycle, PlanData } from '@/features/subscription/types'
import Price from '@/components/shared/Price'
import { useDisplayCurrency } from '@/hooks/useDisplayCurrency'

const step1Schema = z
  .object({
    email: z.string().email('Email inválido'),
    password: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Debe contener al menos una letra mayúscula')
      .regex(/[0-9]/, 'Debe contener al menos un número'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

const step2Schema = z.object({
  organizationName: z.string().min(2, 'Mínimo 2 caracteres'),
})

type Step1Data = z.infer<typeof step1Schema>
type Step2Data = z.infer<typeof step2Schema>

const FREE_STEP_LABELS  = ['Cuenta', 'Empresa', 'Plan', '¡Listo!']
const PAID_STEP_LABELS  = ['Cuenta', 'Empresa', 'Plan', 'Pago', '¡Listo!']

/**
 * Precio de un plan en la lista del paso 3. En anual muestra la mensualidad
 * equivalente y, debajo, el total real facturado y el ahorro — mismo criterio que la
 * grilla de Suscripción, para que el cliente vea lo mismo antes y después de contratar.
 */
function PlanPrice({ plan, billingCycle }: { plan: PlanData; billingCycle: BillingCycle }) {
  const isAnnual = billingCycle === 'annual' && plan.priceAnnual > 0
  if (!isAnnual) {
    return <><Price usd={plan.priceMonthly} />/mes</>
  }
  const discount = annualDiscountPercent(plan)
  return (
    <span className="inline-flex flex-col items-end">
      <span><Price usd={Math.round(plan.priceAnnual / MONTHS_PER_YEAR)} />/mes</span>
      <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
        <Price usd={plan.priceAnnual} />/año
        {discount !== null && (
          <span className="text-green-600 dark:text-green-400">
            {' '}· ahorras <Price usd={annualSavings(plan)} />
          </span>
        )}
      </span>
    </span>
  )
}

export default function RegisterPageClient() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const preSelectedPlan = searchParams.get('plan') ?? 'free'
  const isTrial         = searchParams.get('trial') === 'true'
  // Solo 'annual' activa el ciclo anual: cualquier otro valor (o basura en la URL) cae
  // a mensual en vez de romper el registro.
  const preSelectedCycle: BillingCycle =
    searchParams.get('cycle') === 'annual' ? 'annual' : 'monthly'

  const [step, setStep]                       = useState(1)
  const [selectedPlan, setSelectedPlan]       = useState(preSelectedPlan)
  const [billingCycle, setBillingCycle]       = useState<BillingCycle>(preSelectedCycle)
  const [trialActive, setTrialActive]         = useState(false)

  useEffect(() => {
    if (isTrial && preSelectedPlan === 'professional') setTrialActive(true)
  }, [isTrial, preSelectedPlan])
  const [resultTrialActive, setResultTrialActive] = useState(false)
  const [requiresPayment, setRequiresPayment] = useState(false)
  const [paymentUploadToken, setPaymentUploadToken] = useState<string | null>(null)
  const [activatedByPromo, setActivatedByPromo] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '', organizationName: '' })
  const [registerError, setRegisterError]     = useState<string | null>(null)
  // Se llegó al paso de pago rehidratando, no completando el wizard: solo en ese caso
  // hay que comprobar si el token sigue vivo (ver YapePaymentStep).
  const [restoredPayment, setRestoredPayment] = useState(false)

  // Rehidratación tras un refresco o un back. Va en un efecto de montaje y no en el
  // estado inicial: el SSR de Next renderiza el paso 1, y arrancar directamente en el 4
  // rompería la hidratación. Un frame en el paso 1 es un precio menor.
  useEffect(() => {
    const saved = loadRegisterPaymentSession()
    if (!saved) return
    setFormData((prev) => ({
      ...prev,
      email: saved.email,
      organizationName: saved.organizationName,
    }))
    setSelectedPlan(saved.plan)
    setBillingCycle(saved.cycle)
    setPaymentUploadToken(saved.token)
    setRequiresPayment(true)
    setRestoredPayment(true)
    setStep(4)
  }, [])

  function finishPayment(onDone: () => void) {
    clearRegisterPaymentSession()
    onDone()
  }

  const { mutateAsync: registerMutate, isPending } = useRegister()
  const { plans: allPlans } = usePlans()
  const annualDiscount = maxAnnualDiscount(allPlans)
  const money = useDisplayCurrency()

  const STEP_LABELS = requiresPayment ? PAID_STEP_LABELS : FREE_STEP_LABELS

  const form1 = useForm<Step1Data>({ resolver: zodResolver(step1Schema) })
  const form2 = useForm<Step2Data>({ resolver: zodResolver(step2Schema) })
  const orgName = form2.watch('organizationName') ?? ''
  const subdomainPreview =
    orgName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'tu-empresa'

  function handleStep1(data: Step1Data) {
    setFormData((prev) => ({ ...prev, email: data.email, password: data.password }))
    setStep(2)
  }

  function handleStep2(data: Step2Data) {
    setFormData((prev) => ({ ...prev, organizationName: data.organizationName }))
    setStep(3)
  }

  async function handleStep3() {
    setRegisterError(null)
    try {
      const result = await registerMutate({
        name: formData.organizationName,
        email: formData.email,
        password: formData.password,
        organization_name: formData.organizationName,
        plan: selectedPlan,
        is_trial: selectedPlan === 'professional' && trialActive,
      })

      if (result.trial_active) {
        setResultTrialActive(true)
        setStep(4)
      } else if (result.requires_payment && result.payment_upload_token) {
        setRequiresPayment(true)
        setPaymentUploadToken(result.payment_upload_token)
        // La cuenta ya está creada: si ahora se pierde la página, esto es lo único que
        // permite volver al paso de pago en vez de quedarse sin pagar y sin salida.
        saveRegisterPaymentSession({
          token: result.payment_upload_token,
          plan: selectedPlan,
          cycle: billingCycle,
          email: formData.email,
          organizationName: formData.organizationName,
        })
        setStep(4)
      } else {
        setStep(4)
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string }; detail?: string } } })
          ?.response?.data?.error?.message ??
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        (err as Error)?.message ??
        'Error al crear la cuenta. Intenta de nuevo.'
      setRegisterError(msg)
    }
  }

  return (
    <AuthLayout>
      {/* Stepper */}
      <div className="flex items-center justify-center mb-8">
        {STEP_LABELS.map((label, idx) => {
          const num       = idx + 1
          const isCompleted = step > num
          const isActive    = step === num
          return (
            <div key={label} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                    isCompleted || isActive
                      ? 'bg-primary-600 text-white'
                      : 'border-2 border-gray-300 text-gray-400'
                  }`}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : num}
                </div>
                <span
                  className={`text-xs mt-1 ${
                    isActive ? 'text-primary-600 font-medium' : 'text-gray-400'
                  }`}
                >
                  {label}
                </span>
              </div>
              {idx < STEP_LABELS.length - 1 && (
                <div
                  className={`h-px w-8 mx-2 mb-5 ${step > num ? 'bg-primary-600' : 'bg-gray-300'}`}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Step 1 — Account */}
      {step === 1 && (
        <form onSubmit={form1.handleSubmit(handleStep1)} className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Crea tu cuenta
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              {...form1.register('email')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              placeholder="tu@empresa.com"
            />
            {form1.formState.errors.email && (
              <p className="text-red-500 text-sm mt-1">{form1.formState.errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              {...form1.register('password')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              placeholder="Mínimo 8 caracteres"
            />
            {form1.formState.errors.password && (
              <p className="text-red-500 text-sm mt-1">{form1.formState.errors.password.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirmar contraseña
            </label>
            <input
              type="password"
              {...form1.register('confirmPassword')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              placeholder="Repite tu contraseña"
            />
            {form1.formState.errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{form1.formState.errors.confirmPassword.message}</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Continuar
          </button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">o</span>
            </div>
          </div>
          <GoogleOAuthButton text="Registrarse con Google" />
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Inicia sesión
            </Link>
          </p>
        </form>
      )}

      {/* Step 2 — Organization */}
      {step === 2 && (
        <form onSubmit={form2.handleSubmit(handleStep2)} className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Tu organización
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre de la organización
            </label>
            <input
              type="text"
              {...form2.register('organizationName')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              placeholder="Mi Empresa S.A."
            />
            {form2.formState.errors.organizationName && (
              <p className="text-red-500 text-sm mt-1">
                {form2.formState.errors.organizationName.message}
              </p>
            )}
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-sm">
            <p className="text-gray-500 dark:text-gray-400 mb-1">Tu subdominio será:</p>
            <p
              className="font-mono font-medium text-primary-600 dark:text-primary-400"
              data-testid="subdomain-preview"
            >
              {subdomainPreview}.hub.app
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2.5 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Atrás
            </button>
            <button
              type="submit"
              className="flex-1 bg-primary-600 text-white py-2.5 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Continuar
            </button>
          </div>
        </form>
      )}

      {/* Step 3 — Plan selection */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Elige tu plan
            </h2>
            {/* Con el trial activo el ciclo es irrelevante (30 días gratis pase lo que
                pase), y si ningún plan tiene ahorro anual no hay nada que ofrecer. */}
            {!trialActive && annualDiscount !== null && (
              <BillingCycleToggle
                value={billingCycle}
                onChange={setBillingCycle}
                discountPercent={annualDiscount}
              />
            )}
          </div>
          <div className="space-y-3">
            {allPlans.map((plan) => (
              <label
                key={plan.id}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  selectedPlan === plan.id
                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="plan"
                  value={plan.id}
                  checked={selectedPlan === plan.id}
                  onChange={() => {
                    setSelectedPlan(plan.id)
                    if (plan.id !== 'professional') setTrialActive(false)
                  }}
                  className="text-primary-600"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {plan.displayName}
                    </span>
                    {plan.popular && (
                      <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-medium">
                        Popular
                      </span>
                    )}
                    {plan.id === 'professional' && trialActive && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full font-medium">
                        30 días gratis
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{plan.description}</p>
                </div>
                <span className="font-bold text-gray-900 dark:text-white text-right">
                  {plan.id === 'professional' && trialActive ? (
                    <span className="text-green-700">Gratis →</span>
                  ) : (
                    <PlanPrice plan={plan} billingCycle={billingCycle} />
                  )}
                </span>
              </label>
            ))}
          </div>
          {money.isConverted && (
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Los precios se cobran en USD. El importe en soles es referencial.
            </p>
          )}
          {registerError && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
              <AlertCircle className="mt-0.5 w-4 h-4 flex-shrink-0" />
              <span>{registerError}</span>
            </div>
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2.5 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Atrás
            </button>
            <button
              type="button"
              onClick={handleStep3}
              disabled={isPending}
              className="flex-1 bg-primary-600 text-white py-2.5 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {isPending ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </div>
        </div>
      )}

      {/* Step 4a — Yape payment (paid plans) */}
      {step === 4 && requiresPayment && paymentUploadToken && (
        <YapePaymentStep
          paymentUploadToken={paymentUploadToken}
          plan={selectedPlan}
          billingCycle={billingCycle}
          // El ciclo sube al wizard para que haya una sola fuente de verdad: en el paso
          // de pago ya no se puede retroceder, pero el ciclo sigue siendo editable.
          onBillingCycleChange={(cycle) => {
            setBillingCycle(cycle)
            saveRegisterPaymentSession({
              token: paymentUploadToken,
              plan: selectedPlan,
              cycle,
              email: formData.email,
              organizationName: formData.organizationName,
            })
          }}
          // Solo tras rehidratar puede estar muerto: recién emitido, no hay nada que
          // comprobar.
          verifyToken={restoredPayment}
          onSuccess={() => finishPayment(() => setStep(5))}
          onActivated={() => finishPayment(() => { setActivatedByPromo(true); setStep(5) })}
        />
      )}

      {/* Step 4b — Success (free plan or trial) */}
      {step === 4 && !requiresPayment && (
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
            <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              ¡Cuenta creada!
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Tu organización <strong>{formData.organizationName}</strong> está lista.
            </p>
            {resultTrialActive && (
              <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-3 text-sm text-primary-700 dark:text-primary-300 text-left">
                <p className="font-semibold mb-1">¡Prueba Professional activa por 30 días!</p>
                <p>Acceso completo al plan Professional sin costo durante 30 días.</p>
              </div>
            )}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-sm text-amber-700 dark:text-amber-300 text-left">
              <p className="font-medium mb-1">Revisa tu bandeja de entrada</p>
              <p>
                Te enviamos un email a <strong>{formData.email}</strong> con un enlace para
                verificar tu cuenta. Debes verificarlo antes de iniciar sesión.
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Ir al inicio de sesión
          </button>
        </div>
      )}

      {/* Step 5a — Account activated directly via 100% promo code */}
      {step === 5 && requiresPayment && activatedByPromo && (
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
            <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              ¡Cuenta activada!
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Tu cupón cubrió el 100% del plan y tu cuenta ya está activa — no necesitas
              realizar ningún pago.
            </p>
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-sm text-amber-700 dark:text-amber-300 text-left">
              <p className="font-medium mb-1">Revisa tu bandeja de entrada</p>
              <p>
                Verifica tu email haciendo clic en el enlace que te enviamos a{' '}
                <strong>{formData.email}</strong>. Lo necesitarás para iniciar sesión.
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Ir al inicio de sesión
          </button>
        </div>
      )}

      {/* Step 5b — Payment pending review (paid plans) */}
      {step === 5 && requiresPayment && !activatedByPromo && (
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto">
            <Clock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              ¡Comprobante enviado!
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Estamos revisando tu pago manualmente. Te enviaremos un email a{' '}
              <strong>{formData.email}</strong> en cuanto tu cuenta sea activada.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm text-blue-700 dark:text-blue-300 text-left">
              <p className="font-medium mb-1">Mientras tanto</p>
              <p>
                Verifica tu email haciendo clic en el enlace que te enviamos a{' '}
                <strong>{formData.email}</strong>. Lo necesitarás para iniciar sesión una vez
                que tu cuenta sea activada.
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Ir al inicio de sesión
          </button>
        </div>
      )}
    </AuthLayout>
  )
}
