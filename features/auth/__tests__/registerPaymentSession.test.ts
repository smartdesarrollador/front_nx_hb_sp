import { describe, it, expect, beforeEach } from 'vitest'
import {
  clearRegisterPaymentSession,
  loadRegisterPaymentSession,
  saveRegisterPaymentSession,
} from '@/features/auth/registerPaymentSession'

const KEY = 'hub-register-payment'

const sample = {
  token: 'tok-123',
  plan: 'professional',
  cycle: 'annual' as const,
  email: 'cliente@test.com',
  organizationName: 'Mi Empresa',
}

describe('registerPaymentSession', () => {
  beforeEach(() => sessionStorage.clear())

  it('guarda y recupera lo necesario para volver al paso de pago', () => {
    saveRegisterPaymentSession(sample)

    expect(loadRegisterPaymentSession()).toMatchObject(sample)
  })

  it('sin nada guardado devuelve null', () => {
    expect(loadRegisterPaymentSession()).toBeNull()
  })

  it('con JSON corrupto devuelve null en vez de romper /register', () => {
    sessionStorage.setItem(KEY, '{no es json')

    expect(loadRegisterPaymentSession()).toBeNull()
  })

  it('descarta lo guardado sin token', () => {
    sessionStorage.setItem(KEY, JSON.stringify({ plan: 'starter', savedAt: Date.now() }))

    expect(loadRegisterPaymentSession()).toBeNull()
  })

  it('descarta lo guardado hace más de un día', () => {
    // El backend caduca el token a las 24h: rehidratar algo más viejo solo llevaría a
    // un paso muerto.
    const twoDaysAgo = Date.now() - 48 * 60 * 60 * 1000
    sessionStorage.setItem(KEY, JSON.stringify({ ...sample, savedAt: twoDaysAgo }))

    expect(loadRegisterPaymentSession()).toBeNull()
  })

  it('un ciclo desconocido cae a mensual', () => {
    sessionStorage.setItem(KEY, JSON.stringify({ ...sample, cycle: 'weekly', savedAt: Date.now() }))

    expect(loadRegisterPaymentSession()?.cycle).toBe('monthly')
  })

  it('clear borra lo guardado', () => {
    saveRegisterPaymentSession(sample)
    clearRegisterPaymentSession()

    expect(loadRegisterPaymentSession()).toBeNull()
  })
})
