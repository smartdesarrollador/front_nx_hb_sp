'use client'

import { useQuery } from '@tanstack/react-query'
import { publicClient } from '@/lib/axios'
import type { Announcement } from '../types'

export function useHomeAnnouncement() {
  const { data } = useQuery({
    queryKey: ['public-announcement-home'],
    queryFn: () =>
      publicClient
        .get<Announcement>('/public/announcements/active/?placement=home')
        .then((r) => (r.status === 204 ? null : r.data))
        .catch(() => null),
    staleTime: 5 * 60_000,
  })

  return { announcement: data ?? null }
}
