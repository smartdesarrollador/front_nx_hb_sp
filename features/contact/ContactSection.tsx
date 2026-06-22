'use client'

import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'
import { Send, CheckCircle, AlertCircle } from 'lucide-react'
import { useSubmitContact } from './hooks/useSubmitContact'

const schema = z.object({
  name:    z.string().min(2, 'El nombre es requerido'),
  email:   z.string().email('Email inválido'),
  phone:   z.string().optional(),
  message: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres'),
})

type FormData = z.infer<typeof schema>

export default function ContactSection() {
  const { executeRecaptcha } = useGoogleReCaptcha()
  const { mutate, isPending, isSuccess, isError, reset: resetMutation } = useSubmitContact()
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset: resetForm,
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = useCallback(
    async (formData: FormData) => {
      const token = executeRecaptcha ? await executeRecaptcha('contact_form') : 'dev'
      mutate(
        { ...formData, recaptcha_token: token },
        { onSuccess: () => resetForm() },
      )
    },
    [executeRecaptcha, mutate, resetForm],
  )

  const inputClass =
    'w-full px-4 py-3 rounded-xl bg-[rgba(234,241,248,0.07)] border border-[rgba(234,241,248,0.12)] text-[#EAF1F8] placeholder-[rgba(234,241,248,0.35)] focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors'

  if (isSuccess) {
    return (
      <section id="contacto" className="py-24 px-4 bg-[#0B2740] dark:bg-[#071D2E]">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="w-16 h-16 bg-primary-600/20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="h-8 w-8 text-primary-400" />
          </div>
          <h2 className="text-3xl font-bold text-[#EAF1F8]">¡Mensaje enviado!</h2>
          <p className="text-[rgba(234,241,248,0.72)] text-lg">
            Gracias por contactarnos. Te responderemos a la brevedad posible.<br />
            Revisa tu bandeja de entrada para el correo de confirmación.
          </p>
          <button
            onClick={() => resetMutation()}
            className="text-primary-400 hover:text-primary-300 text-sm font-medium underline-offset-4 hover:underline transition-colors"
          >
            Enviar otro mensaje
          </button>
        </div>
      </section>
    )
  }

  return (
    <section id="contacto" className="py-24 px-4 bg-[#0B2740] dark:bg-[#071D2E]">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#EAF1F8] mb-4">Contáctanos</h2>
          <p className="text-[rgba(234,241,248,0.72)] text-lg">
            ¿Tienes un proyecto en mente o alguna consulta? Escríbenos y te respondemos pronto.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-[rgba(234,241,248,0.80)] mb-1.5">
                Nombre <span className="text-primary-400">*</span>
              </label>
              <input {...register('name')} placeholder="Tu nombre" className={inputClass} />
              {errors.name && (
                <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-[rgba(234,241,248,0.80)] mb-1.5">
                Email <span className="text-primary-400">*</span>
              </label>
              <input type="email" {...register('email')} placeholder="tu@empresa.com" className={inputClass} />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[rgba(234,241,248,0.80)] mb-1.5">
              Teléfono{' '}
              <span className="text-[rgba(234,241,248,0.40)] text-xs font-normal">(opcional)</span>
            </label>
            <input {...register('phone')} placeholder="+51 999 000 000" className={inputClass} />
          </div>

          <div>
            <label className="block text-sm font-medium text-[rgba(234,241,248,0.80)] mb-1.5">
              Mensaje <span className="text-primary-400">*</span>
            </label>
            <textarea
              {...register('message')}
              rows={5}
              placeholder="Cuéntanos sobre tu proyecto o consulta..."
              className={`${inputClass} resize-none`}
            />
            {errors.message && (
              <p className="text-red-400 text-xs mt-1">{errors.message.message}</p>
            )}
          </div>

          {isError && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              Hubo un error al enviar el mensaje. Intenta de nuevo.
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-primary-600/30 hover:-translate-y-0.5 disabled:hover:translate-y-0"
          >
            <Send className="h-4 w-4" />
            {isPending ? 'Enviando...' : 'Enviar mensaje'}
          </button>
        </form>
      </div>
    </section>
  )
}
