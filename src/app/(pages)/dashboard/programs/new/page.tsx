import { ProgramCenterFormEditor } from '@/components/dashboard/ProgramCenterFormEditor'
import { requireEditor } from '@/lib/auth'

export default async function NewProgramPage() {
  await requireEditor()

  return (
    <ProgramCenterFormEditor 
      mode="create" 
      type="program"
      title="إضافة برنامج/مشروع جديد"
      description="أدخل تفاصيل البرنامج أو المشروع."
      returnUrl="/dashboard/programs"
      returnLabel="العودة إلى البرامج والمشاريع"
    />
  )
}
