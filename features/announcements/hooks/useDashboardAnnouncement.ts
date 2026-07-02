'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import { useAuthStore } from '@/store/authStore'
import type { Announcement } from '../types'

export function useDashboardAnnouncement() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const { data } = useQuery({
    queryKey: ['hub-dashboard-announcement'],
    queryFn: () =>
      apiClient
        .get<Announcement>('/app/announcements/active/?placement=dashboard')
        .then((r) => (r.status === 204 ? null : r.data))
        .catch(() => null),
    enabled: isAuthenticated,
    staleTime: 5 * 60_000,
  })

  return { announcement: data ?? null }
}
