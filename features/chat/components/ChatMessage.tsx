'use client'

import type { ReactNode } from 'react'
import type { ChatMessage as ChatMessageType } from '../types'

// ─── Inline renderer: **bold**, *italic* ───────────────────────────────────────
function renderInline(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i}>{part.slice(2, -2)}</strong>
    if (part.startsWith('*') && part.endsWith('*'))
      return <em key={i}>{part.slice(1, -1)}</em>
    return part
  })
}

// ─── Block renderer ────────────────────────────────────────────────────────────
function renderMarkdown(text: string): ReactNode {
  const lines = text.split('\n')
  const blocks: ReactNode[] = []
  let i = 0
  let key = 0

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    if (!trimmed) { i++; continue }

    // H2 / H3
    if (trimmed.startsWith('### ')) {
      blocks.push(
        <p key={key++} className="font-semibold text-[13px] mt-2 mb-0.5">
          {renderInline(trimmed.slice(4))}
        </p>,
      )
      i++; continue
    }
    if (trimmed.startsWith('## ')) {
      blocks.push(
        <p key={key++} className="font-bold text-[13px] mt-2 mb-0.5">
          {renderInline(trimmed.slice(3))}
        </p>,
      )
      i++; continue
    }

    // Markdown table
    if (trimmed.startsWith('|')) {
      const tableLines: string[] = []
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i].trim())
        i++
      }
      // Remove separator rows like |---|---|
      const dataRows = tableLines.filter((l) => !l.replace(/\|/g, '').match(/^[-: ]+$/))
      if (dataRows.length > 0) {
        const header = dataRows[0].split('|').filter((c) => c.trim()).map((c) => c.trim())
        const body = dataRows.slice(1).map((row) =>
          row.split('|').filter((c) => c.trim()).map((c) => c.trim()),
        )
        blocks.push(
          <div key={key++} className="overflow-x-auto my-1.5 rounded border border-gray-200 dark:border-gray-600">
            <table className="text-[11px] w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700/60">
                  {header.map((h, j) => (
                    <th key={j} className="px-2 py-1.5 text-left font-semibold border-b border-gray-200 dark:border-gray-600 whitespace-nowrap">
                      {renderInline(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {body.map((row, ri) => (
                  <tr key={ri} className={ri % 2 === 1 ? 'bg-gray-50 dark:bg-gray-700/30' : ''}>
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-2 py-1 border-t border-gray-100 dark:border-gray-700">
                        {renderInline(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>,
        )
      }
      continue
    }

    // Unordered list
    if (trimmed.match(/^[-*] /)) {
      const items: string[] = []
      while (i < lines.length && lines[i].trim().match(/^[-*] /)) {
        items.push(lines[i].trim().slice(2))
        i++
      }
      blocks.push(
        <ul key={key++} className="list-disc list-outside ml-4 space-y-0.5 my-1">
          {items.map((item, j) => (
            <li key={j} className="text-[13px] leading-snug">{renderInline(item)}</li>
          ))}
        </ul>,
      )
      continue
    }

    // Ordered list
    if (trimmed.match(/^\d+\. /)) {
      const items: string[] = []
      while (i < lines.length && lines[i].trim().match(/^\d+\. /)) {
        items.push(lines[i].trim().replace(/^\d+\. /, ''))
        i++
      }
      blocks.push(
        <ol key={key++} className="list-decimal list-outside ml-4 space-y-0.5 my-1">
          {items.map((item, j) => (
            <li key={j} className="text-[13px] leading-snug">{renderInline(item)}</li>
          ))}
        </ol>,
      )
      continue
    }

    // Regular paragraph
    blocks.push(
      <p key={key++} className="text-[13px] leading-snug">
        {renderInline(trimmed)}
      </p>,
    )
    i++
  }

  return <div className="space-y-1">{blocks}</div>
}

// ─── Component ─────────────────────────────────────────────────────────────────
interface Props {
  message: ChatMessageType
  isStreaming?: boolean
}

export function ChatMessage({ message, isStreaming = false }: Props) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
          <span className="text-white text-xs font-bold">AI</span>
        </div>
      )}
      <div
        className={`max-w-[82%] px-3 py-2 rounded-2xl ${
          isUser
            ? 'bg-primary-600 text-white rounded-br-sm text-[13px] leading-snug'
            : 'bg-[#EAF1F8] dark:bg-[#0F2D45] text-[#0B2740] dark:text-[#EAF1F8] rounded-bl-sm'
        }`}
      >
        {isUser ? (
          <span className="whitespace-pre-wrap break-words">{message.content}</span>
        ) : message.content === '' && isStreaming ? (
          <span className="inline-flex gap-1 py-1">
            <span className="w-1.5 h-1.5 bg-[#0B2740] dark:bg-[#EAF1F8] rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-1.5 h-1.5 bg-[#0B2740] dark:bg-[#EAF1F8] rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-1.5 h-1.5 bg-[#0B2740] dark:bg-[#EAF1F8] rounded-full animate-bounce [animation-delay:300ms]" />
          </span>
        ) : (
          renderMarkdown(message.content)
        )}
      </div>
    </div>
  )
}
