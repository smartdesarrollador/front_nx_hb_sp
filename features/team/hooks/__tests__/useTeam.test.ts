import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act, waitFor } from '@testing-library/react'
import { renderHookWithProviders } from '@/test/utils'
import { useTeamMembers } from '@/features/team/hooks/useTeamMembers'
import { useInviteTeamMember } from '@/features/team/hooks/useInviteTeamMember'
import { useSuspendTeamMember } from '@/features/team/hooks/useSuspendTeamMember'
import { useRemoveTeamMember } from '@/features/team/hooks/useRemoveTeamMember'
import { useAuthStore } from '@/store/authStore'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
  redirect: vi.fn(),
}))

beforeEach(() => {
  act(() => useAuthStore.getState().clearAuth())
  act(() => useAuthStore.getState().setAccessToken('test-token'))
})

describe('useTeamMembers', () => {
  it('retorna la lista de miembros del equipo', async () => {
    const { result } = renderHookWithProviders(() => useTeamMembers())
    await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 })
    expect(Array.isArray(result.current.members)).toBe(true)
    expect(result.current.members.length).toBeGreaterThan(0)
  })
})

describe('useInviteTeamMember', () => {
  it('invitación exitosa pone isSuccess en true', async () => {
    const { result } = renderHookWithProviders(() => useInviteTeamMember())
    await act(async () => {
      result.current.mutate({ email: 'nuevo@acme.com', role: 'member' })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })
  })
})

describe('useSuspendTeamMember', () => {
  it('suspensión exitosa pone isSuccess en true', async () => {
    const { result } = renderHookWithProviders(() => useSuspendTeamMember())
    await act(async () => {
      result.current.mutate({ id: 'm1', active: false })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })
  })
})

describe('useRemoveTeamMember', () => {
  it('eliminación exitosa pone isSuccess en true', async () => {
    const { result } = renderHookWithProviders(() => useRemoveTeamMember())
    await act(async () => {
      result.current.mutate('m1')
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })
  })
})
