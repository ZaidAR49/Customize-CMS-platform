import { CommentsModerationTable } from '@/components/dashboard/CommentsModerationTable'
import { commentsService } from '@/lib/services/comments.service'
import { getTranslations } from 'next-intl/server'

export const metadata = { title: 'التعليقات' }

export default async function DashboardCommentsPage() {
  let comments: Awaited<ReturnType<typeof commentsService.listForModeration>> = []
  const t = await getTranslations('dashboardComments')

  try {
    comments = await commentsService.listForModeration()
  } catch {
    comments = []
  }

  return (
    <div>
      <h2 className="mb-2 text-2xl font-bold text-(--fcps-dark)">{t('title')}</h2>
      <p className="mb-8 text-sm text-(--fcps-gray-text)">
        {t('description')}
      </p>

      <CommentsModerationTable comments={comments} />
    </div>
  )
}

