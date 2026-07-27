'use client'

import { useRef, useState } from 'react'
import { Upload, X } from 'lucide-react'

interface Props {
  file: File | null
  preview: string | null
  onSelect: (file: File) => void
  onRemove: () => void
}

/** Selección de la captura del comprobante, por arrastre o por clic. */
export function ProofDropzone({ file, preview, onSelect, onRemove }: Props) {
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) onSelect(dropped)
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onClick={() => !file && inputRef.current?.click()}
      className={[
        'relative rounded-xl border-2 border-dashed p-6 text-center transition-colors',
        !file ? 'cursor-pointer' : '',
        dragOver
          ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20'
          : 'border-gray-300 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-600',
      ].join(' ')}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const picked = e.target.files?.[0]
          if (picked) onSelect(picked)
        }}
      />

      {preview ? (
        <div className="relative inline-block">
          <img
            src={preview}
            alt="Vista previa del comprobante"
            className="max-h-52 rounded-lg object-contain"
          />
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove() }}
            aria-label="Quitar imagen"
            className="absolute -top-2 -right-2 rounded-full bg-white dark:bg-gray-800 p-1 shadow-md border border-gray-200 dark:border-gray-600"
          >
            <X className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <Upload className="mx-auto w-10 h-10 text-gray-400" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Arrastra tu screenshot aquí o{' '}
            <span className="font-medium text-purple-600 dark:text-purple-400">
              haz clic para seleccionar
            </span>
          </p>
          <p className="text-xs text-gray-400">PNG, JPG, WEBP (máx. 10 MB)</p>
        </div>
      )}
    </div>
  )
}
