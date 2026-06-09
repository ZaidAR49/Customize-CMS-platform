import { notFound } from 'next/navigation'
import { postsService } from '@/lib/services/posts.service'
import { preparePostHtml } from '@/lib/post-html'
import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const center = await postsService.getPostBySlug(slug)
  if (!center || center.type !== 'center') return { title: 'Not Found' }
  const locale = await getLocale()
  const title = locale === 'ar' ? center.title : (center.title_en || center.title)
  const description = locale === 'ar' ? center.descripcion : (center.descripcion_en || center.descripcion)
  return { title, description: description ?? '' }
}

export default async function CenterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const center = await postsService.getPostBySlug(slug)
  if (!center || center.type !== 'center') notFound()

  const locale = await getLocale()
  const title = locale === 'ar' ? center.title : (center.title_en || center.title)
  const description = locale === 'ar' ? center.descripcion : (center.descripcion_en || center.descripcion)
  const excerpt = locale === 'ar' ? center.excerpt : (center.excerpt_en || center.excerpt)

  const postBodyHtml = preparePostHtml(description) || (excerpt ? `<p>${excerpt}</p>` : '')

  return (
    <>
      <div className="w-full h-16 md:h-24" aria-hidden="true" />
      <div className="container mb-20 max-w-6xl">
        <h1 className="text-3xl md:text-4xl font-medium text-gray-700 mb-12 text-center">
          {title}
        </h1>
        {postBodyHtml && (
          <div
            className="post-html-content"
            dangerouslySetInnerHTML={{ __html: postBodyHtml }}
          />
        )}
      </div>
    </>
  )
}

