'use client'

import { ChevronUp } from 'lucide-react'
import { useScrollTop } from '@/hooks/useScrollTop'

export function ScrollToTop() {
  const scrolled = useScrollTop(300)

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!scrolled) return null

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 left-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-(--fcps-primary) text-white shadow-lg transition-all duration-300 hover:bg-(--fcps-primary-dark) hover:scale-110 animate-fade-in"
      aria-label="العودة للأعلى"
    >
      <ChevronUp className="h-6 w-6" />
    </button>
  )
}
