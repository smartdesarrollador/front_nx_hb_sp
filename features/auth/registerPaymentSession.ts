import type { BillingCycle } from '@/features/subscription/types'

/**
 * Estado mínimo para poder volver al paso de pago del registro tras un refresco o un
 * back accidental. Al pulsar "Crear cuenta" la cuenta YA existe (tenant + usuario +
 * Subscription en pending_payment), pero el `payment_upload_token` vivía solo en el
 * estado de React: perder la página dejaba al cliente con una cuenta sin pagar y sin
 * camino de vuelta.
 *
 * `sessionStorage` y no `localStorage` a propósito: el alcance correcto es la pestaña,
 * igual que el wizard. Sobrevivir al cierre de la pestaña dejaría el estado colgando
 * días en otras pestañas; ese caso lo cubre el aviso de "pago pendiente" de la página
 * de Suscripción, que además funciona desde otro dispositivo.
 */
export interface RegisterPaymentSession {
  token: string
  plan: string
  cycle: BillingCycle
  email: string
  organizationName: string
  savedAt: number
}

const STORAGE_KEY = 'hub-register-payment'

/** Espejo de PAYMENT_UPLOAD_TTL (apps/auth_app/tokens.py). La verdad la tiene el
 *  backend (`/auth/payment-token-status`); esto solo evita rehidratar lo obviamente
 *  caducado sin pedir nada. */
const MAX_AGE_MS = 24 * 60 * 60 * 1000

export function saveRegisterPaymentSession(
  data: Omit<RegisterPaymentSession, 'savedAt'>,
): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...data, savedAt: Date.now() } satisfies RegisterPaymentSession),
    )
  } catch {
    // Storage lleno o bloqueado (modo privado): el registro debe seguir funcionando
    // igual, solo se pierde la posibilidad de rehidratar.
  }
}

/**
 * Devuelve `null` ante cualquier anomalía —sin valor, JSON corrupto, campos que no
 * cuadran, demasiado viejo—. `/register` es la puerta de entrada: no puede romperse por
 * un valor basura en el storage.
 */
export function loadRegisterPaymentSession(): RegisterPaymentSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as Partial<RegisterPaymentSession>
    if (typeof parsed?.token !== 'string' || !parsed.token) return null
    if (typeof parsed?.plan !== 'string' || !parsed.plan) return null
    if (typeof parsed?.savedAt !== 'number') return null
    if (Date.now() - parsed.savedAt > MAX_AGE_MS) return null

    return {
      token: parsed.token,
      plan: parsed.plan,
      cycle: parsed.cycle === 'annual' ? 'annual' : 'monthly',
      email: typeof parsed.email === 'string' ? parsed.email : '',
      organizationName:
        typeof parsed.organizationName === 'string' ? parsed.organizationName : '',
      savedAt: parsed.savedAt,
    }
  } catch {
    return null
  }
}

export function clearRegisterPaymentSession(): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // idem: nunca debe tumbar el flujo
  }
}
