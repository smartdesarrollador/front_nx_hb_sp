'use client'

import { useState } from 'react'

const STORAGE_PREFIX = 'hub-announcement-dismissed-'

function isDismissed(id: string | undefined): boolean {
  if (!id || typeof window === 'undefined') return false
  return localStorage.getItem(`${STORAGE_PREFIX}${id}`) === '1'
}

export function useAnnouncementDismissal(id: string | undefined) {
  // Leído de forma síncrona en el render (no en un efecto) para evitar que
  // el modal parpadee visible un frame antes de ocultarse cuando el id ya
  // estaba marcado como descartado (p.ej. un anuncio "Home + Dashboard"
  // cerrado en una página también llega ya-descartado a la otra, mismo
  // localStorage/dominio).
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(() => new Set())

  const dismissed = id ? dismissedIds.has(id) || isDismissed(id) : false

  const dismiss = () => {
    if (!id) return
    localStorage.setItem(`${STORAGE_PREFIX}${id}`, '1')
    setDismissedIds((prev) => new Set(prev).add(id))
  }

  return { dismissed, dismiss }
}
