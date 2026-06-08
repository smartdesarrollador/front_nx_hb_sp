import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import SSOErrorPageClient from '@/features/auth/SSOErrorPageClient'

export default function SSOErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
        </div>
      }
    >
      <SSOErrorPageClient />
    </Suspense>
  )
}
