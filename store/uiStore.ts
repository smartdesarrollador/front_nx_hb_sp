import { create } from 'zustand'
import i18n from '@/i18n/config'
import { isCurrency, type Currency } from '@/lib/currency'

type Language = 'es' | 'en'

interface UiState {
  darkMode: boolean
  language: Language
  /**
   * Preferencia EXPLÍCITA de moneda. `null` = el cliente no ha elegido, así que
   * manda `default_display_currency` del backend. Sin este tri-estado no se
   * distinguiría "eligió dólares" de "no ha elegido", y quien nunca tocase el
   * switch se quedaría anclado al defecto del día en que se registró.
   * La moneda que se pinta se deriva en `useDisplayCurrency`, no aquí.
   */
  currency: Currency | null
  toggleDarkMode: () => void
  setLanguage: (lang: Language) => void
  setCurrency: (currency: Currency) => void
}

const getInitialDarkMode = (): boolean => {
  try { return localStorage.getItem('hub-theme') === 'dark' } catch { return false }
}

const getInitialLanguage = (): Language => {
  try {
    const lang = localStorage.getItem('hub-lang')
    return lang === 'en' ? 'en' : 'es'
  } catch { return 'es' }
}

const getInitialCurrency = (): Currency | null => {
  try {
    // `isCurrency` y no una comparación suelta: un valor manipulado en localStorage
    // no debe llegar al formateador.
    const stored = localStorage.getItem('hub-currency')
    return isCurrency(stored) ? stored : null
  } catch { return null }
}

const syncDarkMode = (enabled: boolean) => {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', enabled)
  try { localStorage.setItem('hub-theme', enabled ? 'dark' : 'light') } catch { /* ignore */ }
}

// Apply initial dark mode class before first render (browser only)
if (typeof document !== 'undefined') syncDarkMode(getInitialDarkMode())

export const useUiStore = create<UiState>((set) => ({
  darkMode: getInitialDarkMode(),
  language: getInitialLanguage(),
  currency: getInitialCurrency(),
  toggleDarkMode: () =>
    set((s) => { const next = !s.darkMode; syncDarkMode(next); return { darkMode: next } }),
  setLanguage: (lang) => {
    i18n.changeLanguage(lang)
    try { localStorage.setItem('hub-lang', lang) } catch { /* ignore */ }
    set({ language: lang })
  },
  setCurrency: (currency) => {
    try { localStorage.setItem('hub-currency', currency) } catch { /* ignore */ }
    set({ currency })
  },
}))
