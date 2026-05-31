'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from './Navbar'
import N8nChatbot from '../shared/chat-bot'

import type { Post } from '@/types/post'

export function ConditionalHeader({ programs = [], centers = [] }: { programs?: Post[], centers?: Post[] }) {
  const pathname = usePathname()
  if (pathname?.includes('/dashboard') || pathname?.includes('/auth')) return null
  return <Navbar programs={programs} centers={centers} />
}

export function ConditionalFooter({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (pathname?.includes('/dashboard') || pathname?.includes('/auth')) return null
  return <>{children}</>
}

export function ConditionalChatBot() {
  const pathname = usePathname()
  if (pathname?.includes('/dashboard') || pathname?.includes('/auth')) return null
  return <N8nChatbot />
}