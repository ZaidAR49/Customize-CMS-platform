'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  Users,
  LogOut,
  Building2,
  MessageSquare,
  ExternalLink,
  BarChart3,
  Images,
  Target,
  MapPin,
  DatabaseBackup,
  FolderOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOut } from 'next-auth/react'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'
import { useTranslations } from 'next-intl'

export function Sidebar() {
  const t = useTranslations('dashboardNav')
  const pathname = usePathname()

  const sidebarItems = [
    { label: t('overview'),        href: '/dashboard',                icon: LayoutDashboard },
    { label: t('posts'),           href: '/dashboard/posts',          icon: FileText        },
    { label: t('gallery'),         href: '/dashboard/gallery',        icon: Images          },
    { label: t('users'),           href: '/dashboard/users',          icon: Users           },
    { label: t('statistics'),      href: '/dashboard/statistics',     icon: BarChart3       },
    { label: t('categories'),      href: '/dashboard/categories',     icon: FolderOpen      },
    { label: t('settings'),        href: '/dashboard/settings',       icon: Building2       },
    { label: t('comments'),        href: '/dashboard/comments',       icon: MessageSquare   },
    { label: t('dataManagement'),  href: '/dashboard/data-management',icon: DatabaseBackup  },
  ]

  return (
    <aside className="sticky top-0 flex h-screen w-64 flex-col border-l bg-(--fcps-bg-soft)">
      {/* Header */}
      <div className="flex items-center gap-3 border-b px-6 py-5">
        <Link
          href="/"
          className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-(--fcps-bg-soft) bg-white shadow-sm transition-opacity hover:opacity-90"
          title={t('logoTitle')}
        >
          <img src="/images/logo.png" alt={t('logoAlt')} width={40} height={40} className="object-contain" />
        </Link>
        <div>
          <h2 className="text-sm font-bold text-(--fcps-dark)">{t('headerTitle')}</h2>
          <p className="text-xs text-(--fcps-gray-text)">{t('headerSubtitle')}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4 overflow-y-auto min-h-0">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-(--fcps-primary) text-white shadow-sm'
                  : 'text-(--fcps-gray-text) hover:bg-white hover:text-(--fcps-primary)'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}

        <hr className="my-4 border-(--fcps-bg-soft)" />

        <Link
          href="/dashboard/programs"
          className={cn(
            'flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all',
            pathname.startsWith('/dashboard/programs')
              ? 'bg-(--fcps-primary) text-white shadow-sm'
              : 'text-(--fcps-gray-text) hover:bg-white hover:text-(--fcps-primary)'
          )}
        >
          <Target className="h-4 w-4" />
          {t('programs')}
        </Link>

        <Link
          href="/dashboard/centers"
          className={cn(
            'flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all',
            pathname.startsWith('/dashboard/centers')
              ? 'bg-(--fcps-primary) text-white shadow-sm'
              : 'text-(--fcps-gray-text) hover:bg-white hover:text-(--fcps-primary)'
          )}
        >
          <MapPin className="h-4 w-4" />
          {t('centers')}
        </Link>

        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex w-full items-center gap-3 rounded-lg border border-dashed border-(--fcps-primary)/30 bg-white/80 px-4 py-2.5 text-sm font-medium text-(--fcps-primary) transition-all hover:bg-white hover:shadow-sm"
        >
          <ExternalLink className="h-4 w-4 shrink-0" />
          {t('viewSite')}
        </Link>
      </nav>

      {/* Footer */}
      <div className="border-t p-4 flex flex-col gap-3">
        <div className="flex justify-start">
          <LanguageSwitcher placement="top" />
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-(--fcps-gray-text) transition-colors hover:bg-white hover:text-red-500"
        >
          <LogOut className="h-4 w-4" />
          {t('signOut')}
        </button>
      </div>
    </aside>
  )
}
