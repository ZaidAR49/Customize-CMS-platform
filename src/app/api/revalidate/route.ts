import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  const body = await req.json()
  const path = body.path ?? '/'
  const tag = body.tag

  // @ts-ignore
  if (tag) revalidateTag(tag as string)
  else revalidatePath(path as string, 'page')

  return NextResponse.json({ revalidated: true, path, tag, now: Date.now() })
}
