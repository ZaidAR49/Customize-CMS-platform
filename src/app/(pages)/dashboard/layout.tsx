import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Image from 'next/image'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { UserMenu } from '@/components/dashboard/UserMenu'

export const metadata = { title: 'لوحة التحكم' }

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  const user = session?.user

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 bg-(--fcps-gray-light)">
        {/* Dashboard Header */}
        <header className="sticky top-0 z-40 border-b bg-white px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-(--fcps-dark)">لوحة التحكم</h1>
            <UserMenu user={user} />
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
