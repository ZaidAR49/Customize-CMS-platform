import { OrganizationSettingsForm } from '@/components/dashboard/OrganizationSettingsForm'
import { organizationService } from '@/lib/services/organization.service'

export const metadata = { title: 'معلومات المنظمة' }

export default async function DashboardSettingsPage() {
  const org = await organizationService.getOrganization()

  return (
    <div>
      <h2 className="mb-2 text-2xl font-bold text-(--fcps-dark)">معلومات المنظمة</h2>
      <p className="mb-8 text-sm text-(--fcps-gray-text)">
        {org
          ? 'تعديل الحقول المخزّنة في جدول المنظمة (النصوص ثنائية اللغة، التواصل، روابط التواصل الاجتماعي، والبيانات الوصفية).'
          : 'لا يوجد سجل بعد. أنشئ أول سجل للمنظمة (الاسم بالعربية إلزامي). يمكنك لاحقاً تعديل كل الحقول من هنا.'}
      </p>
      <OrganizationSettingsForm key={org?.id ?? 'new'} organization={org} />
    </div>
  )
}
