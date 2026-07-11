'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { isAxiosError } from 'axios'
import { AlertCircle, CheckCircle2, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useCreateTicket } from '../hooks/useCreateTicket'
import type { NewTicketRequest } from '../types'

const schema = z.object({
  subject: z.string().min(5, 'Minimo 5 caracteres'),
  category: z.enum(['billing', 'technical', 'account', 'general']),
  priority: z.enum(['urgente', 'alta', 'media', 'baja']),
  description: z.string().min(20, 'Minimo 20 caracteres'),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
}

export default function NewTicketModal({ open, onClose }: Props) {
  const { t } = useTranslation('support')
  const [step, setStep] = useState<1 | 2>(1)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const createTicket = useCreateTicket()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (!open) {
      setStep(1)
      setSubmitError(null)
      reset()
    }
  }, [open, reset])

  const onSubmit = (data: FormData) => {
    setSubmitError(null)
    createTicket.mutate(data as NewTicketRequest, {
      onSuccess: () => {
        setStep(2)
        setTimeout(() => {
          onClose()
          reset()
          setStep(1)
        }, 1500)
      },
      onError: (error) => {
        setSubmitError(
          isAxiosError(error) && error.response?.status === 403
            ? t('errorNoPermission')
            : t('errorGeneric')
        )
      },
    })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>

        {step === 1 ? (
          <>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('modalTitle')}</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('titleField')}</label>
                <input
                  {...register('subject')}
                  placeholder={t('titlePlaceholder')}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('categoryField')}</label>
                <select
                  {...register('category')}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">-- {t('categoryField')} --</option>
                  <option value="billing">{t('categoryBilling')}</option>
                  <option value="technical">{t('categoryTechnical')}</option>
                  <option value="account">{t('categoryAccount')}</option>
                  <option value="general">{t('categoryGeneral')}</option>
                </select>
                {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('priorityField')}</label>
                <select
                  {...register('priority')}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">-- {t('priorityField')} --</option>
                  <option value="baja">{t('priorityBaja')}</option>
                  <option value="media">{t('priorityMedia')}</option>
                  <option value="alta">{t('priorityAlta')}</option>
                  <option value="urgente">{t('priorityUrgente')}</option>
                </select>
                {errors.priority && <p className="text-xs text-red-500 mt-1">{errors.priority.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('descField')}</label>
                <textarea
                  {...register('description')}
                  rows={4}
                  placeholder={t('descPlaceholder')}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
                {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
              </div>

              {submitError && (
                <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={createTicket.isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {createTicket.isPending && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {createTicket.isPending ? t('submitting') : t('submit')}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="text-center py-8">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-gray-900">{t('successTitle')}</h2>
            <p className="text-sm text-gray-500 mt-1">{t('successSub')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
