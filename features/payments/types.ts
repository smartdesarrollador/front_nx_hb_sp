import type { Currency } from '@/lib/currency'

/**
 * Un método de pago manual tal como lo publica el backend
 * (`GET /public/payment-methods/`). Solo llegan los que se pueden pagar de verdad:
 * habilitados y con su dato de destino.
 *
 * Los campos que no aplican a un método vienen vacíos en vez de ausentes, así que leer
 * la respuesta no obliga a ramificar por método.
 */
export interface PaymentMethodPublic {
  method: string
  display_name: string
  /**
   * Moneda en la que se mueve el dinero: Yape mueve soles, PayPal dólares. La decide
   * el backend y **no se deduce del código del método** — así un método nuevo se
   * comporta bien sin desplegar el Hub.
   */
  charge_currency: Currency
  /** Si hay que pedirle al cliente la referencia de la transacción (ID de PayPal). */
  requires_reference: boolean
  holder_name: string
  /** Yape */
  phone: string
  /** PayPal */
  checkout_url: string
  account_email: string
  instructions_note: string
}

/** Lo que el paso de pago entrega al enviar el comprobante. */
export interface ProofSubmission {
  file: File
  method: string
  transactionReference: string
  promoCode?: string
}
