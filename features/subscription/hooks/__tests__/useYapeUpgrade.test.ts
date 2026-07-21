import { describe, it, expect, vi, afterEach } from 'vitest'
import { act, waitFor } from '@testing-library/react'
import { apiClient } from '@/lib/axios'
import { renderHookWithProviders } from '@/test/utils'
import { useYapeUpgrade } from '@/features/subscription/hooks/useYapeUpgrade'

// Nota: no se usa MSW aquí — el adapter http de axios (forzado en test/setup.ts
// para que MSW intercepte) no serializa el FormData de jsdom
// ("data should be a string, Buffer or Uint8Array"). Se espía apiClient.post
// y se verifica el FormData construido, que es el contrato del hook.

function makeScreenshot() {
  return new File(['fake-png-bytes'], 'proof.png', { type: 'image/png' })
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useYapeUpgrade', () => {
  it('incluye promo_code en el FormData y nunca envía amount', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({
      data: { message: 'ok', proof_id: 'p1' },
    })

    const { result } = renderHookWithProviders(() => useYapeUpgrade())
    await act(async () => {
      result.current.mutate({
        plan: 'professional',
        screenshot: makeScreenshot(),
        promo_code: 'UPGRADE20',
      })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // Con trailing slash: en producción NEXT_PUBLIC_API_URL apunta directo al
    // backend (sin pasar por el rewrite de next.config.ts), así que debe
    // coincidir exacto con el path de Django (`yape-upgrade/`) — ver LL-001.
    expect(postSpy).toHaveBeenCalledWith(
      '/admin/subscriptions/yape-upgrade/',
      expect.any(FormData),
      { headers: { 'Content-Type': undefined } },
    )
    const form = postSpy.mock.calls[0][1] as FormData
    expect(form.get('plan')).toBe('professional')
    expect(form.get('promo_code')).toBe('UPGRADE20')
    // El monto lo calcula siempre el backend — el cliente jamás lo manda
    expect(form.get('amount')).toBeNull()
  })

  it('sin cupón no envía el campo promo_code', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({
      data: { message: 'ok', proof_id: 'p2' },
    })

    const { result } = renderHookWithProviders(() => useYapeUpgrade())
    await act(async () => {
      result.current.mutate({
        plan: 'enterprise',
        screenshot: makeScreenshot(),
      })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const form = postSpy.mock.calls[0][1] as FormData
    expect(form.get('promo_code')).toBeNull()
    expect(form.get('amount')).toBeNull()
  })
})
