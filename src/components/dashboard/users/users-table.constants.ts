import type { UserRole } from '@/types/user'

export const NOT_ALLOWED_AR =
  'لا يُسمح لك بتنفيذ هذا الإجراء. إضافة المستخدمين والتعديل والحذف متاحة لمسؤولي النظام فقط.'

export const roleLabels: Record<UserRole, string> = {
  admin: 'مدير',
  editor: 'محرر',
  viewer: 'مشاهد',
}

export const roleColors: Record<string, string> = {
  admin: 'bg-red-100 text-red-700',
  editor: 'bg-blue-100 text-blue-700',
  viewer: 'bg-gray-100 text-gray-700',
}

export const roleSelectClassName =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50'
