import { ProgramCenterFormEditor } from '@/components/dashboard/ProgramCenterFormEditor'
import { requireEditor } from '@/lib/auth'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'dashboardPrograms' })
  return { title: t('addNew') }
}

export default async function NewProgramPage({ params }: { params: Promise<{ locale: string }> }) {
  await requireEditor()
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'dashboardPrograms' })

  return (
    <ProgramCenterFormEditor 
      mode="create" 
      type="program"
      title={t('addNew')}
      description={t('newDesc')}
      returnUrl="/dashboard/programs"
      returnLabel={t('returnToPrograms')}
    />
  )
}

