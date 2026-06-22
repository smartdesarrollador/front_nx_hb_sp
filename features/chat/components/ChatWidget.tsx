'use client'

import { useState } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { ChatPanel } from './ChatPanel'

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed bottom-28 right-6 z-50">
      {isOpen && <ChatPanel onClose={() => setIsOpen(false)} />}

      <button
        onClick={() => setIsOpen((v) => !v)}
        className="w-13 h-13 w-[52px] h-[52px] rounded-full bg-primary-600 hover:bg-primary-700 text-white shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
        aria-label={isOpen ? 'Cerrar asistente' : 'Abrir asistente de Hub'}
      >
        {isOpen ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
      </button>
    </div>
  )
}
