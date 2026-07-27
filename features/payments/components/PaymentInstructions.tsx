'use client'

import { CreditCard, ExternalLink, Smartphone } from 'lucide-react'
import { AMOUNT_DECIMALS, formatMoney } from '@/lib/currency'
import { buildPaypalUrl } from '../paypal-link'
import type { PaymentMethodPublic } from '../types'

interface Props {
  method: PaymentMethodPublic
  /** Importe final a pagar, ya con el descuento aplicado si lo hay. */
  amountUsd: number
  /**
   * Importe en soles ya formateado, o `null` si no hay tipo de cambio utilizable.
   * Solo se usa en los métodos que cobran en soles.
   */
  amountPen: string | null
  /** Resumen del plan y el ciclo: cierra el bloque, separado por una línea. */
  footer?: React.ReactNode
}

/**
 * Instrucciones de pago del método elegido.
 *
 * La moneda de cada bloque la manda `charge_currency`, no el código del método: quien
 * paga por Yape transfiere **soles** y compara el importe contra su app, mientras que
 * quien paga por PayPal mueve **dólares** y su recibo está en dólares. Poner un
 * «≈ S/ …» al lado de un pago en dólares invita a comparar contra un número que no
 * aparece en ninguna parte del comprobante.
 */
export function PaymentInstructions({ method, amountUsd, amountPen, footer }: Props) {
  const isPen = method.charge_currency === 'PEN'
  const Icon = isPen ? Smartphone : CreditCard
  const paypalUrl = method.checkout_url ? buildPaypalUrl(method.checkout_url, amountUsd) : null
  const usdLabel = formatMoney(amountUsd, 'USD', AMOUNT_DECIMALS)

  return (
    <div className="rounded-xl border border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
        <p className="text-sm font-semibold text-purple-900 dark:text-purple-200">
          Instrucciones de pago
        </p>
      </div>

      {isPen ? (
        <ol className="pl-4 space-y-1.5 text-sm text-purple-800 dark:text-purple-300 list-decimal">
          <li>Abre {method.display_name} en tu celular</li>
          <li>
            {amountPen ? (
              <>
                Envía{' '}
                <span className="font-bold text-purple-900 dark:text-purple-100">
                  {amountPen}
                </span>{' '}
                (aprox. {usdLabel} USD) al número:
              </>
            ) : (
              <>
                Envía{' '}
                <span className="font-bold text-purple-900 dark:text-purple-100">
                  {usdLabel} USD
                </span>{' '}
                al número:{' '}
                <span className="block text-xs mt-1 opacity-80">
                  No pudimos calcular el importe en soles; usa el tipo de cambio de tu banco.
                </span>
              </>
            )}
          </li>
          <li className="font-mono font-bold text-base tracking-wider text-purple-900 dark:text-purple-100">
            {method.phone || '—'}
          </li>
          <li>
            Titular:{' '}
            <span className="font-semibold text-purple-900 dark:text-purple-100">
              {method.holder_name || '—'}
            </span>
          </li>
          <li>Toma screenshot del comprobante y súbelo abajo</li>
        </ol>
      ) : (
        <ol className="pl-4 space-y-1.5 text-sm text-purple-800 dark:text-purple-300 list-decimal">
          <li>
            Paga{' '}
            <span className="font-bold text-purple-900 dark:text-purple-100">
              {usdLabel} USD
            </span>{' '}
            desde tu cuenta de {method.display_name}
          </li>
          {paypalUrl ? (
            <li>
              {/* El importe ya va en el enlace cuando el destino lo admite, para que no
                  haya que teclearlo. Aun así el backend recalcula el monto. */}
              <a
                href={paypalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-purple-700"
              >
                Pagar en {method.display_name}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </li>
          ) : null}
          {method.account_email && (
            <li>
              {paypalUrl ? 'O envía el pago a: ' : 'Envía el pago a: '}
              <span className="font-semibold text-purple-900 dark:text-purple-100 break-all">
                {method.account_email}
              </span>
            </li>
          )}
          {method.holder_name && (
            <li>
              Titular:{' '}
              <span className="font-semibold text-purple-900 dark:text-purple-100">
                {method.holder_name}
              </span>
            </li>
          )}
          <li>Sube la captura del recibo y pega el ID de la transacción</li>
        </ol>
      )}

      {method.instructions_note && (
        <p className="text-xs text-purple-700 dark:text-purple-300 pt-2 border-t border-purple-200 dark:border-purple-700">
          {method.instructions_note}
        </p>
      )}

      {footer && (
        <p className="text-xs text-purple-600 dark:text-purple-400 pt-1 border-t border-purple-200 dark:border-purple-700">
          {footer}
        </p>
      )}
    </div>
  )
}
