import { notFound } from 'next/navigation'
import { ProgramCenterFormEditor } from '@/components/dashboard/ProgramCenterFormEditor'
import { postsService } from '@/lib/services/posts.service'
import { requireEditor } from '@/lib/auth'
import { getTranslations } from 'next-intl/server'

interface EditProgramPageProps {
  params: Promise<{ id: string; locale: string }>
}

export async function generateMetadata({ params }: EditProgramPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'dashboardPrograms' })
  return { title: t('editProgram') }
}

export default async function EditProgramPage({ params }: EditProgramPageProps) {
  await requireEditor()
  const { id, locale } = await params
  const post = await postsService.getPostById(id)
  const t = await getTranslations({ locale, namespace: 'dashboardPrograms' })

  if (!post || post.type !== 'program') {
    notFound()
  }

  return (
    <ProgramCenterFormEditor 
      mode="edit" 
      post={post}
      type="program"
      title={t('editProgram')}
      description={t('editDesc')}
      returnUrl="/dashboard/programs"
      returnLabel={t('returnToPrograms')}
    />
  )
}

