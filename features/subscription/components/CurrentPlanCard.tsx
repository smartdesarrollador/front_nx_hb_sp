'use client'

import type { CurrentSubscription, RenewalState } from '../types'

interface Props {
  subscription: CurrentSubscription | null
  isLoading: boolean
  canUpgradePlan: boolean
  onChangePlan: () => void
  onRenew: () => void
  onCancelRequest: () => void
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Activo',
  trialing: 'Prueba',
  past_due: 'Pago pendiente',
  canceled: 'Cancelado',
  incomplete: 'Incompleto',
  unpaid: 'Impago',
  pending_payment: 'Pago en revisión',
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  trialing: 'bg-blue-100 text-blue-800',
  past_due: 'bg-red-100 text-red-800',
  canceled: 'bg-gray-100 text-gray-800',
  incomplete: 'bg-yellow-100 text-yellow-800',
  unpaid: 'bg-red-100 text-red-800',
  pending_payment: 'bg-blue-100 text-blue-800',
}

/**
 * Presentación por estado de vencimiento. `renewal_state` lo deriva el backend
 * (services.py::get_renewal_state) para que la UI y el endpoint de pago no puedan
 * discrepar: si aquí se recalculara, el Hub podría ofrecer un botón que el backend
 * rechaza con 400.
 */
const RENEWAL_PRESENTATION: Record<
  RenewalState,
  { banner: string | null; cta: string; ctaAction: 'change' | 'renew' | 'reactivate' }
> = {
  active: { banner: null, cta: 'Cambiar plan', ctaAction: 'change' },
  expiring_soon: {
    banner: 'bg-amber-400/20 border-amber-300 text-amber-50',
    cta: 'Renovar plan',
    ctaAction: 'renew',
  },
  grace: {
    banner: 'bg-red-500/25 border-red-300 text-red-50',
    cta: 'Renovar plan',
    ctaAction: 'renew',
  },
  expired: {
    banner: 'bg-gray-500/25 border-gray-300 text-gray-50',
    cta: 'Reactivar plan',
    ctaAction: 'reactivate',
  },
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function bannerText(subscription: CurrentSubscription): string {
  const days = subscription.days_until_expiry
  switch (subscription.renewal_state) {
    case 'expiring_soon':
      return days !== null && days > 0
        ? `Tu plan vence en ${days} día${days === 1 ? '' : 's'} (${formatDate(subscription.current_period_end)}).`
        : `Tu plan vence hoy (${formatDate(subscription.current_period_end)}).`
    case 'grace':
      return (
        `Tu plan venció el ${formatDate(subscription.current_period_end)}. ` +
        `Tienes hasta el ${formatDate(subscription.grace_until)} para renovar sin perder acceso.`
      )
    case 'expired':
      return 'Tu plan venció y tu cuenta volvió a Free. Tus datos siguen intactos.'
    default:
      return ''
  }
}

export default function CurrentPlanCard({
  subscription,
  isLoading,
  canUpgradePlan,
  onChangePlan,
  onRenew,
  onCancelRequest,
}: Props) {
  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-primary-600 to-indigo-600 rounded-xl p-6 animate-pulse">
        <div className="h-6 bg-white/20 rounded w-1/3 mb-4" />
        <div className="h-4 bg-white/20 rounded w-1/2 mb-2" />
        <div className="h-4 bg-white/20 rounded w-1/4" />
      </div>
    )
  }

  if (!subscription) return null

  const presentation = RENEWAL_PRESENTATION[subscription.renewal_state] ?? RENEWAL_PRESENTATION.active
  const { banner, cta, ctaAction } = presentation

  // Un comprobante en revisión manda sobre el resto: volver a pagar devolvería 409, así
  // que se informa del estado en vez de ofrecer un botón que va a fallar.
  const pendingProof = subscription.has_pending_proof

  const handleCta = () => {
    if (ctaAction === 'renew') onRenew()
    else onChangePlan()
  }

  return (
    <div className="bg-gradient-to-r from-primary-600 to-indigo-600 rounded-xl p-6 text-white space-y-4">
      {subscription.cancel_at_period_end && (
        <div className="bg-yellow-400/20 border border-yellow-300 rounded-lg p-3 text-yellow-100 text-sm">
          Tu suscripción se cancelará el {formatDate(subscription.current_period_end)}
        </div>
      )}

      {pendingProof && (
        <div
          className="bg-sky-400/20 border border-sky-300 rounded-lg p-3 text-sky-50 text-sm"
          role="status"
        >
          <p className="font-semibold">Comprobante en revisión</p>
          <p className="text-white/80">
            Ya recibimos tu pago. Te avisaremos por email en cuanto lo validemos.
          </p>
        </div>
      )}

      {!pendingProof && banner && (
        <div className={`border rounded-lg p-3 text-sm ${banner}`} role="status">
          {bannerText(subscription)}
        </div>
      )}

      {subscription.status === 'trialing' && subscription.plan === 'professional' && (
        <div className="bg-white/15 border border-white/30 rounded-lg p-3 text-white text-sm">
          <p className="font-semibold">Prueba Professional activa</p>
          <p className="text-white/80">Termina el {formatDate(subscription.trial_end)}</p>
        </div>
      )}

      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/70 text-sm">Plan actual</p>
          <h2 className="text-2xl font-bold">{subscription.plan_display}</h2>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[subscription.status] ?? 'bg-gray-100 text-gray-800'}`}
        >
          {STATUS_LABELS[subscription.status] ?? subscription.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-white/70">
            {subscription.renewal_state === 'grace' ? 'Acceso hasta' : 'Próxima renovación'}
          </p>
          <p className="font-medium">
            {formatDate(
              subscription.renewal_state === 'grace'
                ? subscription.grace_until
                : subscription.current_period_end,
            )}
          </p>
        </div>
        <div>
          <p className="text-white/70">
            Facturación {subscription.billing_cycle === 'annual' ? 'anual' : 'mensual'}
          </p>
          <p className="font-medium">
            ${subscription.mrr.toFixed(2)}/{subscription.billing_cycle === 'annual' ? 'año' : 'mes'}
          </p>
        </div>
      </div>

      {canUpgradePlan && (
        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={handleCta}
            disabled={pendingProof}
            className="w-full bg-white text-primary-600 font-semibold py-2 px-4 rounded-lg hover:bg-white/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {pendingProof ? 'Comprobante en revisión' : cta}
          </button>
          {subscription.plan !== 'free' && !subscription.cancel_at_period_end && (
            <button
              onClick={onCancelRequest}
              className="text-sm text-white/70 hover:text-red-300 transition-colors text-center"
            >
              Cancelar suscripción
            </button>
          )}
        </div>
      )}
    </div>
  )
}
