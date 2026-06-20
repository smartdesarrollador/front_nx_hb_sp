'use client'

import { useEffect, useRef } from 'react'
import { X, RotateCcw } from 'lucide-react'
import { useChat } from '../hooks/useChat'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'

const WELCOME_MESSAGE = '¡Hola! Soy el asistente de Hub de Servicios. ¿En qué puedo ayudarte hoy? Puedo responder preguntas sobre nuestros planes, características y servicios.'

interface Props {
  onClose: () => void
}

export function ChatPanel({ onClose }: Props) {
  const { messages, send, isStreaming, error, reset } = useChat()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isStreaming])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div className="absolute bottom-16 right-0 w-[340px] h-[480px] bg-white dark:bg-[#0B2740] rounded-2xl shadow-2xl border border-[#DDE5EE] dark:border-[#0F2D45] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-primary-600 text-white flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-xs font-bold">AI</span>
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">Asistente Hub</p>
            <p className="text-xs text-primary-100 leading-tight">
              {isStreaming ? 'Escribiendo…' : 'En línea'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={reset}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            title="Nueva conversación"
            aria-label="Nueva conversación"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            title="Cerrar chat"
            aria-label="Cerrar chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 pt-3 pb-1 space-y-1">
        {/* Welcome bubble */}
        <div className="flex justify-start mb-3">
          <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
            <span className="text-white text-xs font-bold">AI</span>
          </div>
          <div className="max-w-[78%] px-3 py-2 rounded-2xl rounded-bl-sm text-sm leading-relaxed bg-[#EAF1F8] dark:bg-[#0F2D45] text-[#0B2740] dark:text-[#EAF1F8]">
            {WELCOME_MESSAGE}
          </div>
        </div>

        {messages.map((msg, i) => (
          <ChatMessage
            key={i}
            message={msg}
            isStreaming={isStreaming && i === messages.length - 1 && msg.role === 'assistant'}
          />
        ))}

        {error && (
          <p className="text-xs text-red-500 dark:text-red-400 text-center py-1 px-2">{error}</p>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={send} disabled={isStreaming} />
    </div>
  )
}
