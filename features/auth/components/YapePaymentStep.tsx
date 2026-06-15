'use client'

import { useRef, useState } from 'react'
import { Upload, X, AlertCircle, Smartphone } from 'lucide-react'
import { useUploadYapeProof } from '@/features/auth/hooks/useUploadYapeProof'
import { useYapeConfig } from '@/features/auth/hooks/useYapeConfig'

const PLAN_PRICES_USD: Record<string, number> = {
  starter:      29,
  professional: 79,
  enterprise:   199,
}

interface Props {
  paymentUploadToken: string
  plan: string
  onSuccess: () => void
}

export default function YapePaymentStep({ paymentUploadToken, plan, onSuccess }: Props) {
  const [file, setFile]         = useState<File | null>(null)
  const [preview, setPreview]   = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef                = useRef<HTMLInputElement>(null)

  const { data: yapeConfig, isLoading: configLoading } = useYapeConfig()
  const { mutateAsync, isPending, isError, error } = useUploadYapeProof()

  const amountUSD = PLAN_PRICES_USD[plan] ?? 0
  const rate      = parseFloat(yapeConfig?.exchange_rate ?? '3.75')
  const amountPEN = (amountUSD * rate).toFixed(2)

  function handleFile(f: File) {
    if (!f.type.startsWith('image/')) return
    if (preview) URL.revokeObjectURL(preview)
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  function removeFile(e: React.MouseEvent) {
    e.stopPropagation()
    if (preview) URL.revokeObjectURL(preview)
    setFile(null)
    setPreview(null)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  async function handleSubmit() {
    if (!file) return
    await mutateAsync({
      payment_upload_token: paymentUploadToken,
      screenshot: file,
      plan,
      amount: amountUSD,
    })
    onSuccess()
  }

  // Yape disabled by admin
  if (!configLoading && yapeConfig && !yapeConfig.is_enabled) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Pago con Yape</h2>
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20 p-4 text-sm text-amber-800 dark:text-amber-300">
          <p className="font-medium mb-1">Pago con Yape no disponible temporalmente</p>
          <p>Por favor contáctanos para coordinar el pago de tu suscripción.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Pago con Yape
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Realiza el pago y sube el comprobante para activar tu cuenta.
        </p>
      </div>

      {/* Payment instructions */}
      <div className="rounded-xl border border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
          <p className="text-sm font-semibold text-purple-900 dark:text-purple-200">
            Instrucciones de pago
          </p>
        </div>

        {configLoading ? (
          <div className="space-y-2 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 bg-purple-200 dark:bg-purple-800 rounded w-3/4" />
            ))}
          </div>
        ) : (
          <ol className="pl-4 space-y-1.5 text-sm text-purple-800 dark:text-purple-300 list-decimal">
            <li>Abre Yape en tu celular</li>
            <li>
              Envía{' '}
              <span className="font-bold text-purple-900 dark:text-purple-100">
                S/ {amountPEN}
              </span>{' '}
              (aprox. ${amountUSD} USD) al número:
            </li>
            <li className="font-mono font-bold text-base tracking-wider text-purple-900 dark:text-purple-100">
              {yapeConfig?.phone || '—'}
            </li>
            <li>
              Titular:{' '}
              <span className="font-semibold text-purple-900 dark:text-purple-100">
                {yapeConfig?.holder_name || '—'}
              </span>
            </li>
            <li>Toma screenshot del comprobante y súbelo abajo</li>
          </ol>
        )}

        {yapeConfig?.instructions_note && (
          <p className="text-xs text-purple-700 dark:text-purple-300 pt-2 border-t border-purple-200 dark:border-purple-700">
            {yapeConfig.instructions_note}
          </p>
        )}

        <p className="text-xs text-purple-600 dark:text-purple-400 pt-1 border-t border-purple-200 dark:border-purple-700">
          Plan seleccionado:{' '}
          <span className="font-semibold capitalize">{plan}</span> — ${amountUSD}/mes
        </p>
      </div>

      {/* Drop zone */}
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
            const f = e.target.files?.[0]
            if (f) handleFile(f)
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
              onClick={removeFile}
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

      {isError && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-300">
          <AlertCircle className="mt-0.5 w-4 h-4 flex-shrink-0" />
          <span>
            {(error as Error)?.message ?? 'Error al enviar el comprobante. Intenta de nuevo.'}
          </span>
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!file || isPending}
        className="w-full rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? 'Enviando comprobante...' : 'Enviar comprobante'}
      </button>

      <p className="text-center text-xs text-gray-400">
        Tu comprobante será revisado manualmente. Recibirás un email de confirmación.
      </p>
    </div>
  )
}
