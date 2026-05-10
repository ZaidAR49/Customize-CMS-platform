import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const mockUsers = [
  { id: '1', name: 'مدير النظام', email: 'admin@fcpsjo.org', role: 'admin', createdAt: '2024-01-01' },
  { id: '2', name: 'محرر المحتوى', email: 'editor@fcpsjo.org', role: 'editor', createdAt: '2024-02-15' },
  { id: '3', name: 'مشاهد', email: 'viewer@fcpsjo.org', role: 'viewer', createdAt: '2024-03-20' },
]

const roleLabels: Record<string, string> = {
  admin: 'مدير',
  editor: 'محرر',
  viewer: 'مشاهد',
}

const roleColors: Record<string, string> = {
  admin: 'bg-red-100 text-red-700',
  editor: 'bg-blue-100 text-blue-700',
  viewer: 'bg-gray-100 text-gray-700',
}

export function UsersTable() {
  return (
    <div className="rounded-lg border bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-[var(--fcps-bg-soft)]">
            <TableHead className="text-right font-bold">المستخدم</TableHead>
            <TableHead className="text-right font-bold">البريد الإلكتروني</TableHead>
            <TableHead className="text-right font-bold">الدور</TableHead>
            <TableHead className="text-right font-bold">تاريخ الانضمام</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockUsers.map((user) => (
            <TableRow key={user.id} className="hover:bg-[var(--fcps-bg-soft)]/50">
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-[var(--fcps-primary)] text-white text-xs">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{user.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-sm text-[var(--fcps-gray-text)]" dir="ltr">
                {user.email}
              </TableCell>
              <TableCell>
                <Badge className={`${roleColors[user.role]} border-none text-xs`}>
                  {roleLabels[user.role]}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-[var(--fcps-gray-text)]">
                {new Date(user.createdAt).toLocaleDateString('ar-JO')}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
