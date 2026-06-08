import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const APP_PATHS = [
  '/dashboard',
  '/services',
  '/subscription',
  '/billing',
  '/team',
  '/referrals',
  '/notifications',
  '/support',
  '/profile',
  '/desktop',
]
const AUTH_PATHS = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const refreshToken = request.cookies.get('hub-refreshToken')?.value

  const isApp  = APP_PATHS.some((p) => pathname.startsWith(p))
  const isAuth = AUTH_PATHS.some((p) => pathname.startsWith(p))

  if (isApp && !refreshToken)
    return NextResponse.redirect(
      new URL(`/login?next=${encodeURIComponent(pathname)}`, request.url),
    )

  if (isAuth && refreshToken)
    return NextResponse.redirect(new URL('/dashboard', request.url))

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
}
