import { ProgramCenterFormEditor } from '@/components/dashboard/ProgramCenterFormEditor'
import { requireEditor } from '@/lib/auth'

export default async function NewCenterPage() {
  await requireEditor()

  return (
    <ProgramCenterFormEditor 
      mode="create" 
      type="center"
      title="إضافة مركز جديد"
      description="أدخل تفاصيل مركز الجمعية."
      returnUrl="/dashboard/centers"
      returnLabel="العودة إلى مراكز الجمعية"
    />
  )
}
