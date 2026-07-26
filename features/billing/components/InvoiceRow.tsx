'use client'

import { Download } from 'lucide-react'
import { AMOUNT_DECIMALS, formatMoney, isCurrency } from '@/lib/currency'
import type { Invoice, InvoiceStatus } from '../types'

const STATUS_CONFIG: Record<InvoiceStatus, { label: string; className: string }> = {
  paid:          { label: 'Pagado',     className: 'bg-green-100 text-green-800' },
  open:          { label: 'Pendiente',  className: 'bg-yellow-100 text-yellow-800' },
  void:          { label: 'Anulado',    className: 'bg-gray-100 text-gray-700' },
  uncollectible: { label: 'Incobrable', className: 'bg-red-100 text-red-800' },
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Importe de la factura en su moneda real.
 *
 * NO pasa por `useDisplayCurrency` a propósito: una factura es un registro de lo
 * que ya se cobró, no un precio de catálogo — el switch de moneda no debe
 * reescribirla. El fallback textual cubre códigos fuera de las monedas soportadas
 * (Stripe puede devolver EUR), donde `Intl` lanzaría.
 */
function formatInvoiceAmount(amount: number, currency: string): string {
  const code = currency.toUpperCase()
  return isCurrency(code)
    ? formatMoney(amount, code, AMOUNT_DECIMALS)
    : `${code} ${amount.toFixed(2)}`
}

interface Props {
  invoice: Invoice
}

export function InvoiceRow({ invoice }: Props) {
  const badge = STATUS_CONFIG[invoice.status] ?? STATUS_CONFIG.open

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3 text-sm text-gray-900">{invoice.number}</td>
      <td className="px-4 py-3 text-sm text-gray-500">
        {formatDate(invoice.period_start)} – {formatDate(invoice.period_end)}
      </td>
      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(invoice.created_at)}</td>
      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
        {formatInvoiceAmount(invoice.amount, invoice.currency)}
        {/* Lo que se transfirió de verdad, con la tasa de ese día. Sin línea cuando
            no hubo conversión: al cliente no le aporta un "sin datos". */}
        {invoice.amount_pen !== null && (
          <div className="text-xs font-normal text-gray-500 mt-0.5">
            Pagaste {formatMoney(invoice.amount_pen, 'PEN', AMOUNT_DECIMALS)}
            {invoice.exchange_rate && <> · tasa {invoice.exchange_rate}</>}
          </div>
        )}
      </td>
      <td className="px-4 py-3">
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}>
          {badge.label}
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        {invoice.pdf_url ? (
          <a
            href={invoice.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:underline"
            aria-label="Descargar PDF"
          >
            <Download className="h-3.5 w-3.5" />
            PDF
          </a>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        )}
      </td>
    </tr>
  )
}
