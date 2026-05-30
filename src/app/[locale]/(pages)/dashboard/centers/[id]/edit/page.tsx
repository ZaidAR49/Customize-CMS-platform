import { notFound } from 'next/navigation'
import { ProgramCenterFormEditor } from '@/components/dashboard/ProgramCenterFormEditor'
import { postsService } from '@/lib/services/posts.service'
import { requireEditor } from '@/lib/auth'

export default async function EditCenterPage({ params }: { params: Promise<{ id: string }> }) {
  await requireEditor()
  const { id } = await params
  const post = await postsService.getPostById(id)

  if (!post || post.type !== 'center') {
    notFound()
  }

  return (
    <ProgramCenterFormEditor 
      mode="edit" 
      post={post}
      type="center"
      title="تعديل بيانات المركز"
      description="تحديث تفاصيل مركز الجمعية."
      returnUrl="/dashboard/centers"
      returnLabel="العودة إلى مراكز الجمعية"
    />
  )
}
