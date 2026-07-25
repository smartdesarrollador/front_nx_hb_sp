import { describe, it, expect, vi, afterEach } from 'vitest'
import { act, waitFor } from '@testing-library/react'
import { apiClient } from '@/lib/axios'
import { renderHookWithProviders } from '@/test/utils'
import {
  PENDING_PROOF_MESSAGE,
  useYapeUpgrade,
} from '@/features/subscription/hooks/useYapeUpgrade'

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

  it('envía billing_cycle cuando se paga el ciclo anual', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({
      data: { message: 'ok', proof_id: 'p3', is_renewal: true, billing_cycle: 'annual' },
    })

    const { result } = renderHookWithProviders(() => useYapeUpgrade())
    await act(async () => {
      result.current.mutate({
        plan: 'professional',
        screenshot: makeScreenshot(),
        billing_cycle: 'annual',
      })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const form = postSpy.mock.calls[0][1] as FormData
    expect(form.get('billing_cycle')).toBe('annual')
    // El monto sigue calculándose en servidor, también en anual
    expect(form.get('amount')).toBeNull()
    expect(result.current.data?.is_renewal).toBe(true)
  })

  it('omite billing_cycle si no se especifica (el backend usa monthly)', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({
      data: { message: 'ok', proof_id: 'p4', is_renewal: false, billing_cycle: 'monthly' },
    })

    const { result } = renderHookWithProviders(() => useYapeUpgrade())
    await act(async () => {
      result.current.mutate({ plan: 'starter', screenshot: makeScreenshot() })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect((postSpy.mock.calls[0][1] as FormData).get('billing_cycle')).toBeNull()
  })

  it('traduce el 409 a un mensaje sobre el comprobante pendiente', async () => {
    // El backend devuelve 409 si ya hay un proof pending: dos comprobantes podrían
    // aprobarse ambos y cobrar dos veces. Es estado esperable, no un fallo crudo.
    vi.spyOn(apiClient, 'post').mockRejectedValue({
      response: { status: 409, data: { detail: 'Ya tienes un comprobante en revisión.' } },
    })

    const { result } = renderHookWithProviders(() => useYapeUpgrade())
    await act(async () => {
      result.current.mutate({ plan: 'professional', screenshot: makeScreenshot() })
    })
    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error?.message).toBe(PENDING_PROOF_MESSAGE)
  })

  it('propaga otros errores sin reescribirlos', async () => {
    const original = { response: { status: 400, data: { detail: 'Plan inválido.' } } }
    vi.spyOn(apiClient, 'post').mockRejectedValue(original)

    const { result } = renderHookWithProviders(() => useYapeUpgrade())
    await act(async () => {
      result.current.mutate({ plan: 'professional', screenshot: makeScreenshot() })
    })
    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toBe(original)
  })
})
