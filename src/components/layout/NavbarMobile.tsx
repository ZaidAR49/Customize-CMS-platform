'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useScrollTop } from '@/hooks/useScrollTop'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { centers } from '@/data/centers'
import { programs } from '@/data/programs'
import { Menu, Shield, ChevronDown, LogIn, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function NavbarMobile() {
  const scrolled = useScrollTop(80)
  const [open, setOpen] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300 bg-white',
        scrolled ? 'shadow-md' : 'shadow-sm'
      )}
    >
      <div className="container flex h-14 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--fcps-primary)] text-white">
            <Shield className="h-4 w-4" />
          </div>
          <span className="text-sm font-bold text-[var(--fcps-primary-dark)]">
            حماية الأسرة والطفولة
          </span>
        </Link>

        {/* Mobile Menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-[var(--fcps-bg-soft)]"
              aria-label="القائمة"
            >
              <Menu className="h-5 w-5 text-[var(--fcps-text)]" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] p-0">
            <SheetTitle className="sr-only">القائمة الرئيسية</SheetTitle>
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b px-4 py-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--fcps-primary)] text-white">
                    <Shield className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-bold text-[var(--fcps-primary-dark)]">القائمة</span>
                </div>
              </div>

              {/* Nav Items */}
              <nav className="flex-1 overflow-y-auto p-4">
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-3 text-sm font-medium text-[var(--fcps-text)] hover:bg-[var(--fcps-bg-soft)] hover:text-[var(--fcps-primary)]"
                >
                  الرئيسية
                </Link>

                {/* Centers Dropdown */}
                <div>
                  <button
                    onClick={() => toggleSection('centers')}
                    className="flex w-full items-center justify-between rounded-md px-3 py-3 text-sm font-medium text-[var(--fcps-text)] hover:bg-[var(--fcps-bg-soft)]"
                  >
                    مراكز الجمعية
                    <ChevronDown className={cn('h-4 w-4 transition-transform', expandedSection === 'centers' && 'rotate-180')} />
                  </button>
                  {expandedSection === 'centers' && (
                    <div className="mr-4 space-y-1 border-r-2 border-[var(--fcps-primary-light)] pr-3">
                      {centers.map(c => (
                        <Link
                          key={c.slug}
                          href={`/centers/${c.slug}`}
                          onClick={() => setOpen(false)}
                          className="block rounded-md px-3 py-2 text-sm text-[var(--fcps-gray-text)] hover:text-[var(--fcps-primary)]"
                        >
                          {c.nameAr}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Programs Dropdown */}
                <div>
                  <button
                    onClick={() => toggleSection('programs')}
                    className="flex w-full items-center justify-between rounded-md px-3 py-3 text-sm font-medium text-[var(--fcps-text)] hover:bg-[var(--fcps-bg-soft)]"
                  >
                    البرامج والمشاريع
                    <ChevronDown className={cn('h-4 w-4 transition-transform', expandedSection === 'programs' && 'rotate-180')} />
                  </button>
                  {expandedSection === 'programs' && (
                    <div className="mr-4 space-y-1 border-r-2 border-[var(--fcps-primary-light)] pr-3">
                      {programs.map(p => (
                        <Link
                          key={p.slug}
                          href={`/programs/${p.slug}`}
                          onClick={() => setOpen(false)}
                          className="block rounded-md px-3 py-2 text-sm text-[var(--fcps-gray-text)] hover:text-[var(--fcps-primary)]"
                        >
                          {p.nameAr}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <Link
                  href="/news"
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-3 text-sm font-medium text-[var(--fcps-text)] hover:bg-[var(--fcps-bg-soft)] hover:text-[var(--fcps-primary)]"
                >
                  نشاطات وأخبار
                </Link>
                <Link
                  href="/about"
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-3 text-sm font-medium text-[var(--fcps-text)] hover:bg-[var(--fcps-bg-soft)] hover:text-[var(--fcps-primary)]"
                >
                  عن الجمعية
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-3 text-sm font-medium text-[var(--fcps-text)] hover:bg-[var(--fcps-bg-soft)] hover:text-[var(--fcps-primary)]"
                >
                  اتصل بنا
                </Link>
              </nav>

              {/* Auth Button */}
              <div className="border-t p-4">
                <Link
                  href="/api/auth/signin"
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-[var(--fcps-primary)] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--fcps-primary-dark)]"
                >
                  <LogIn className="h-4 w-4" />
                  تسجيل الدخول
                </Link>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
