import { OrganizationSettingsForm } from '@/components/dashboard/OrganizationSettingsForm'
import { organizationService } from '@/lib/services/organization.service'

export const metadata = { title: 'معلومات المنظمة' }

export default async function DashboardSettingsPage() {
  const org = await organizationService.getOrganization()

  if (!org) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-900">
        <p className="font-medium">لا توجد سجل منظمة في قاعدة البيانات.</p>
        <p className="mt-2 text-sm text-amber-800/90">
          أضف صفاً في جدول <code className="rounded bg-white/80 px-1">organization</code> أو شغّل سكربت
          التهيئة في <code className="rounded bg-white/80 px-1">schema.sql</code>.
        </p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="mb-2 text-2xl font-bold text-(--fcps-dark)">معلومات المنظمة</h2>
      <p className="mb-8 text-sm text-(--fcps-gray-text)">
        تعديل كل الحقول المخزنة في جدول المنظمة (الظهور على الموقع والإحصائيات وروابط التواصل).
      </p>
      <OrganizationSettingsForm organization={org} />
    </div>
  )
}
