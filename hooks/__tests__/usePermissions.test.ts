import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePermissions } from '@/hooks/usePermissions'
import { useAuthStore } from '@/store/authStore'
import type { User, Tenant } from '@/types/auth'

const makeUser = (overrides: Partial<User> = {}): User => ({
  id: 'u1',
  email: 'user@acme.com',
  name: 'Test User',
  firstName: 'Test',
  lastName: 'User',
  roles: ['Member'],
  permissions: [],
  status: 'active',
  mfaEnabled: false,
  tenantId: 't1',
  lastLogin: null,
  createdAt: '2026-01-01T00:00:00Z',
  ...overrides,
})

const makeTenant = (plan = 'professional'): Tenant => ({
  id: 't1',
  name: 'Acme',
  subdomain: 'acme',
  plan,
})

beforeEach(() => {
  act(() => useAuthStore.getState().clearAuth())
})

describe('usePermissions', () => {
  it('sin usuario, hasPermission retorna false', () => {
    const { result } = renderHook(() => usePermissions())
    expect(result.current.hasPermission('projects.view')).toBe(false)
  })

  it('con roles: [Owner] → isOwner=true, isAdmin=true', () => {
    act(() => useAuthStore.getState().setUser(makeUser({ roles: ['Owner'] })))
    const { result } = renderHook(() => usePermissions())
    expect(result.current.isOwner).toBe(true)
    expect(result.current.isAdmin).toBe(true)
  })

  it('con roles: [Member] → isOwner=false, isAdmin=false', () => {
    act(() => useAuthStore.getState().setUser(makeUser({ roles: ['Member'] })))
    const { result } = renderHook(() => usePermissions())
    expect(result.current.isOwner).toBe(false)
    expect(result.current.isAdmin).toBe(false)
  })

  it('con permissions: [subscriptions.view_billing] → canManageBilling=true', () => {
    act(() =>
      useAuthStore.getState().setUser(
        makeUser({ roles: ['Member'], permissions: ['subscriptions.view_billing'] }),
      ),
    )
    const { result } = renderHook(() => usePermissions())
    expect(result.current.canManageBilling).toBe(true)
  })

  it('plan free → canUpgradePlan=true', () => {
    act(() => {
      useAuthStore.getState().setUser(makeUser())
      useAuthStore.getState().setTenant(makeTenant('free'))
    })
    const { result } = renderHook(() => usePermissions())
    expect(result.current.canUpgradePlan).toBe(true)
  })

  it('plan enterprise → canUpgradePlan=false', () => {
    act(() => {
      useAuthStore.getState().setUser(makeUser())
      useAuthStore.getState().setTenant(makeTenant('enterprise'))
    })
    const { result } = renderHook(() => usePermissions())
    expect(result.current.canUpgradePlan).toBe(false)
  })

  it('plan starter → canUpgradePlan=true', () => {
    act(() => {
      useAuthStore.getState().setUser(makeUser())
      useAuthStore.getState().setTenant(makeTenant('starter'))
    })
    const { result } = renderHook(() => usePermissions())
    expect(result.current.canUpgradePlan).toBe(true)
  })

  it('plan professional → canUpgradePlan=true (puede subir a Enterprise)', () => {
    act(() => {
      useAuthStore.getState().setUser(makeUser())
      useAuthStore.getState().setTenant(makeTenant('professional'))
    })
    const { result } = renderHook(() => usePermissions())
    expect(result.current.canUpgradePlan).toBe(true)
  })

  it('getPrimaryRole retorna el primer rol del usuario', () => {
    act(() => useAuthStore.getState().setUser(makeUser({ roles: ['Owner', 'Member'] })))
    const { result } = renderHook(() => usePermissions())
    expect(result.current.getPrimaryRole()).toBe('Owner')
  })

  it('getRoleColor retorna color para el rol Owner', () => {
    act(() => useAuthStore.getState().setUser(makeUser({ roles: ['Owner'] })))
    const { result } = renderHook(() => usePermissions())
    expect(result.current.getRoleColor()).toBe('#dc2626')
  })
})
