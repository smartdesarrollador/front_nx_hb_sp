'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { ChatMessage } from '../types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? ''
const SESSION_URL = `${API_BASE}/api/v1/public/chat/session/`
const MESSAGE_URL = `${API_BASE}/api/v1/public/chat/message/`
const SESSION_KEY = 'hub-chat-session'

async function initSession(): Promise<string> {
  const stored = sessionStorage.getItem(SESSION_KEY)
  const body = stored ? { session_token: stored } : {}

  const res = await fetch(SESSION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  sessionStorage.setItem(SESSION_KEY, data.session_token)
  return data.session_token
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    initSession()
      .then(setSessionToken)
      .catch(() => setError('No se pudo iniciar la sesión de chat.'))
  }, [])

  const send = useCallback(
    async (userMessage: string) => {
      if (!sessionToken || isStreaming) return

      setError(null)
      setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
      setIsStreaming(true)

      abortRef.current = new AbortController()

      try {
        const res = await fetch(MESSAGE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_token: sessionToken, message: userMessage }),
          signal: abortRef.current.signal,
        })

        if (!res.ok) {
          if (res.status === 429) {
            setError('Has alcanzado el límite de mensajes para esta sesión.')
          } else {
            setError('Error al contactar el asistente. Intenta de nuevo.')
          }
          setIsStreaming(false)
          return
        }

        if (!res.body) {
          setError('El asistente no respondió. Intenta de nuevo.')
          setIsStreaming(false)
          return
        }

        setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let assistantContent = ''
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const payload = line.slice(6).trim()
            if (payload === '[DONE]') break
            try {
              const parsed = JSON.parse(payload)
              if (parsed.error) {
                setError(parsed.error)
                break
              }
              if (parsed.token) {
                assistantContent += parsed.token
                setMessages((prev) => [
                  ...prev.slice(0, -1),
                  { role: 'assistant', content: assistantContent },
                ])
              }
            } catch {
              // ignore malformed SSE line
            }
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError('Error de conexión. Verifica tu internet e intenta de nuevo.')
        }
      } finally {
        setIsStreaming(false)
      }
    },
    [sessionToken, isStreaming],
  )

  const reset = useCallback(() => {
    abortRef.current?.abort()
    setMessages([])
    setError(null)
    setIsStreaming(false)
    sessionStorage.removeItem(SESSION_KEY)
    initSession().then(setSessionToken)
  }, [])

  return { messages, send, isStreaming, error, reset }
}
