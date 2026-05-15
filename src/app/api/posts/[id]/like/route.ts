import { NextResponse } from 'next/server'
import { postsService } from '@/lib/services/posts.service'

/** Public endpoint: increment post likes. */
export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: 'Invalid post id' }, { status: 400 })
    }

    const likes = await postsService.incrementLikes(id)
    return NextResponse.json({ ok: true, likes })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
