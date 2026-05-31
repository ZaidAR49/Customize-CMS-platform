'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useScrollTop } from '@/hooks/useScrollTop'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { NavbarMobile } from './NavbarMobile'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { LanguageSwitcher } from './LanguageSwitcher'
import { useTranslations, useLocale } from 'next-intl'

import type { Post } from '@/types/post'

export function Navbar({ programs = [], centers = [] }: { programs?: Post[], centers?: Post[] }) {
  const scrolled = useScrollTop(80)
  const isMobile = useMediaQuery('(max-width: 768px)')
  const { data: session } = useSession()
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const navRef = useRef<HTMLElement>(null)
  const t = useTranslations('nav')
  const locale = useLocale()

  const dynamicSiteNavItems = useMemo(() => [
    { label: t('home'), href: '/' },
    {
      label: t('centers'),
      href: '#',
      children: centers.map((c) => ({ label: locale === 'ar' ? c.title : (c.title_en || c.title), href: `/centers/${c.slug}` })),
    },
    {
      label: t('programs'),
      href: '#',
      children: programs.map((p) => ({ label: locale === 'ar' ? p.title : (p.title_en || p.title), href: `/programs/${p.slug}` })),
    },
    { label: t('news'), href: '/news' },
    { label: t('about'), href: '/about' },
    { label: t('contact'), href: '/contact' },
  ], [programs, centers, t, locale])

  const navItems = useMemo(
    () => (session?.user ? [...dynamicSiteNavItems, { label: t('dashboard'), href: '/dashboard' }] : dynamicSiteNavItems),
    [session?.user, dynamicSiteNavItems, t]
  )

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  if (isMobile) return <NavbarMobile navItems={navItems} />

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300 bg-white',
        scrolled ? 'shadow-md' : 'shadow-sm'
      )}
    >
      <div className="w-full px-4 md:px-8 lg:px-12 xl:px-16 flex h-16 items-center justify-between">
        {/* Logo + Name */}
        <Link href="/" className="flex items-center gap-3 group ">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white transition-transform group-hover:scale-105 overflow-hidden border border-(--fcps-bg-soft) shadow-sm">
            <img src="/images/logo.png" alt="Logo" width={48} height={48} className="object-contain" />
          </div>
          <span className="  text-lg xl:text-xl font-bold text-(--fcps-primary-dark) whitespace-nowrap">
            {t('societyName')}
          </span>
        </Link>

        {/* Right Side: Nav Links + Language Switcher */}
        <div className="flex items-center gap-4 lg:gap-8">
          {/* Nav Links */}
          <nav ref={navRef} className="flex items-center gap-2 lg:gap-4">
          {navItems.map((item) => (
            <div
              key={item.label}
              className="relative"
            >
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-1 rounded-md px-2 lg:px-3 py-2 text-base font-medium transition-colors whitespace-nowrap',
                  'text-(--fcps-text) hover:text-(--fcps-primary) hover:bg-(--fcps-bg-soft)'
                )}
                onClick={(e) => {
                  if (item.children) {
                    e.preventDefault()
                    setOpenDropdown(openDropdown === item.label ? null : item.label)
                  } else {
                    setOpenDropdown(null)
                  }
                }}
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
                      onClick={() => setOpenDropdown(null)}
                      className="block rounded-md px-3 py-2 text-sm text-(--fcps-text) transition-colors hover:bg-(--fcps-bg-soft) hover:text-(--fcps-primary)"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          </nav>
  
          {/* Language Switcher */}
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  )
}
