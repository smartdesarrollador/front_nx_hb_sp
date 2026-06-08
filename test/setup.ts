import '@testing-library/jest-dom'
import axios from 'axios'
import { server } from './server'
import { toHaveNoViolations } from 'jest-axe'
import type { RunOptions } from 'axe-core'

process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000'

// Force Axios to use Node.js http so MSW can intercept
axios.defaults.adapter = 'http'

// ResizeObserver mock (not implemented in jsdom)
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// next/navigation mock
vi.mock('next/navigation', () => ({
  useRouter:       () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname:     () => '/',
  redirect:        vi.fn(),
}))

expect.extend(toHaveNoViolations)

export const axeConfig: RunOptions = {
  rules: { 'color-contrast': { enabled: false } },
}

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
