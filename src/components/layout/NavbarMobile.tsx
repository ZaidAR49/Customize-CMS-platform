'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useScrollTop } from '@/hooks/useScrollTop'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Menu, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import logo from '@/app/icon.png'
import type { SiteNavItem } from '@/lib/site-nav'

export function NavbarMobile({ navItems = [] }: { navItems?: SiteNavItem[] }) {
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
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white overflow-hidden border border-(--fcps-bg-soft) shadow-sm">
            <Image src={logo} alt="Logo" width={36} height={36} className="object-cover" />
          </div>
          <span className="text-sm font-bold text-(--fcps-primary-dark)">
            حماية الأسرة والطفولة
          </span>
        </Link>

        {/* Mobile Menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-(--fcps-bg-soft)"
              aria-label="القائمة"
            >
              <Menu className="h-5 w-5 text-(--fcps-text)" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] p-0">
            <SheetTitle className="sr-only">القائمة الرئيسية</SheetTitle>
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b px-4 py-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white overflow-hidden border border-(--fcps-bg-soft) shadow-sm">
                    <Image src={logo} alt="Logo" width={36} height={36} className="object-cover" />
                  </div>
                  <span className="text-sm font-bold text-(--fcps-primary-dark)">القائمة</span>
                </div>
              </div>

              {/* Nav Items */}
              <nav className="flex-1 overflow-y-auto p-4">
                {navItems.map((item) => {
                  if (item.children) {
                    return (
                      <div key={item.label}>
                        <button
                          onClick={() => toggleSection(item.label)}
                          className="flex w-full items-center justify-between rounded-md px-3 py-3 text-sm font-medium text-(--fcps-text) hover:bg-(--fcps-bg-soft)"
                        >
                          {item.label}
                          <ChevronDown className={cn('h-4 w-4 transition-transform', expandedSection === item.label && 'rotate-180')} />
                        </button>
                        {expandedSection === item.label && (
                          <div className="mr-4 space-y-1 border-r-2 border-(--fcps-primary-light) pr-3">
                            {item.children.map(child => (
                              <Link
                                key={child.href}
                                href={child.href}
                                onClick={() => setOpen(false)}
                                className="block rounded-md px-3 py-2 text-sm text-(--fcps-gray-text) hover:text-(--fcps-primary)"
                              >
                                {child.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  }

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "block rounded-md px-3 py-3 text-sm font-medium text-(--fcps-text) hover:bg-(--fcps-bg-soft) hover:text-(--fcps-primary)",
                        item.href === '/dashboard' && "mt-2 border border-(--fcps-primary-light) bg-(--fcps-bg-soft) text-(--fcps-primary) font-semibold hover:bg-(--fcps-primary) hover:text-white"
                      )}
                    >
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
