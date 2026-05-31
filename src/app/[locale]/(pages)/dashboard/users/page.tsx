import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { usersService } from '@/lib/services/users.service'
import { UsersTable } from '@/components/dashboard/UsersTable'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'dashboardUsers' })
  return { title: t('titleManagement') }
}

export default async function DashboardUsersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const session = await getServerSession(authOptions)
  const isAdmin = session?.user?.role === 'admin'
  const currentUserId = session?.user?.id ?? ''
  const t = await getTranslations({ locale, namespace: 'dashboardUsers' })

  let users: Awaited<ReturnType<typeof usersService.getAllUsers>> = []
  try {
    users = await usersService.getAllUsers()
  } catch {
    users = []
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-(--fcps-dark)">{t('titleManagement')}</h2>
        <p className="mt-1 text-sm text-(--fcps-gray-text)">
          {t('description')}
        </p>
      </div>
      <UsersTable users={users} isAdmin={isAdmin} currentUserId={currentUserId} />
    </div>
  )
}
