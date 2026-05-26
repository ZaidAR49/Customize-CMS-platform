'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import N8nChatbot from '../shared/chat-bot'

import type { Post } from '@/types/post'

export function ConditionalHeader({ programs = [], centers = [] }: { programs?: Post[], centers?: Post[] }) {
  const pathname = usePathname()
  if (pathname?.startsWith('/dashboard') || pathname?.startsWith('/auth')) return null
  return <Navbar programs={programs} centers={centers} />
}

export function ConditionalFooter() {
  const pathname = usePathname()
  if (pathname?.startsWith('/dashboard') || pathname?.startsWith('/auth')) return null
  return <Footer />
}
export function ConditionalChatBot() {
  const pathname = usePathname()
  if (pathname?.startsWith('/dashboard') || pathname?.startsWith('/auth')) return null
  return <N8nChatbot />
}