import type { Metadata } from 'next'
import BillingPageClient from '@/features/billing/BillingPageClient'

export const metadata: Metadata = {
  title: 'Facturación | Hub de Servicios',
  description: 'Gestiona tus métodos de pago e historial de facturas.',
}

export default function BillingPage() {
  return <BillingPageClient />
}
