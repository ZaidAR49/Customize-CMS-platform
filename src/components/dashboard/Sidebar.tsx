'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, Users, Settings, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOut } from 'next-auth/react'
import Image from 'next/image'
import logo from '@/app/icon.png'

const sidebarItems = [
  { label: 'لوحة التحكم', href: '/dashboard', icon: LayoutDashboard },
  { label: 'المقالات', href: '/dashboard/posts', icon: FileText },
  { label: 'المستخدمون', href: '/dashboard/users', icon: Users },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="sticky top-0 flex h-screen w-64 flex-col border-l bg-[var(--fcps-bg-soft)]">
      {/* Header */}
      <div className="flex items-center gap-3 border-b px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white overflow-hidden border border-[var(--fcps-bg-soft)] shadow-sm">
          <Image src={logo} alt="Logo" width={40} height={40} className="object-cover" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-[var(--fcps-dark)]">لوحة التحكم</h2>
          <p className="text-xs text-[var(--fcps-gray-text)]">إدارة المحتوى</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-[var(--fcps-primary)] text-white shadow-sm'
                  : 'text-[var(--fcps-gray-text)] hover:bg-white hover:text-[var(--fcps-primary)]'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-[var(--fcps-gray-text)] transition-colors hover:bg-white hover:text-red-500"
        >
          <LogOut className="h-4 w-4" />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  )
}
