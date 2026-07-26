'use client'

import { useTranslation } from 'react-i18next'
import { Coins } from 'lucide-react'
import { useDisplayCurrency } from '@/hooks/useDisplayCurrency'
import { useUiStore } from '@/store/uiStore'
import { SUPPORTED_CURRENCIES, type Currency } from '@/lib/currency'

const LABELS: Record<Currency, string> = { USD: 'USD', PEN: 'S/' }

// Clases espejo del selector ES/EN de LandingNavbar, para que las dos píldoras se
// lean como un solo grupo de preferencias.
const PILL_WRAPPER =
  'flex items-center bg-[rgba(11,39,64,0.10)] dark:bg-[rgba(234,241,248,0.10)] ' +
  'rounded-full p-0.5 text-xs font-semibold'
const PILL_BASE = 'px-3 py-1 rounded-full transition-colors'
const PILL_ACTIVE = 'bg-primary-600 text-white'
const PILL_INACTIVE =
  'text-[rgba(11,39,64,0.66)] hover:text-[#0B2740] ' +
  'dark:text-[rgba(234,241,248,0.72)] dark:hover:text-[#EAF1F8]'

// Clases espejo de LanguageSwitcher, para el navbar del área autenticada.
const COMPACT =
  'flex items-center gap-1 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ' +
  'text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors'

interface Props {
  /** `pill` = landing (gemela del selector ES/EN) · `compact` = navbar autenticado. */
  variant?: 'pill' | 'compact'
}

/**
 * Selector de moneda.
 *
 * No se renderiza si no hay tipo de cambio utilizable: un switch que no puede
 * honrarse es peor que ninguno — misma regla que el toggle de ciclo cuando no hay
 * ahorro anual que anunciar.
 *
 * Ese guard tiene un efecto valioso que conviene no "optimizar": en SSR y en el
 * primer render del cliente la query aún no ha resuelto, así que el switch no está
 * en el HTML del servidor y no hay desajuste de hidratación por leer la
 * preferencia de localStorage.
 */
export default function CurrencySwitch({ variant = 'pill' }: Props) {
  const { t } = useTranslation('common')
  const money = useDisplayCurrency()
  const setCurrency = useUiStore((s) => s.setCurrency)

  if (money.penRate === null) return null

  if (variant === 'compact') {
    const next: Currency = money.currency === 'USD' ? 'PEN' : 'USD'
    return (
      <button
        onClick={() => setCurrency(next)}
        aria-label={t('currencySwitchAria')}
        className={COMPACT}
      >
        <Coins className="w-4 h-4" />
        <span>{LABELS[money.currency]}</span>
      </button>
    )
  }

  return (
    <div className={PILL_WRAPPER} role="group" aria-label={t('currencySwitchAria')}>
      {SUPPORTED_CURRENCIES.map((currency) => (
        <button
          key={currency}
          onClick={() => setCurrency(currency)}
          aria-pressed={money.currency === currency}
          className={`${PILL_BASE} ${money.currency === currency ? PILL_ACTIVE : PILL_INACTIVE}`}
        >
          {LABELS[currency]}
        </button>
      ))}
    </div>
  )
}
