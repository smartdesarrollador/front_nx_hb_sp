import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { useUiStore } from '@/store/uiStore'
import CurrencySwitch from '../CurrencySwitch'

const config = vi.hoisted(() => ({ penRate: 3.75 as number | null }))

vi.mock('@/hooks/useCurrencyConfig', () => ({
  useCurrencyConfig: () => ({
    penRate: config.penRate,
    defaultCurrency: 'USD',
    isLoading: false,
    isError: false,
  }),
}))

// Spread del módulo real: `i18n/config` (que importa uiStore) necesita
// `initReactI18next`, así que solo se sustituye `useTranslation`.
vi.mock('react-i18next', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-i18next')>()),
  useTranslation: () => ({ t: (key: string) => key }),
}))

describe('CurrencySwitch', () => {
  beforeEach(() => {
    config.penRate = 3.75
    useUiStore.setState({ currency: null })
    localStorage.clear()
  })

  it('no se renderiza si no hay tipo de cambio utilizable', () => {
    // Ofrecer una elección que no se puede honrar es peor que no ofrecerla.
    config.penRate = null

    const { container } = render(<CurrencySwitch />)

    expect(container.firstChild).toBeNull()
  })

  it('marca la moneda vigente en la variante de la landing', () => {
    render(<CurrencySwitch />)

    expect(screen.getByRole('button', { name: 'USD' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'S/' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('guarda y recuerda la elección del cliente', () => {
    render(<CurrencySwitch />)

    fireEvent.click(screen.getByRole('button', { name: 'S/' }))

    expect(useUiStore.getState().currency).toBe('PEN')
    expect(localStorage.getItem('hub-currency')).toBe('PEN')
  })

  it('la variante compacta alterna entre las dos monedas', () => {
    render(<CurrencySwitch variant="compact" />)

    const button = screen.getByRole('button', { name: 'currencySwitchAria' })
    expect(button).toHaveTextContent('USD')

    fireEvent.click(button)

    expect(useUiStore.getState().currency).toBe('PEN')
  })
})
