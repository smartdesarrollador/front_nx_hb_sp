import { describe, it, expect } from 'vitest'
import { buildPaypalUrl } from '../paypal-link'

describe('buildPaypalUrl', () => {
  it('incorpora el importe a un enlace de paypal.me', () => {
    expect(buildPaypalUrl('https://paypal.me/miempresa', 19)).toBe(
      'https://paypal.me/miempresa/19.00USD',
    )
  })

  it('trata igual el enlace con barra final', () => {
    expect(buildPaypalUrl('https://paypal.me/miempresa/', 79)).toBe(
      'https://paypal.me/miempresa/79.00USD',
    )
  })

  it('usa el importe con descuento, que es el que se va a pagar', () => {
    expect(buildPaypalUrl('https://paypal.me/miempresa', 63.2)).toBe(
      'https://paypal.me/miempresa/63.20USD',
    )
  })

  it('deja intacta una URL que no sea de paypal.me', () => {
    // Añadirle un segmento a un enlace de pago de PayPal Business lo rompería, y el
    // cliente se quedaría sin poder pagar. Ante la duda, no se toca.
    const url = 'https://www.paypal.com/paypalme/otro-formato'
    expect(buildPaypalUrl(url, 19)).toBe(url)
  })

  it('respeta el importe que el admin puso a mano en el enlace', () => {
    const url = 'https://paypal.me/miempresa/50.00USD'
    expect(buildPaypalUrl(url, 19)).toBe(url)
  })

  it('no inventa un enlace cuando no hay a quién pagarle', () => {
    expect(buildPaypalUrl('https://paypal.me', 19)).toBe('https://paypal.me')
    expect(buildPaypalUrl('   ', 19)).toBeNull()
  })

  it('devuelve la URL tal cual si el importe no es utilizable', () => {
    expect(buildPaypalUrl('https://paypal.me/miempresa', 0)).toBe('https://paypal.me/miempresa')
    expect(buildPaypalUrl('https://paypal.me/miempresa', NaN)).toBe('https://paypal.me/miempresa')
  })

  it('no revienta con algo que no sea una URL', () => {
    expect(buildPaypalUrl('paypal.me/miempresa', 19)).toBe('paypal.me/miempresa')
  })
})
