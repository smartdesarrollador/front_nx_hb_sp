'use client'

import { AlertCircle, Loader2, Tag } from 'lucide-react'
import type { PromoState } from '../hooks/usePromoCode'

interface Props {
  promo: PromoState
  /** Importe en soles ya formateado, o `null` si no aplica a este método. */
  amountPen: string | null
  /** El cupón cubre el 100%: no hay total en soles que enseñar. */
  isFree?: boolean
}

/** Aplicar y quitar el código de descuento, con el desglose del total resultante. */
export function PromoCodeField({ promo, amountPen, isFree = false }: Props) {
  const applied = promo.applied

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
      {!applied ? (
        <>
          <button
            type="button"
            onClick={promo.toggle}
            className="flex items-center gap-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700"
          >
            <Tag className="w-4 h-4" />
            ¿Tienes un código de descuento?
          </button>

          {promo.isOpen && (
            <div className="flex gap-2">
              <input
                type="text"
                value={promo.input}
                onChange={(e) => {
                  promo.setInput(e.target.value.toUpperCase())
                  promo.setError(null)
                }}
                onKeyDown={(e) => { if (e.key === 'Enter') promo.apply() }}
                placeholder="CODIGO"
                className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm font-mono uppercase tracking-wider dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="button"
                onClick={promo.apply}
                disabled={!promo.input.trim() || promo.isValidating}
                className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {promo.isValidating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Aplicar
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="font-mono text-sm font-bold text-gray-900 dark:text-white">
                {applied.code}
              </span>
              <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                aplicado
              </span>
            </div>
            <button
              type="button"
              onClick={promo.remove}
              className="text-xs text-gray-500 hover:text-red-600 dark:text-gray-400"
            >
              Quitar
            </button>
          </div>
          <div className="text-sm space-y-0.5">
            <p className="text-gray-500 dark:text-gray-400">
              Plan: <span className="line-through">${applied.original_price?.toFixed(2)}</span>
            </p>
            <p className="text-green-600 dark:text-green-400">
              Descuento: −${applied.discount_amount?.toFixed(2)}
            </p>
            <p className="font-semibold text-gray-900 dark:text-white">
              Total: ${applied.final_price?.toFixed(2)} USD
              {!isFree && (
                <span className="font-normal text-gray-500 dark:text-gray-400">
                  {amountPen && <>{' '}({amountPen})</>}
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      {promo.error && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 p-2.5 text-xs text-red-700 dark:text-red-300">
          <AlertCircle className="mt-0.5 w-3.5 h-3.5 flex-shrink-0" />
          <span>{promo.error}</span>
        </div>
      )}
    </div>
  )
}
