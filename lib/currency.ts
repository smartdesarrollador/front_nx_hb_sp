/**
 * Conversión y formato USD → PEN.
 *
 * USD es la moneda base y la ÚNICA que se cobra: los precios de los planes, las
 * facturas y los comprobantes de pago están todos en dólares (ver
 * `utils/currency.py` en el backend). Este módulo solo decide cómo se PINTA un
 * importe — ningún valor que salga de aquí se envía al servidor.
 *
 * OJO: hay un gemelo en el Admin (`apps/frontend_admin/src/lib/currency.ts`), que
 * además valida el rango del tipo de cambio al editarlo. Son apps independientes,
 * cada una con su Docker y sin paquete compartido, así que la duplicación es
 * deliberada — igual que la de `features/subscription/plans-data.ts`. Si cambias
 * una fórmula aquí, cámbiala allí.
 */

export const BASE_CURRENCY = 'USD'
export const SUPPORTED_CURRENCIES = ['USD', 'PEN'] as const
export type Currency = (typeof SUPPORTED_CURRENCIES)[number]

/**
 * Un precio de catálogo con céntimos comunica una precisión que no existe: es una
 * referencia, no lo que se cobra. Un importe a transferir, en cambio, se teclea
 * exacto — redondearlo a soles enteros haría que el comprobante no cuadre.
 */
export const CATALOG_DECIMALS = 0
export const AMOUNT_DECIMALS = 2

const LOCALES: Record<Currency, string> = { USD: 'en-US', PEN: 'es-PE' }

// La grilla de planes formatea varias veces por render; construir un
// Intl.NumberFormat es caro comparado con formatear.
const formatters = new Map<string, Intl.NumberFormat>()

/** Half-up explícito: la regla queda testeable en vez de depender del redondeo interno de Intl. */
function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

export function isCurrency(value: unknown): value is Currency {
  return SUPPORTED_CURRENCIES.includes(value as Currency)
}

/**
 * Convierte a número el tipo de cambio que llega del backend como string de 4
 * decimales. Devuelve `null` ante cualquier valor no utilizable — vacío, basura,
 * cero o negativo — y **nunca** un valor por defecto: un `?? 3.75` pintaría un
 * precio falso con total confianza.
 */
export function parseRate(raw: string | number | null | undefined): number | null {
  if (raw === null || raw === undefined || raw === '') return null
  const parsed = typeof raw === 'number' ? raw : Number(raw)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

/** Importe en USD → su equivalente con la tasa dada. `null` si no hay tasa utilizable. */
export function convertUsd(amountUsd: number, rate: number | null): number | null {
  if (rate === null || !Number.isFinite(amountUsd)) return null
  return amountUsd * rate
}

/**
 * Importe formateado con el símbolo de su moneda.
 *
 * `Intl` inserta un espacio duro (U+00A0) entre "S/" y el número; se normaliza a
 * espacio normal para que copiar el valor no arrastre un carácter invisible y para
 * que los tests se lean `'S/ 296'` en vez de un escape.
 */
export function formatMoney(
  amount: number,
  currency: Currency,
  decimals: number = CATALOG_DECIMALS,
): string {
  const key = `${currency}:${decimals}`
  let formatter = formatters.get(key)
  if (!formatter) {
    formatter = new Intl.NumberFormat(LOCALES[currency], {
      style: 'currency',
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
    formatters.set(key, formatter)
  }
  return formatter.format(roundTo(amount, decimals)).replace(/\u00A0/g, ' ')
}

/**
 * El caso de uso del Hub: «píntame este precio en la moneda que el cliente eligió».
 * USD es el caso trivial y no necesita tasa.
 *
 * Devuelve `null` cuando se pide PEN sin tasa utilizable. El llamador decide qué
 * hacer — `useDisplayCurrency` cae a USD, los pasos de Yape omiten la línea y
 * avisan. Nunca un `?? 3.75`: en una pantalla de precios un valor por defecto
 * pinta una mentira con total confianza.
 */
export function formatUsd(
  amountUsd: number,
  currency: Currency,
  rate: number | null,
  decimals: number = CATALOG_DECIMALS,
): string | null {
  if (currency === BASE_CURRENCY) return formatMoney(amountUsd, BASE_CURRENCY, decimals)
  const converted = convertUsd(amountUsd, rate)
  return converted === null ? null : formatMoney(converted, currency, decimals)
}
