import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act } from '@testing-library/react'
import { useAuthStore } from '@/store/authStore'
import type { User, Tenant } from '@/types/auth'

const mockUser: User = {
  id: 'u1',
  email: 'user@acme.com',
  name: 'Test User',
  firstName: 'Test',
  lastName: 'User',
  roles: ['Owner'],
  permissions: ['projects.view'],
  status: 'active',
  mfaEnabled: false,
  tenantId: 't1',
  lastLogin: null,
  createdAt: '2026-01-01T00:00:00Z',
}

const mockTenant: Tenant = {
  id: 't1',
  name: 'Acme Corp',
  subdomain: 'acme',
  plan: 'professional',
}

beforeEach(() => {
  act(() => useAuthStore.getState().clearAuth())
  localStorage.clear()
})

describe('authStore', () => {
  it('setUser actualiza user y marca isAuthenticated', () => {
    act(() => useAuthStore.getState().setUser(mockUser))
    const s = useAuthStore.getState()
    expect(s.user).toEqual(mockUser)
    expect(s.isAuthenticated).toBe(true)
  })

  it('setTenant actualiza tenant', () => {
    act(() => useAuthStore.getState().setTenant(mockTenant))
    expect(useAuthStore.getState().tenant).toEqual(mockTenant)
  })

  it('setAccessToken actualiza accessToken', () => {
    act(() => useAuthStore.getState().setAccessToken('tok-abc'))
    expect(useAuthStore.getState().accessToken).toBe('tok-abc')
  })

  it('clearAuth limpia todo el estado', () => {
    act(() => {
      useAuthStore.getState().setUser(mockUser)
      useAuthStore.getState().setTenant(mockTenant)
      useAuthStore.getState().setAccessToken('tok-abc')
    })
    act(() => useAuthStore.getState().clearAuth())
    const s = useAuthStore.getState()
    expect(s.user).toBeNull()
    expect(s.tenant).toBeNull()
    expect(s.accessToken).toBeNull()
    expect(s.isAuthenticated).toBe(false)
  })

  it('clearAuth elimina hub-refreshToken de localStorage', () => {
    localStorage.setItem('hub-refreshToken', 'rt-123')
    act(() => useAuthStore.getState().clearAuth())
    expect(localStorage.getItem('hub-refreshToken')).toBeNull()
  })

  it('clearAuth llama clearRefreshTokenCookie (cookie max-age=0)', () => {
    document.cookie = 'hub-refreshToken=some-token; path=/'
    act(() => useAuthStore.getState().clearAuth())
    expect(document.cookie).not.toContain('hub-refreshToken=some-token')
  })
})
