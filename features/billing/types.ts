export type PaymentMethodType =
  | 'card'
  | 'paypal'
  | 'mercadopago'
  | 'yape'
  | 'plin'
  | 'nequi'
  | 'daviplata'

export interface PaymentMethod {
  id: string
  type: PaymentMethodType
  brand: string
  last4: string | null
  exp_month: number | null
  exp_year: number | null
  is_default: boolean
  card_type: string | null
  phone_number: string | null
}

export type InvoiceStatus = 'paid' | 'open' | 'void' | 'uncollectible'

export interface Invoice {
  id: string
  number: string
  amount: number
  currency: string
  /** Tasa USD→PEN del momento del pago. `null` si no hubo conversión registrada. */
  exchange_rate: string | null
  /** Soles efectivamente transferidos. Dato histórico: no sigue el switch de moneda. */
  amount_pen: number | null
  status: InvoiceStatus
  created_at: string
  period_start: string
  period_end: string
  pdf_url: string | null
}
