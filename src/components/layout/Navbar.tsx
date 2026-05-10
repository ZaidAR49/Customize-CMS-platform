'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useScrollTop } from '@/hooks/useScrollTop'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { NavbarMobile } from './NavbarMobile'
import { centers } from '@/data/centers'
import { programs } from '@/data/programs'
import { ChevronDown, Shield, LogIn } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'الرئيسية', href: '/' },
  {
    label: 'مراكز الجمعية',
    href: '#',
    children: centers.map(c => ({ label: c.nameAr, href: `/centers/${c.slug}` }))
  },
  {
    label: 'البرامج والمشاريع',
    href: '#',
    children: programs.map(p => ({ label: p.nameAr, href: `/programs/${p.slug}` }))
  },
  { label: 'نشاطات وأخبار', href: '/news' },
  { label: 'عن الجمعية', href: '/about' },
  { label: 'اتصل بنا', href: '/contact' },
]

export function Navbar() {
  const scrolled = useScrollTop(80)
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  if (isMobile) return <NavbarMobile />

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300 bg-white',
        scrolled ? 'shadow-md' : 'shadow-sm'
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        {/* Logo + Name */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--fcps-primary)] text-white transition-transform group-hover:scale-110">
            <Shield className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold text-[var(--fcps-primary-dark)]">
            جمعية حماية الأسرة والطفولة
          </span>
        </Link>

        {/* Nav Links */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => item.children && setOpenDropdown(item.label)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  'text-[var(--fcps-text)] hover:text-[var(--fcps-primary)] hover:bg-[var(--fcps-bg-soft)]'
                )}
                onClick={(e) => item.children && e.preventDefault()}
              >
                {item.label}
                {item.children && <ChevronDown className="h-3 w-3" />}
              </Link>

              {/* Dropdown */}
              {item.children && openDropdown === item.label && (
                <div className="absolute top-full right-0 z-50 mt-1 min-w-[220px] rounded-lg border bg-white p-2 shadow-lg animate-fade-in">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="block rounded-md px-3 py-2 text-sm text-[var(--fcps-text)] transition-colors hover:bg-[var(--fcps-bg-soft)] hover:text-[var(--fcps-primary)]"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Auth Button */}
          <Link
            href="/api/auth/signin"
            className="mr-2 flex items-center gap-2 rounded-md border border-[var(--fcps-primary)] px-4 py-2 text-sm font-medium text-[var(--fcps-primary)] transition-all hover:bg-[var(--fcps-primary)] hover:text-white"
          >
            <LogIn className="h-4 w-4" />
            تسجيل الدخول
          </Link>
        </nav>
      </div>
    </header>
  )
}
