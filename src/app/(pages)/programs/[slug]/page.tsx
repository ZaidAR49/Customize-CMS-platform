import { notFound } from 'next/navigation'
import { postsService } from '@/lib/services/posts.service'
import { preparePostHtml } from '@/lib/post-html'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const program = await postsService.getPostBySlug(slug)
  if (!program || program.type !== 'program') return { title: 'غير موجود' }
  return { title: program.title, description: program.descripcion ?? '' }
}

export default async function ProgramPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const program = await postsService.getPostBySlug(slug)
  if (!program || program.type !== 'program') notFound()

  const postBodyHtml = preparePostHtml(program.descripcion) || (program.excerpt ? `<p>${program.excerpt}</p>` : '')

  return (
    <>
      <div className="w-full h-16 md:h-24" aria-hidden="true" />
      <div className="container mb-20 max-w-6xl">
        <h1 className="text-3xl md:text-4xl font-medium text-gray-700 mb-12 text-center">
          {program.title}
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
