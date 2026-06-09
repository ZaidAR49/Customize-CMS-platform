'use server'

import { getServerSession } from 'next-auth'
import { revalidatePath, revalidateTag } from 'next/cache'
import { authOptions } from '@/lib/auth'
import { commentsService } from '@/lib/services/comments.service'
import { moderateCommentSchema } from '@/lib/validations/comment.schema'
import { z } from 'zod'

export async function moderateCommentAction(raw: unknown) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return { success: false as const, error: 'غير مصرّح — للمسؤولين فقط.' }
    }

    const parsed = moderateCommentSchema.safeParse(raw)
    if (!parsed.success) {
      return { success: false as const, error: parsed.error.issues[0]?.message ?? 'بيانات غير صالحة' }
    }

    const { id, status } = parsed.data

    await commentsService.updateModeration(id, {
      status,
      moderated_at: new Date().toISOString(),
      moderated_by: session.user.id,
    })

    revalidateTag('comments', 'max')
    revalidatePath('/dashboard/comments')
    revalidatePath('/[locale]/news/[slug]', 'page')
    return { success: true as const }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'تعذّر تحديث التعليق'
    return { success: false as const, error: message }
  }
}

export async function deleteCommentAction(raw: unknown) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return { success: false as const, error: 'غير مصرّح — للمسؤولين فقط.' }
    }

    const parsed = z.object({ id: z.string().uuid() }).safeParse(raw)
    if (!parsed.success) {
      return { success: false as const, error: parsed.error.issues[0]?.message ?? 'بيانات غير صالحة' }
    }

    await commentsService.deleteComment(parsed.data.id)

    revalidateTag('comments')
    revalidatePath('/dashboard/comments')
    revalidatePath('/[locale]/news/[slug]', 'page')
    return { success: true as const }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'تعذّر حذف التعليق'
    return { success: false as const, error: message }
  }
}
