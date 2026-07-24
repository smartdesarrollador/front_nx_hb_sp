import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StorageLimitBanner } from '@/features/subscription/components/StorageLimitBanner'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: { used?: string; limit?: string }) =>
      opts ? `${key}:${opts.used}/${opts.limit}` : key,
  }),
}))

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

vi.mock('@/features/subscription/hooks/useCurrentSubscription', () => ({
  useCurrentSubscription: vi.fn(),
}))

import { useCurrentSubscription } from '@/features/subscription/hooks/useCurrentSubscription'

const mockHook = useCurrentSubscription as unknown as ReturnType<typeof vi.fn>

function mockStorage(current_gb: number, limit_gb: number | null) {
  mockHook.mockReturnValue({
    subscription: { usage: { storage: { current_gb, limit_gb } } },
    isLoading: false,
  })
}

describe('StorageLimitBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
  })

  it('renders nothing below the 80% threshold', () => {
    mockStorage(0.5, 1) // 50%
    const { container } = render(<StorageLimitBanner />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing for unlimited plans (limit null)', () => {
    mockStorage(100, null)
    const { container } = render(<StorageLimitBanner />)
    expect(container).toBeEmptyDOMElement()
  })

  it('shows the near-limit warning at >=80%', () => {
    mockStorage(0.85, 1) // 85%
    render(<StorageLimitBanner />)
    expect(screen.getByText(/storageNearLimit/)).toBeInTheDocument()
    expect(screen.getByText('storageUpgradeCta').closest('a')).toHaveAttribute('href', '/subscription')
  })

  it('shows the at-limit message when full', () => {
    mockStorage(1, 1) // 100%
    render(<StorageLimitBanner />)
    expect(screen.getByText(/storageAtLimit/)).toBeInTheDocument()
  })

  it('can be dismissed and stays hidden for the same level', () => {
    mockStorage(0.9, 1) // warning
    const { rerender, container } = render(<StorageLimitBanner />)
    fireEvent.click(screen.getByLabelText('close'))
    rerender(<StorageLimitBanner />)
    expect(container).toBeEmptyDOMElement()
  })
})
