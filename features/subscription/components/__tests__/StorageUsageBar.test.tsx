import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StorageUsageBar } from '@/features/subscription/components/StorageUsageBar'

// t devuelve la key (o interpola storageUsage) → aserciones deterministas sin init de i18n.
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: { current?: string; limit?: string }) =>
      opts ? `${opts.current} de ${opts.limit}` : key,
  }),
}))

// next/link → <a> simple (evita depender del router del App Router en jsdom).
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

function mockStorage(current_gb: number, limit_gb: number | null, isLoading = false) {
  mockHook.mockReturnValue({
    subscription: isLoading ? null : { usage: { storage: { current_gb, limit_gb } } },
    isLoading,
  })
}

describe('StorageUsageBar', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows used / limit and a progressbar under normal usage', () => {
    mockStorage(1, 5)
    render(<StorageUsageBar />)
    expect(screen.getByText('1.0 GB de 5.0 GB')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    expect(screen.queryByText('storageLimitReached')).not.toBeInTheDocument()
  })

  it('formats sub-GB usage in MB (avoids the confusing "0.0 GB")', () => {
    mockStorage(0.037, 1) // ~38 MB de 1 GB
    render(<StorageUsageBar />)
    expect(screen.getByText('38 MB de 1.0 GB')).toBeInTheDocument()
  })

  it('shows an upgrade CTA when near the limit (>=90%)', () => {
    mockStorage(4.7, 5) // 94%
    render(<StorageUsageBar />)
    const cta = screen.getByText('storageUpgrade')
    expect(cta).toBeInTheDocument()
    expect(cta.closest('a')).toHaveAttribute('href', '/subscription')
  })

  it('shows the limit-reached badge when full', () => {
    mockStorage(5, 5)
    render(<StorageUsageBar />)
    expect(screen.getByText('storageLimitReached')).toBeInTheDocument()
  })

  it('shows "unlimited" and no CTA for enterprise (limit null)', () => {
    mockStorage(120, null)
    render(<StorageUsageBar />)
    expect(screen.getByText('storageUnlimited')).toBeInTheDocument()
    expect(screen.queryByText('storageUpgrade')).not.toBeInTheDocument()
  })

  it('renders a skeleton while loading', () => {
    mockStorage(0, 5, true)
    const { container } = render(<StorageUsageBar />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })
})
