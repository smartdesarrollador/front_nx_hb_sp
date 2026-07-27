/**
 * Construcción del enlace de pago de PayPal.
 *
 * PayPal.me admite el importe en la propia ruta (`paypal.me/empresa/19.00USD`), lo que
 * le ahorra al cliente teclearlo — que es donde aparecen los pagos de más y de menos que
 * luego hay que reconciliar a mano.
 *
 * Dos cautelas:
 *
 * 1. **Solo se toca si es paypal.me.** El admin puede haber guardado otra cosa (un
 *    enlace de pago de PayPal Business, un botón). Añadirle un segmento a esa URL la
 *    rompería, y el cliente se quedaría sin poder pagar: ante la duda, se abre tal cual.
 * 2. **El importe del enlace no es vinculante.** El cliente puede cambiarlo en PayPal y
 *    el backend recalcula el monto de todos modos. Esto reduce errores de tecleo; no
 *    sustituye a la verificación del comprobante.
 */

const PAYPAL_ME_HOSTS = ['paypal.me', 'www.paypal.me']

/**
 * `checkoutUrl` con el importe incorporado si se puede, o intacta si no.
 * Devuelve `null` cuando no hay enlace que abrir.
 */
export function buildPaypalUrl(checkoutUrl: string, amountUsd: number): string | null {
  const trimmed = checkoutUrl.trim()
  if (!trimmed) return null

  let url: URL
  try {
    url = new URL(trimmed)
  } catch {
    // URL que el navegador no sabe leer: se devuelve tal cual y que decida el enlace.
    return trimmed
  }

  if (!PAYPAL_ME_HOSTS.includes(url.hostname.toLowerCase())) return trimmed
  if (!Number.isFinite(amountUsd) || amountUsd <= 0) return trimmed

  // `paypal.me/empresa` y `paypal.me/empresa/` deben dar el mismo resultado.
  const path = url.pathname.replace(/\/+$/, '')
  // Sin usuario en la ruta no hay a quién pagarle; añadir el importe no lo arregla.
  if (!path || path === '/') return trimmed

  // Si ya trae un importe (el admin lo puso a mano), manda el suyo.
  if (/\/\d+(\.\d+)?[A-Z]{3}$/i.test(path)) return trimmed

  url.pathname = `${path}/${amountUsd.toFixed(2)}USD`
  return url.toString()
}
