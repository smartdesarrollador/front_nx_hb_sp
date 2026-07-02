'use client'

import { X } from 'lucide-react'
import type { Announcement } from '../types'

interface Props {
  announcement: Announcement
  onClose: () => void
}

export function AnnouncementModal({ announcement, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="announcement-modal-title"
        className="relative bg-white rounded-xl w-full max-w-md sm:max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto p-5 sm:p-6 md:p-8 space-y-4 md:space-y-5"
      >
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-3 right-3 p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5 md:w-6 md:h-6" />
        </button>

        {announcement.image_url && (
          <img
            src={announcement.image_url}
            alt={announcement.title}
            className="w-full h-40 sm:h-52 md:h-64 object-cover rounded-lg"
          />
        )}

        <h2 id="announcement-modal-title" className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 pr-6">
          {announcement.title}
        </h2>

        {announcement.message && (
          <p className="text-gray-600 text-sm md:text-base whitespace-pre-line">{announcement.message}</p>
        )}

        {announcement.cta_url && (
          <a
            href={announcement.cta_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="block text-center py-2.5 md:py-3 px-4 bg-primary-600 text-white rounded-lg text-sm md:text-base font-semibold hover:bg-primary-700 transition-colors"
          >
            {announcement.cta_text || 'Ver más'}
          </a>
        )}
      </div>
    </div>
  )
}
