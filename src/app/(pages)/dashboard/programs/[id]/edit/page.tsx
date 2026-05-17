import { notFound } from 'next/navigation'
import { ProgramCenterFormEditor } from '@/components/dashboard/ProgramCenterFormEditor'
import { postsService } from '@/lib/services/posts.service'
import { requireEditor } from '@/lib/auth'

export default async function EditProgramPage({ params }: { params: Promise<{ id: string }> }) {
  await requireEditor()
  const { id } = await params
  const post = await postsService.getPostById(id)

  if (!post || post.type !== 'program') {
    notFound()
  }

  return (
    <ProgramCenterFormEditor 
      mode="edit" 
      post={post}
      type="program"
      title="تعديل البرنامج/المشروع"
      description="تحديث تفاصيل البرنامج أو المشروع."
      returnUrl="/dashboard/programs"
      returnLabel="العودة إلى البرامج والمشاريع"
    />
  )
}
