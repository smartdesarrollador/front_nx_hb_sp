import { Suspense } from 'react'
import type { Metadata } from 'next'
import DashboardPageClient from '@/features/dashboard/DashboardPageClient'

export const metadata: Metadata = {
  title: 'Dashboard | Hub de Servicios',
  description: 'Resumen de tu cuenta, servicios activos y uso del plan.',
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <DashboardPageClient />
    </Suspense>
  )
}
