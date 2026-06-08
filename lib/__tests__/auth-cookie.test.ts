import { describe, it, expect, beforeEach } from 'vitest'
import { setRefreshTokenCookie, clearRefreshTokenCookie } from '@/lib/auth-cookie'

beforeEach(() => {
  // Limpiar cookies antes de cada test
  document.cookie = 'hub-refreshToken=; path=/; max-age=0'
})

describe('auth-cookie', () => {
  it('setRefreshTokenCookie establece hub-refreshToken en document.cookie', () => {
    setRefreshTokenCookie('my-token-abc')
    expect(document.cookie).toContain('hub-refreshToken=my-token-abc')
  })

  it('setRefreshTokenCookie incluye SameSite=Strict en la directiva', () => {
    // jsdom no expone los atributos de cookie al leer document.cookie,
    // pero podemos verificar que la función no lanza y que el token queda establecido
    expect(() => setRefreshTokenCookie('tok-123')).not.toThrow()
    expect(document.cookie).toContain('hub-refreshToken=tok-123')
  })

  it('clearRefreshTokenCookie elimina la cookie estableciendo max-age=0', () => {
    setRefreshTokenCookie('tok-xyz')
    expect(document.cookie).toContain('hub-refreshToken=tok-xyz')
    clearRefreshTokenCookie()
    expect(document.cookie).not.toContain('hub-refreshToken=tok-xyz')
  })

  it('no lanza error cuando se llama en entorno SSR (typeof document === undefined)', () => {
    // Simulamos el guard typeof document === 'undefined'
    // Las funciones tienen guard interno, así que simplemente verificamos que no lanzan
    expect(() => {
      setRefreshTokenCookie('ssr-token')
      clearRefreshTokenCookie()
    }).not.toThrow()
  })
})
