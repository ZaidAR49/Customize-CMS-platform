'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const languages = [
  {
    code: 'ar',
    label: 'العربية',
    shortLabel: 'AR',
    flagSrc: '/ar-icon.png',
    flagAlt: 'Jordan',
  },
  {
    code: 'en',
    label: 'English',
    shortLabel: 'EN',
    flagSrc: '/en-icon.png',
    flagAlt: 'USA',
  },
] as const

function Flag({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      width={20}
      height={14}
      className="rounded-sm object-cover shadow-sm border border-black/10"
      style={{ display: 'inline-block', flexShrink: 0 }}
    />
  )
}

type Locale = (typeof languages)[number]['code']

export function LanguageSwitcher({ placement = 'bottom' }: { placement?: 'top' | 'bottom' }) {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Derive locale directly from the URL so it updates immediately after navigation
  const localeFromPath = pathname.split('/')[1] as Locale
  const locale = languages.some((l) => l.code === localeFromPath) ? localeFromPath : 'ar'

  const current = languages.find((l) => l.code === locale) ?? languages[0]

  function switchLocale(newLocale: Locale) {
    // pathname from next/navigation includes the locale prefix, e.g. '/ar/test'
    // Replace segment [1] (the locale) with the new locale → '/en/test'
    const segments = pathname.split('/')
    segments[1] = newLocale
    router.push(segments.join('/'))
    router.refresh();
    setOpen(false)
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        id="language-switcher-btn"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-all duration-200',
          'border border-(--fcps-bg-soft) bg-white hover:bg-(--fcps-bg-soft)',
          'text-(--fcps-text) hover:text-(--fcps-primary)',
          'shadow-sm hover:shadow',
          open && 'bg-(--fcps-bg-soft) text-(--fcps-primary) border-(--fcps-primary-light)'
        )}
      >
        <Flag src={current.flagSrc} alt={current.flagAlt} />

        <span className="font-semibold tracking-wide">{current.shortLabel}</span>
        <ChevronDown
          className={cn(
            'h-3 w-3 transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="listbox"
          aria-label="اختر اللغة / Select Language"
          className={cn(
            'absolute z-50',
            placement === 'top' ? 'bottom-full mb-1.5' : 'top-full mt-1.5',
            'min-w-[160px] rounded-lg border border-(--fcps-bg-soft)',
            'bg-white p-1 shadow-lg',
            'animate-fade-in',
            /* position: open towards visible side */
            locale === 'ar' ? 'right-0' : 'left-0'
          )}
        >
          {languages.map((lang) => {
            const isActive = lang.code === locale
            return (
              <button
                key={lang.code}
                role="option"
                aria-selected={isActive}
                onClick={() => switchLocale(lang.code)}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors duration-150',
                  isActive
                    ? 'bg-(--fcps-bg-soft) text-(--fcps-primary) font-semibold'
                    : 'text-(--fcps-text) hover:bg-(--fcps-bg-soft) hover:text-(--fcps-primary)'
                )}
              >
                <Flag src={lang.flagSrc} alt={lang.flagAlt} />
                <span className="flex flex-col items-start">
                  <span className="font-medium leading-tight">{lang.label}</span>
                </span>
                {isActive && (
                  <span className="mr-auto h-1.5 w-1.5 rounded-full bg-(--fcps-primary)" />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
