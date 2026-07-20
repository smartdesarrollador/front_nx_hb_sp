'use client'

import { useRef, useState } from 'react'
import { Upload, X, AlertCircle, Smartphone, Tag, Loader2, PartyPopper } from 'lucide-react'
import { useUploadYapeProof } from '@/features/auth/hooks/useUploadYapeProof'
import { useYapeConfig } from '@/features/auth/hooks/useYapeConfig'
import { useActivateFreePlan } from '@/features/auth/hooks/useActivateFreePlan'
import {
  PROMO_REASON_MESSAGES,
  useValidatePromotion,
  type PromoReason,
  type PromoValidationResult,
} from '@/features/auth/hooks/useValidatePromotion'
import { usePlans } from '@/features/subscription/hooks/usePlans'

interface Props {
  paymentUploadToken: string
  plan: string
  onSuccess: () => void
  /** Cupón 100%: la cuenta se activa sin comprobante */
  onActivated: () => void
}

function promoMessage(reason: string | undefined): string {
  return PROMO_REASON_MESSAGES[reason as PromoReason] ?? 'El código no es válido.'
}

export default function YapePaymentStep({
  paymentUploadToken, plan, onSuccess, onActivated,
}: Props) {
  const [file, setFile]         = useState<File | null>(null)
  const [preview, setPreview]   = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef                = useRef<HTMLInputElement>(null)

  const [showPromo, setShowPromo]   = useState(false)
  const [promoInput, setPromoInput] = useState('')
  const [applied, setApplied]       = useState<PromoValidationResult | null>(null)
  const [promoError, setPromoError] = useState<string | null>(null)

  const { data: yapeConfig, isLoading: configLoading } = useYapeConfig()
  const { plans, isLoading: plansLoading } = usePlans()
  const { mutateAsync, isPending, isError, error } = useUploadYapeProof()
  const validatePromo = useValidatePromotion()
  const activateFree  = useActivateFreePlan()

  // Precio real del plan (modelo Plan del backend) — nunca hardcodeado
  const planPrice = plans.find((p) => p.id === plan)?.priceMonthly ?? 0
  const rate      = parseFloat(yapeConfig?.exchange_rate ?? '3.75')

  const amountUSD = applied?.final_price ?? planPrice
  const amountPEN = applied
    ? (applied.final_price_pen ?? amountUSD * rate).toFixed(2)
    : (planPrice * rate).toFixed(2)
  const isFreeWithPromo = applied !== null && applied.final_price === 0

  const isLoadingData = configLoading || plansLoading

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

  async function handleApplyPromo() {
    const code = promoInput.trim().toUpperCase()
    if (!code) return
    setPromoError(null)
    try {
      const result = await validatePromo.mutateAsync({ code, plan })
      if (result.valid) {
        setApplied(result)
      } else {
        setApplied(null)
        setPromoError(promoMessage(result.reason))
      }
    } catch {
      setApplied(null)
      setPromoError('No se pudo validar el código. Intenta de nuevo.')
    }
  }

  function handleRemovePromo() {
    setApplied(null)
    setPromoInput('')
    setPromoError(null)
  }

  function extractPromoRejection(err: unknown): string | null {
    const data = (err as { response?: { data?: { promo_reason?: string; detail?: string } } })
      .response?.data
    if (!data?.promo_reason) return null
    return data.detail ?? promoMessage(data.promo_reason)
  }

  async function handleSubmit() {
    if (!file) return
    try {
      await mutateAsync({
        payment_upload_token: paymentUploadToken,
        screenshot: file,
        plan,
        ...(applied?.code ? { promo_code: applied.code } : {}),
      })
      onSuccess()
    } catch (err) {
      // Cupón rechazado en el submit (p. ej. se agotó entre validar y enviar):
      // el token sigue vivo — se quita el cupón y el usuario puede reintentar.
      const rejection = extractPromoRejection(err)
      if (rejection) {
        setApplied(null)
        setPromoError(`${rejection} Puedes reintentar sin el cupón.`)
      }
    }
  }

  async function handleActivateFree() {
    if (!applied?.code) return
    setPromoError(null)
    try {
      await activateFree.mutateAsync({
        payment_upload_token: paymentUploadToken,
        plan,
        promo_code: applied.code,
      })
      onActivated()
    } catch (err) {
      const rejection = extractPromoRejection(err)
      setApplied(null)
      setPromoError(rejection ?? 'No se pudo activar la cuenta. Intenta de nuevo.')
    }
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

        {isLoadingData ? (
          <div className="space-y-2 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 bg-purple-200 dark:bg-purple-800 rounded w-3/4" />
            ))}
          </div>
        ) : isFreeWithPromo ? (
          <p className="text-sm text-purple-800 dark:text-purple-300">
            Tu cupón cubre el <span className="font-bold">100% del plan</span> — no necesitas
            realizar ningún pago.
          </p>
        ) : (
          <ol className="pl-4 space-y-1.5 text-sm text-purple-800 dark:text-purple-300 list-decimal">
            <li>Abre Yape en tu celular</li>
            <li>
              Envía{' '}
              <span className="font-bold text-purple-900 dark:text-purple-100">
                S/ {amountPEN}
              </span>{' '}
              (aprox. ${amountUSD.toFixed(2)} USD) al número:
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

        {yapeConfig?.instructions_note && !isFreeWithPromo && (
          <p className="text-xs text-purple-700 dark:text-purple-300 pt-2 border-t border-purple-200 dark:border-purple-700">
            {yapeConfig.instructions_note}
          </p>
        )}

        <p className="text-xs text-purple-600 dark:text-purple-400 pt-1 border-t border-purple-200 dark:border-purple-700">
          Plan seleccionado:{' '}
          <span className="font-semibold capitalize">{plan}</span>
          {!plansLoading && (
            applied ? (
              <>
                {' — '}
                <span className="line-through opacity-60">${applied.original_price?.toFixed(2)}</span>{' '}
                <span className="font-semibold">${amountUSD.toFixed(2)}/mes</span>
              </>
            ) : (
              <> — ${planPrice}/mes</>
            )
          )}
        </p>
      </div>

      {/* Discount code */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
        {!applied ? (
          <>
            <button
              type="button"
              onClick={() => setShowPromo((v) => !v)}
              className="flex items-center gap-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700"
            >
              <Tag className="w-4 h-4" />
              ¿Tienes un código de descuento?
            </button>

            {showPromo && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => {
                    setPromoInput(e.target.value.toUpperCase())
                    setPromoError(null)
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleApplyPromo() }}
                  placeholder="CODIGO"
                  className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm font-mono uppercase tracking-wider dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  disabled={!promoInput.trim() || validatePromo.isPending}
                  className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {validatePromo.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Aplicar
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="font-mono text-sm font-bold text-gray-900 dark:text-white">
                  {applied.code}
                </span>
                <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  aplicado
                </span>
              </div>
              <button
                type="button"
                onClick={handleRemovePromo}
                className="text-xs text-gray-500 hover:text-red-600 dark:text-gray-400"
              >
                Quitar
              </button>
            </div>
            <div className="text-sm space-y-0.5">
              <p className="text-gray-500 dark:text-gray-400">
                Plan: <span className="line-through">${applied.original_price?.toFixed(2)}</span>
              </p>
              <p className="text-green-600 dark:text-green-400">
                Descuento: −${applied.discount_amount?.toFixed(2)}
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">
                Total: ${applied.final_price?.toFixed(2)} USD
                {!isFreeWithPromo && (
                  <span className="font-normal text-gray-500 dark:text-gray-400">
                    {' '}(S/ {amountPEN})
                  </span>
                )}
              </p>
            </div>
          </div>
        )}

        {promoError && (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 p-2.5 text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="mt-0.5 w-3.5 h-3.5 flex-shrink-0" />
            <span>{promoError}</span>
          </div>
        )}
      </div>

      {isFreeWithPromo ? (
        <>
          <button
            type="button"
            onClick={handleActivateFree}
            disabled={activateFree.isPending}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <PartyPopper className="w-4 h-4" />
            {activateFree.isPending ? 'Activando cuenta...' : 'Activar mi cuenta'}
          </button>
          <p className="text-center text-xs text-gray-400">
            Tu cuenta se activará de inmediato, sin pago ni comprobante.
          </p>
        </>
      ) : (
        <>
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

          {isError && !extractPromoRejection(error) && (
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
        </>
      )}
    </div>
  )
}
