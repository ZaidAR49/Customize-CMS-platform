import { CommentsModerationTable } from '@/components/dashboard/CommentsModerationTable'
import { commentsService } from '@/lib/services/comments.service'

export const metadata = { title: 'التعليقات' }

export default async function DashboardCommentsPage() {
  let comments: Awaited<ReturnType<typeof commentsService.listForModeration>> = []

  try {
    comments = await commentsService.listForModeration()
  } catch {
    comments = []
  }

  return (
    <div>
      <h2 className="mb-2 text-2xl font-bold text-(--fcps-dark)">إدارة التعليقات</h2>
      <p className="mb-8 text-sm text-(--fcps-gray-text)">
        مراجعة التعليقات الواردة، قبولها أو رفضها قبل ظهورها على الموقع (أو استخدامها في منطق العرض
        حسب تصميمك).
      </p>

      <CommentsModerationTable comments={comments} />
    </div>
  )
}
