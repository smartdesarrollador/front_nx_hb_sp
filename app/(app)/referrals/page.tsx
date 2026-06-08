import type { Metadata } from 'next'
import ReferralsPageClient from '@/features/referrals/ReferralsPageClient'

export const metadata: Metadata = {
  title: 'Referidos | Hub de Servicios',
  description: 'Comparte tu código de referido y gana recompensas.',
}

export default function ReferralsPage() {
  return <ReferralsPageClient />
}
