'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'

interface YapeUpgradeRequest {
  plan: string
  screenshot: File
  promo_code?: string
}

interface YapeUpgradeResponse {
  message: string
  proof_id: string
}

// El monto NO se envía: el backend lo calcula siempre en servidor
// (precio del plan menos el descuento del cupón, si lo hay).
async function submitYapeUpgrade(data: YapeUpgradeRequest): Promise<YapeUpgradeResponse> {
  const form = new FormData()
  form.append('plan', data.plan)
  form.append('screenshot', data.screenshot)
  if (data.promo_code) {
    form.append('promo_code', data.promo_code)
  }
  // Trailing slash requerido: en producción NEXT_PUBLIC_API_URL apunta directo al
  // dominio del backend (sin pasar por el rewrite de next.config.ts que en dev
  // agrega la barra), así que debe coincidir exacto con el path de Django
  // (`yape-upgrade/`) o Django responde 500/405 vía APPEND_SLASH (ver LL-001/LL-005).
  const { data: response } = await apiClient.post<YapeUpgradeResponse>(
    '/admin/subscriptions/yape-upgrade/',
    form,
    { headers: { 'Content-Type': undefined } },
  )
  return response
}

export function useYapeUpgrade() {
  const queryClient = useQueryClient()
  return useMutation<YapeUpgradeResponse, Error, YapeUpgradeRequest>({
    mutationFn: submitYapeUpgrade,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hub-subscription'] })
    },
  })
}
