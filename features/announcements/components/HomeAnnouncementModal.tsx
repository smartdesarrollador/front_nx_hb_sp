'use client'

import { useHomeAnnouncement } from '../hooks/useHomeAnnouncement'
import { useAnnouncementDismissal } from '../hooks/useAnnouncementDismissal'
import { AnnouncementModal } from './AnnouncementModal'

export function HomeAnnouncementModal() {
  const { announcement } = useHomeAnnouncement()
  const { dismissed, dismiss } = useAnnouncementDismissal(announcement?.id)

  if (!announcement || dismissed) return null

  return <AnnouncementModal announcement={announcement} onClose={dismiss} />
}
