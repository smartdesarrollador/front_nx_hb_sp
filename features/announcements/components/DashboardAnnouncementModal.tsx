'use client'

import { useDashboardAnnouncement } from '../hooks/useDashboardAnnouncement'
import { useAnnouncementDismissal } from '../hooks/useAnnouncementDismissal'
import { AnnouncementModal } from './AnnouncementModal'

export function DashboardAnnouncementModal() {
  const { announcement } = useDashboardAnnouncement()
  const { dismissed, dismiss } = useAnnouncementDismissal(announcement?.id)

  if (!announcement || dismissed) return null

  return <AnnouncementModal announcement={announcement} onClose={dismiss} />
}
