'use client'

import { useMemo } from 'react'
import { useUiStore } from '@/store/uiStore'
import {
  AMOUNT_DECIMALS,
  BASE_CURRENCY,
  CATALOG_DECIMALS,
  formatMoney,
  formatUsd,
  type Currency,
} from '@/lib/currency'
import { useCurrencyConfig } from './useCurrencyConfig'

export interface DisplayMoney {
  /** Moneda que se está pintando AHORA, ya resuelta y validada contra la tasa. */
  currency: Currency
  /** Se está mostrando una conversión → toca enseñar la leyenda «se cobra en USD». */
  isConverted: boolean
  /** Precio de catálogo: sin céntimos. */
  catalog: (amountUsd: number) => string
  /** Importe que se cobra o se transfiere: 2 decimales. */
  amount: (amountUsd: number) => string
  /** Fuerza una moneda concreta, ignorando la preferencia (lo usan los pasos de Yape). */
  inCurrency: (amountUsd: number, currency: Currency, decimals?: number) => string | null
  penRate: number | null
  isLoading: boolean
}

/**
 * Único punto del Hub que decide en qué moneda se pinta un importe.
 *
 * La moneda efectiva se deriva: preferencia explícita del cliente → defecto que
 * manda el backend → USD. Si sale PEN pero no hay tasa utilizable, cae a USD: es
 * la moneda en la que se cobra, así que siempre es correcta, mientras que un
 * `S/ 0` o un `S/ NaN` serían mentira.
 *
 * Nota para cuando alguien pregunte «cambié el defecto en el Admin y no lo veo»:
 * quien ya eligió moneda a mano conserva su elección para siempre, a propósito.
 */
export function useDisplayCurrency(): DisplayMoney {
  // Selector en vez de desestructurar el store entero: así cambiar el tema no
  // re-renderiza toda la grilla de precios.
  const preference = useUiStore((s) => s.currency)
  const { penRate, defaultCurrency, isLoading } = useCurrencyConfig()

  return useMemo(() => {
    const wanted = preference ?? defaultCurrency ?? BASE_CURRENCY
    const currency: Currency = wanted === 'PEN' && penRate === null ? BASE_CURRENCY : wanted

    return {
      currency,
      isConverted: currency !== BASE_CURRENCY,
      catalog: (usd) =>
        formatUsd(usd, currency, penRate, CATALOG_DECIMALS) ??
        formatMoney(usd, BASE_CURRENCY, CATALOG_DECIMALS),
      amount: (usd) =>
        formatUsd(usd, currency, penRate, AMOUNT_DECIMALS) ??
        formatMoney(usd, BASE_CURRENCY, AMOUNT_DECIMALS),
      inCurrency: (usd, c, decimals = CATALOG_DECIMALS) => formatUsd(usd, c, penRate, decimals),
      penRate,
      isLoading,
    }
  }, [preference, defaultCurrency, penRate, isLoading])
}
