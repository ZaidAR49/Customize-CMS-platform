import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { getToken } from 'next-auth/jwt'

const handleI18nRouting = createIntlMiddleware(routing)

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtectedRoute = /^\/([a-z]{2}\/)?dashboard/.test(pathname)

  if (isProtectedRoute) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    })

    if (!token) {
      const currentLocale = request.cookies.get('NEXT_LOCALE')?.value || routing.defaultLocale
      const signInUrl = new URL(`/${currentLocale}/auth/signin`, request.url)

      signInUrl.searchParams.set('callbackUrl', request.url)
      return NextResponse.redirect(signInUrl)
    }
  }

  return handleI18nRouting(request)
}

export const config = {
  // Skip all paths that should not be internationalized.
  // This skips the folders "api", "ingest", "_next", all files with an extension (e.g. .png, .css), and favicon.ico.
  matcher: ['/((?!api|ingest|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}