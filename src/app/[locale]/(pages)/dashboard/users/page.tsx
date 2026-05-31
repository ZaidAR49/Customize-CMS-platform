import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { usersService } from '@/lib/services/users.service'
import { UsersTable } from '@/components/dashboard/UsersTable'

export default async function DashboardUsersPage() {
  const session = await getServerSession(authOptions)
  const isAdmin = session?.user?.role === 'admin'
  const currentUserId = session?.user?.id ?? ''

  let users: Awaited<ReturnType<typeof usersService.getAllUsers>> = []
  try {
    users = await usersService.getAllUsers()
  } catch {
    users = []
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-(--fcps-dark)">إدارة المستخدمين</h2>
        <p className="mt-1 text-sm text-(--fcps-gray-text)">
          عرض المستخدمين؛ يمكن للمسؤول إضافة مستخدمين وتعديل الأدوار والحذف. حذف المسؤول لحسابه مسموح
          فقط إذا وُجد مسؤول آخر، وسيُسجَّل خروجه تلقائياً بعد الحذف.
        </p>
      </div>
      <UsersTable users={users} isAdmin={isAdmin} currentUserId={currentUserId} />
    </div>
  )
}
