import { NextResponse } from 'next/server'
import { commentsService } from '@/lib/services/comments.service'
import { createCommentSchema } from '@/lib/validations/comment.schema'

/** Public endpoint: submit a comment (stored as pending for dashboard review). */
export async function POST(req: Request) {
  try {
    const json = await req.json()
    const parsed = createCommentSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid payload' },
        { status: 400 }
      )
    }

    const { post_id, author_name, author_email, body } = parsed.data
    const email = author_email?.trim() ? author_email.trim() : null

    await commentsService.createPending({
      post_id,
      author_name: author_name.trim(),
      author_email: email,
      body: body.trim(),
    })

    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
