import { ProgramCenterFormEditor } from '@/components/dashboard/ProgramCenterFormEditor'
import { requireEditor } from '@/lib/auth'
import { getTranslations } from 'next-intl/server'

export default async function NewCenterPage() {
  await requireEditor()
  const t = await getTranslations('dashboardCenters')

  return (
    <ProgramCenterFormEditor 
      mode="create" 
      type="center"
      title={t('addNewCenter')}
      description={t('newDescription')}
      returnUrl="/dashboard/centers"
      returnLabel={t('returnToCenters')}
    />
  )
}

