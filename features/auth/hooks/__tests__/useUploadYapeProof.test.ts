import { describe, it, expect, vi, afterEach } from 'vitest'
import { act, waitFor } from '@testing-library/react'
import { publicClient } from '@/lib/axios'
import { renderHookWithProviders } from '@/test/utils'
import { useUploadYapeProof } from '@/features/auth/hooks/useUploadYapeProof'

// Nota: no se usa MSW aquí — el adapter http de axios (forzado en test/setup.ts
// para que MSW intercepte) no serializa el FormData de jsdom
// ("data should be a string, Buffer or Uint8Array"). Se espía publicClient.post
// y se verifica el FormData construido, que es el contrato del hook.

function makeScreenshot() {
  return new File(['fake-png-bytes'], 'proof.png', { type: 'image/png' })
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useUploadYapeProof', () => {
  it('incluye promo_code en el FormData y nunca envía amount', async () => {
    const postSpy = vi.spyOn(publicClient, 'post').mockResolvedValue({
      data: { message: 'ok', proof_id: 'p1' },
    })

    const { result } = renderHookWithProviders(() => useUploadYapeProof())
    await act(async () => {
      result.current.mutate({
        payment_upload_token: 'tok-123',
        screenshot: makeScreenshot(),
        plan: 'starter',
        promo_code: 'VERANO20',
      })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(postSpy).toHaveBeenCalledWith(
      '/auth/yape-payment-proof',
      expect.any(FormData),
      { headers: { 'Content-Type': undefined } },
    )
    const form = postSpy.mock.calls[0][1] as FormData
    expect(form.get('payment_upload_token')).toBe('tok-123')
    expect(form.get('plan')).toBe('starter')
    expect(form.get('promo_code')).toBe('VERANO20')
    // El monto lo calcula siempre el backend — el cliente jamás lo manda
    expect(form.get('amount')).toBeNull()
  })

  it('sin cupón no envía el campo promo_code', async () => {
    const postSpy = vi.spyOn(publicClient, 'post').mockResolvedValue({
      data: { message: 'ok', proof_id: 'p2' },
    })

    const { result } = renderHookWithProviders(() => useUploadYapeProof())
    await act(async () => {
      result.current.mutate({
        payment_upload_token: 'tok-456',
        screenshot: makeScreenshot(),
        plan: 'professional',
      })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const form = postSpy.mock.calls[0][1] as FormData
    expect(form.get('promo_code')).toBeNull()
    expect(form.get('amount')).toBeNull()
  })

  it('envía billing_cycle cuando el registro es anual', async () => {
    const postSpy = vi.spyOn(publicClient, 'post').mockResolvedValue({
      data: { message: 'ok', proof_id: 'p3', billing_cycle: 'annual' },
    })

    const { result } = renderHookWithProviders(() => useUploadYapeProof())
    await act(async () => {
      result.current.mutate({
        payment_upload_token: 'tok-annual',
        screenshot: makeScreenshot(),
        plan: 'professional',
        billing_cycle: 'annual',
      })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const form = postSpy.mock.calls[0][1] as FormData
    expect(form.get('billing_cycle')).toBe('annual')
    // También en anual el monto lo calcula el backend
    expect(form.get('amount')).toBeNull()
    expect(result.current.data?.billing_cycle).toBe('annual')
  })

  it('omite billing_cycle si no se especifica (el backend usa monthly)', async () => {
    const postSpy = vi.spyOn(publicClient, 'post').mockResolvedValue({
      data: { message: 'ok', proof_id: 'p4', billing_cycle: 'monthly' },
    })

    const { result } = renderHookWithProviders(() => useUploadYapeProof())
    await act(async () => {
      result.current.mutate({
        payment_upload_token: 'tok-default',
        screenshot: makeScreenshot(),
        plan: 'starter',
      })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect((postSpy.mock.calls[0][1] as FormData).get('billing_cycle')).toBeNull()
  })
})
