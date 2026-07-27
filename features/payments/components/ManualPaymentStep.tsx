'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { useDisplayCurrency } from '@/hooks/useDisplayCurrency'
import { AMOUNT_DECIMALS, formatMoney } from '@/lib/currency'
import { usePaymentMethods } from '../hooks/usePaymentMethods'
import type { PromoState } from '../hooks/usePromoCode'
import type { PaymentMethodPublic, ProofSubmission } from '../types'
import { MethodSelector } from './MethodSelector'
import { PaymentInstructions } from './PaymentInstructions'
import { PromoCodeField } from './PromoCodeField'
import { ProofDropzone } from './ProofDropzone'

interface Props {
  title: string
  subtitle: string
  plan: string
  /** Precio del plan para el ciclo elegido, antes del cupón. */
  basePrice: number
  isAnnual: boolean
  /** Cabecera opcional entre el título y las instrucciones (el toggle de ciclo). */
  headerSlot?: React.ReactNode
  /**
   * Cierre opcional del paso. Lo usa el registro para el botón de activar con un cupón
   * del 100%, que sustituye al envío del comprobante — ahí no hay nada que subir.
   */
  footerSlot?: React.ReactNode
  promo: PromoState
  isSubmitting: boolean
  /** Error del envío que no sea del cupón (el del cupón lo pinta `PromoCodeField`). */
  errorMessage?: string | null
  /** Datos aún cargando en el padre (planes, tipo de cambio): pinta el esqueleto. */
  isLoadingExtra?: boolean
  onSubmit: (submission: ProofSubmission) => void | Promise<void>
}

/**
 * El paso de pago manual, común al registro y al upgrade/renovación.
 *
 * Antes vivía duplicado en `YapePaymentStep` y `YapeUpgradeStep` —dos copias de ~200
 * líneas de marcado que había que mantener en paralelo—. Lo que cambia entre los dos
 * caminos es la orquestación (token de pago, mutación, rótulos), no la pantalla, así
 * que la pantalla vive aquí y los pasos le pasan lo suyo.
 *
 * El importe se muestra en la moneda en la que cobra el método elegido, no en la que el
 * cliente esté mirando el catálogo: es el número exacto que va a transferir y que debe
 * cuadrar contra su comprobante.
 */
