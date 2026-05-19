import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { UserMenu } from '@/components/dashboard/UserMenu'
import { Toaster } from 'sonner'
import { usersService } from '@/lib/services/users.service'

export const metadata = { title: 'لوحة التحكم' }

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  // Resolve name & avatar from DB first; fall back to Google session values on failure.
  let resolvedName: string | null = session?.user?.name ?? null
  let resolvedImage: string | null = session?.user?.image ?? null

  if (session?.user?.id) {
    try {
      const dbUser = await usersService.getUserById(session.user.id)
      if (dbUser) {
        resolvedName = dbUser.name ?? resolvedName
        resolvedImage = dbUser.avatarUrl ?? resolvedImage
      }
    } catch {
      // DB unavailable — keep Google session values as fallback
    }
  }

  const user = {
    name: resolvedName,
    image: resolvedImage,
    email: session?.user?.email ?? null,
  }

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
        <Toaster richColors position="top-center" dir="rtl" />
      </div>
    </div>
  )
}
