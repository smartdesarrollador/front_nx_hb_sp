'use client'

import { CreditCard, Smartphone } from 'lucide-react'
import type { PaymentMethodPublic } from '../types'

interface Props {
  methods: PaymentMethodPublic[]
  selected: string
  onSelect: (method: string) => void
}

/**
 * Elección del método de pago. No se pinta cuando solo hay uno: una elección sin
 * alternativa es ruido en un formulario que ya es largo.
 */
export function MethodSelector({ methods, selected, onSelect }: Props) {
  if (methods.length < 2) return null

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        ¿Cómo prefieres pagar?
      </legend>
      <div className="grid grid-cols-2 gap-2">
        {methods.map((method) => {
          const isSelected = method.method === selected
          const Icon = method.charge_currency === 'PEN' ? Smartphone : CreditCard
          return (
            <button
              key={method.method}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(method.method)}
              className={[
                'flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition-colors',
                isSelected
                  ? 'border-purple-500 bg-purple-50 text-purple-900 dark:bg-purple-900/20 dark:text-purple-200'
                  : 'border-gray-200 text-gray-600 hover:border-purple-300 dark:border-gray-700 dark:text-gray-300',
              ].join(' ')}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {method.display_name}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