export function ManualPaymentStep({
  title, subtitle, plan, basePrice, isAnnual, headerSlot, footerSlot, promo,
  isSubmitting, errorMessage, isLoadingExtra = false, onSubmit,
}: Props) {
  const { methods, isLoading: methodsLoading } = usePaymentMethods()
  const money = useDisplayCurrency()

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [reference, setReference] = useState('')
  // `null` = todavía no ha elegido; se resuelve al primero de la lista ordenada.
  const [chosen, setChosen] = useState<string | null>(null)

  /**
   * La moneda que el cliente está mirando es la mejor pista de dónde está: quien ve
   * precios en soles cobra en soles. Se ordena por eso, y a igualdad manda el orden que
   * fijó el admin (el backend ya los envía por `sort_order`).
   */
  const ordered = useMemo(() => {
    const preferred = money.currency
    return [...methods].sort((a, b) => {
      const aMatch = a.charge_currency === preferred ? 0 : 1
      const bMatch = b.charge_currency === preferred ? 0 : 1
      return aMatch - bMatch
    })
  }, [methods, money.currency])

  const selected: PaymentMethodPublic | undefined =
    ordered.find((m) => m.method === chosen) ?? ordered[0]

  // Cambiar de método descarta una referencia que pertenecía al otro: pegar el ID de
  // PayPal y luego pasarse a Yape no debe dejar el dato colgando en el envío.
  useEffect(() => {
    setReference('')
  }, [selected?.method])

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])

  const amountUsd = promo.applied?.final_price ?? basePrice
  const isFreeWithPromo = promo.applied !== null && promo.applied.final_price === 0

  /**
   * El importe en soles: exacto, así que no sigue el switch de moneda del Hub. Con
   * cupón manda el `final_price_pen` que calculó el backend — es el que el cliente
   * espera ver en el comprobante. `null` si no hay tipo de cambio: un `?? 3.75` pintaría
   * un importe plausible y equivocado.
   */
  const amountPen = promo.applied?.final_price_pen != null
    ? formatMoney(promo.applied.final_price_pen, 'PEN', AMOUNT_DECIMALS)
    : money.inCurrency(amountUsd, 'PEN', AMOUNT_DECIMALS)

  const periodLabel = isAnnual ? 'año' : 'mes'
  const needsReference = selected?.requires_reference ?? false
  const canSubmit = Boolean(file) && (!needsReference || reference.trim().length > 0)

  function handleFile(picked: File) {
    if (!picked.type.startsWith('image/')) return
    if (preview) URL.revokeObjectURL(preview)
    setFile(picked)
    setPreview(URL.createObjectURL(picked))
  }

  function removeFile() {
    if (preview) URL.revokeObjectURL(preview)
    setFile(null)
    setPreview(null)
  }

  async function handleSubmit() {
    if (!file || !selected || !canSubmit) return
    await onSubmit({
      file,
      method: selected.method,
      transactionReference: reference.trim(),
      promoCode: promo.applied?.code,
    })
  }

  const isLoadingData = methodsLoading || isLoadingExtra

  // Ningún método disponible: el admin los apagó o los dejó sin datos de cobro. Se dice
  // en vez de mostrar un formulario que no lleva a ninguna parte.
  if (!methodsLoading && methods.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20 p-4 text-sm text-amber-800 dark:text-amber-300">
          <p className="font-medium mb-1">Pago no disponible temporalmente</p>
          <p>Por favor contáctanos para coordinar el pago de tu suscripción.</p>
        </div>
      </div>
    )
  }

  const planSummary = (
    <>
      Plan seleccionado: <span className="font-semibold capitalize">{plan}</span>
      {' · '}
      <span className="font-semibold">{isAnnual ? 'anual' : 'mensual'}</span>
      {!isLoadingExtra && (
        promo.applied ? (
          <>
            {' — '}
            <span className="line-through opacity-60">
              ${promo.applied.original_price?.toFixed(2)}
            </span>{' '}
            <span className="font-semibold">${amountUsd.toFixed(2)}/{periodLabel}</span>
          </>
        ) : (
          <> — ${basePrice}/{periodLabel}</>
        )
      )}
    </>
  )

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
      </div>

      {headerSlot}

      {!isFreeWithPromo && (
        <MethodSelector
          methods={ordered}
          selected={selected?.method ?? ''}
          onSelect={setChosen}
        />
      )}

      {isLoadingData || !selected ? (
        <div className="rounded-xl border border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20 p-4 space-y-2 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-4 bg-purple-200 dark:bg-purple-800 rounded w-3/4" />
          ))}
        </div>
      ) : isFreeWithPromo ? (
        <div className="rounded-xl border border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20 p-4">
          <p className="text-sm text-purple-800 dark:text-purple-300">
            Tu cupón cubre el <span className="font-bold">100% del plan</span> — no necesitas
            realizar ningún pago.
          </p>
        </div>
      ) : (
        <PaymentInstructions
          method={selected}
          amountUsd={amountUsd}
          amountPen={amountPen}
          footer={planSummary}
        />
      )}

      <PromoCodeField promo={promo} amountPen={amountPen} isFree={isFreeWithPromo} />

      {!isFreeWithPromo && (
        <>
          <ProofDropzone
            file={file}
            preview={preview}
            onSelect={handleFile}
            onRemove={removeFile}
          />

          {needsReference && (
            <div>
              <label
                htmlFor="transaction-reference"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                ID de transacción
              </label>
              <input
                id="transaction-reference"
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="8XY12345AB"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm font-mono tracking-wider dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {/* Es lo que permite confirmar el pago en el panel de PayPal en vez de
                  fiarse solo de la captura, así que se exige antes de enviar. */}
              <p className="mt-1 text-xs text-gray-400">
                Lo encuentras en el recibo de {selected?.display_name} y en el correo de
                confirmación.
              </p>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-300">
              <AlertCircle className="mt-0.5 w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className="w-full rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Enviando comprobante...' : 'Enviar comprobante'}
          </button>

          <p className="text-center text-xs text-gray-400">
            Tu comprobante será revisado manualmente. Recibirás un email de confirmación.
          </p>
        </>
      )}

      {footerSlot}
    </div>
  )
}
