import { notFound } from 'next/navigation'
import { ProgramCenterFormEditor } from '@/components/dashboard/ProgramCenterFormEditor'
import { postsService } from '@/lib/services/posts.service'
import { requireEditor } from '@/lib/auth'
import { getTranslations } from 'next-intl/server'

export default async function EditCenterPage({ params }: { params: Promise<{ id: string }> }) {
  await requireEditor()
  const { id } = await params
  const post = await postsService.getPostById(id)
  const t = await getTranslations('dashboardCenters')

  if (!post || post.type !== 'center') {
    notFound()
  }

  return (
    <ProgramCenterFormEditor 
      mode="edit" 
      post={post}
      type="center"
      title={t('editTitle')}
      description={t('editDescription')}
      returnUrl="/dashboard/centers"
      returnLabel={t('returnToCenters')}
    />
  )
}

