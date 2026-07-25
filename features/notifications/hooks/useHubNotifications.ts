'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { HubNotification } from '../types'

interface HubNotificationsResponse {
  notifications?: HubNotification[]
  /** Formato de DRF paginado por defecto; el Hub no lo usa, pero no cuesta tolerarlo. */
  results?: HubNotification[]
}

export function useHubNotifications() {
  const { data, isLoading } = useQuery<HubNotification[]>({
    queryKey: ['hub-notifications'],
    queryFn: async () => {
      // El endpoint responde { notifications, pagination } (HubNotificationListView).
      // Leer `results` —que no existe— dejaba la campana y la página vacías SIEMPRE,
      // sin error visible: el handler MSW devolvía un array pelado y el test pasaba
      // por la rama equivocada, así que nada delataba el fallo.
      const res = await apiClient.get<HubNotification[] | HubNotificationsResponse>(
        '/app/notifications/',
      )
      if (Array.isArray(res.data)) return res.data
      return res.data.notifications ?? res.data.results ?? []
    },
    staleTime: 0,
    refetchInterval: 60_000,
  })
  const notifications = data ?? []
  const unreadCount = notifications.filter((n) => !n.read).length
  return { notifications, unreadCount, isLoading }
}
