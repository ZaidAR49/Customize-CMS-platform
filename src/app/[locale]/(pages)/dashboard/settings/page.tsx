import { OrganizationSettingsForm } from '@/components/dashboard/OrganizationSettingsForm'
import { organizationService } from '@/lib/services/organization.service'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'dashboardSettings' })
  return { title: t('titleManagement') }
}

export default async function DashboardSettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const org = await organizationService.getOrganization()
  const t = await getTranslations({ locale, namespace: 'dashboardSettings' })

  return (
    <div>
      <h2 className="mb-2 text-2xl font-bold text-(--fcps-dark)">{t('titleManagement')}</h2>
      <p className="mb-8 text-sm text-(--fcps-gray-text)">
        {org ? t('descriptionExisting') : t('descriptionNew')}
      </p>
      <OrganizationSettingsForm key={org?.id ?? 'new'} organization={org} />
    </div>
  )
}

