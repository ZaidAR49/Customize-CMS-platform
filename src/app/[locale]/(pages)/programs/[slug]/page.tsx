import { notFound } from 'next/navigation'
import { postsService } from '@/lib/services/posts.service'
import { preparePostHtml } from '@/lib/post-html'
import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const program = await postsService.getPostBySlug(slug)
  if (!program || program.type !== 'program') return { title: 'Not Found' }
  const locale = await getLocale()
  const title = locale === 'ar' ? program.title : (program.title_en || program.title)
  const description = locale === 'ar' ? program.descripcion : (program.descripcion_en || program.descripcion)
  return { title, description: description ?? '' }
}

export default async function ProgramPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const program = await postsService.getPostBySlug(slug)
  if (!program || program.type !== 'program') notFound()

  const locale = await getLocale()
  const title = locale === 'ar' ? program.title : (program.title_en || program.title)
  const description = locale === 'ar' ? program.descripcion : (program.descripcion_en || program.descripcion)
  const excerpt = locale === 'ar' ? program.excerpt : (program.excerpt_en || program.excerpt)

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

