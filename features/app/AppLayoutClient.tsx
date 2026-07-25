'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import Navbar from './components/Navbar'
import { StorageLimitBanner } from '@/features/subscription/components/StorageLimitBanner'
import { RenewalReminderBanner } from '@/features/subscription/components/RenewalReminderBanner'

interface AppLayoutClientProps {
  children: React.ReactNode
}

export default function AppLayoutClient({ children }: AppLayoutClientProps) {
  const tenant = useAuthStore((s) => s.tenant)

  useEffect(() => {
    if (!tenant?.favicon_url) return
    let link = document.querySelector<HTMLLinkElement>("link[rel='icon']")
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    link.href = tenant.favicon_url
  }, [tenant?.favicon_url])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="pt-16 min-h-screen">
        {/* Vencimiento primero: perder el plan pesa más que quedarse sin espacio. */}
        <RenewalReminderBanner />
        <StorageLimitBanner />
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
