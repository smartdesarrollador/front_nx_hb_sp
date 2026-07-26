'use client'

import { useQuery } from '@tanstack/react-query'
import { publicClient } from '@/lib/axios'
import { parseRate, type Currency } from '@/lib/currency'

export interface PublicCurrencyConfig {
  base_currency: Currency
  supported_currencies: Currency[]
  /** `Record<string, _>` a propósito: el backend documenta la forma como extensible a N monedas. */
  rates: Record<string, string>
  default_display_currency: Currency
  updated_at: string | null
}

/**
 * Configuración de moneda de la plataforma.
 *
 * Vive en `hooks/` y no en una feature porque lo consumen landing, registro,
 * suscripción y dashboard. La queryKey es única, así que TanStack deduplica y solo
 * se hace un GET por sesión.
 */
export function useCurrencyConfig() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['public-currency'],
    queryFn: () =>
      publicClient.get<PublicCurrencyConfig>('/public/currency/').then((r) => r.data),
    // Mismo TTL que la caché del backend (utils/currency.CURRENCY_CACHE_TTL = 300s):
    // pedirlo más a menudo no traería un valor más fresco.
    staleTime: 5 * 60 * 1000,
  })

  return {
    /** Ya parseado: ningún consumidor debería tocar el string de 4 decimales. */
    penRate: parseRate(data?.rates?.PEN),
    /** `null` mientras no se conozca: el resolutor cae a USD en vez de adivinar. */
    defaultCurrency: data?.default_display_currency ?? null,
    isLoading,
    isError,
  }
}
