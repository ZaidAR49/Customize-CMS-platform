import { Sidebar } from '@/components/dashboard/Sidebar'

export const metadata = { title: 'لوحة التحكم' }

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 bg-[var(--fcps-gray-light)]">
        {/* Dashboard Header */}
        <header className="sticky top-0 z-40 border-b bg-white px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-[var(--fcps-dark)]">لوحة التحكم</h1>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--fcps-primary)] text-xs font-bold text-white">
                م
              </div>
              <span className="text-sm font-medium text-[var(--fcps-text)]">مدير النظام</span>
            </div>
          </div>
        </header>
        {/* Dashboard Content */}
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
