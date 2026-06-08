import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import GoogleCallbackClient from '@/features/auth/GoogleCallbackClient'

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-10 w-10 text-primary-600 animate-spin" />
        </div>
      }
    >
      <GoogleCallbackClient />
    </Suspense>
  )
}
