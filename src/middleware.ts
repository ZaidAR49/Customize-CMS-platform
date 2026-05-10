import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  // Dashboard route protection
  // In Phase 3 with NextAuth fully configured, this will use withAuth
  // For now, allow access (auth will be checked client-side)
  const isDash = req.nextUrl.pathname.startsWith('/dashboard')

  if (isDash) {
    // TODO: Once NextAuth is configured with real credentials,
    // replace this with proper withAuth middleware
    // For now, allow through for development
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
