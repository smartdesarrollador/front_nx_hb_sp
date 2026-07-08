'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import AuthLayout from '@/features/auth/components/AuthLayout'
import { useAcceptInvite } from '@/features/auth/hooks/useAcceptInvite'

const schema = z
  .object({
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

export default function AcceptInvitePageClient() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const { mutate, isPending, isError } = useAcceptInvite()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  if (!token) {
    return (
      <AuthLayout>
        <div className="text-center space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            El enlace de invitación no es válido o ha expirado.
          </p>
          <Link
            href="/login"
            className="text-primary-600 hover:text-primary-700 font-medium text-sm"
          >
            Volver al inicio de sesión
          </Link>
        </div>
      </AuthLayout>
    )
  }

  function onSubmit(data: FormData) {
    mutate({ token: token!, password: data.password })
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Configura tu contraseña
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
        Crea una contraseña para activar tu cuenta.
      </p>

      {isError && (
        <div
          role="alert"
          className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-300"
        >
          El enlace es inválido o ha expirado.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nueva contraseña
          </label>
          <input
            type="password"
            autoComplete="new-password"
            {...register('password')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            placeholder="Mínimo 8 caracteres"
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Confirmar contraseña
          </label>
          <input
            type="password"
            autoComplete="new-password"
            {...register('confirmPassword')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            placeholder="Repite tu contraseña"
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          {isPending ? 'Activando...' : 'Activar cuenta'}
        </button>
      </form>
    </AuthLayout>
  )
}
