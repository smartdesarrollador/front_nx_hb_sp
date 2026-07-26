import { describe, it, expect, beforeEach, vi } from 'vitest'

/**
 * `uiStore` lee localStorage en el ámbito del módulo, así que cada caso tiene que
 * sembrar el valor y volver a importar el módulo con la caché limpia.
 */
async function loadStore() {
  vi.resetModules()
  const mod = await import('@/store/uiStore')
  return mod.useUiStore
}

describe('uiStore — preferencia de moneda', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('arranca sin preferencia cuando el cliente no ha elegido', async () => {
    const useUiStore = await loadStore()

    // `null`, no 'USD': es lo que permite que mande el defecto del backend.
    expect(useUiStore.getState().currency).toBeNull()
  })

  it('recupera la preferencia guardada', async () => {
    localStorage.setItem('hub-currency', 'PEN')

    const useUiStore = await loadStore()

    expect(useUiStore.getState().currency).toBe('PEN')
  })

  it('ignora un valor manipulado en localStorage', async () => {
    localStorage.setItem('hub-currency', 'EUR')

    const useUiStore = await loadStore()

    expect(useUiStore.getState().currency).toBeNull()
  })

  it('persiste la elección del cliente', async () => {
    const useUiStore = await loadStore()

    useUiStore.getState().setCurrency('PEN')

    expect(useUiStore.getState().currency).toBe('PEN')
    expect(localStorage.getItem('hub-currency')).toBe('PEN')
  })
})
