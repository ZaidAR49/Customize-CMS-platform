'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

export function ConditionalHeader() {
  const pathname = usePathname()
  if (pathname?.startsWith('/dashboard') || pathname?.startsWith('/auth')) return null
  return <Navbar />
}

export function ConditionalFooter() {
  const pathname = usePathname()
  if (pathname?.startsWith('/dashboard') || pathname?.startsWith('/auth')) return null
  return <Footer />
}
