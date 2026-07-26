'use client'

import { useDisplayCurrency } from '@/hooks/useDisplayCurrency'
import { AMOUNT_DECIMALS, CATALOG_DECIMALS, type Currency } from '@/lib/currency'

interface Props {
  /** Siempre en USD: es la moneda base y la única en la que se cobra. */
  usd: number
  /** `catalog` = precio de lista (sin céntimos) · `amount` = lo que se cobra (2 decimales). */
  kind?: 'catalog' | 'amount'
  /** Fuerza la moneda ignorando el switch (los pasos de Yape muestran el sol exacto). */
  currency?: Currency
}

/**
 * Único punto del Hub que convierte y formatea un precio.
 *
 * Devuelve un Fragment con un solo nodo de texto, sin elemento envolvente: se deja
 * caer dentro del markup existente sin alterar las clases de tipografía ni el
 * `textContent` que buscan los tests.
 */
export default function Price({ usd, kind = 'catalog', currency }: Props) {
  const money = useDisplayCurrency()

  if (currency) {
    const decimals = kind === 'amount' ? AMOUNT_DECIMALS : CATALOG_DECIMALS
    return <>{money.inCurrency(usd, currency, decimals) ?? ''}</>
  }

  return <>{kind === 'amount' ? money.amount(usd) : money.catalog(usd)}</>
}
