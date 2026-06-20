'use client'

import { type KeyboardEvent, useRef, useState } from 'react'
import { Send } from 'lucide-react'

interface Props {
  onSend: (message: string) => void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled = false }: Props) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 100)}px`
  }

  return (
    <div className="flex items-end gap-2 p-3 border-t border-[#DDE5EE] dark:border-[#0F2D45]">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        rows={1}
        placeholder="Escribe tu pregunta…"
        disabled={disabled}
        className="flex-1 resize-none rounded-xl border border-[#DDE5EE] dark:border-[#0F2D45] bg-white dark:bg-[#071D2E] text-[#0B2740] dark:text-[#EAF1F8] placeholder-gray-400 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 max-h-24 overflow-y-auto"
      />
      <button
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-xl bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Enviar mensaje"
      >
        <Send className="w-4 h-4" />
      </button>
    </div>
  )
}
