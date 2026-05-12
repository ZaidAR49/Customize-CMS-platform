import { UsersTable } from '@/components/dashboard/UsersTable'

export default function DashboardUsersPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-(--fcps-dark)">إدارة المستخدمين</h2>
        <p className="text-sm text-(--fcps-gray-text) mt-1">عرض وإدارة المستخدمين المسجلين في النظام</p>
      </div>
      <UsersTable />
    </div>
  )
}
