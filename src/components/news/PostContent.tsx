import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Heart, Calendar, User } from 'lucide-react'
import Link from 'next/link'
import type { Post } from '@/types/post'

const typeLabels: Record<string, string> = {
  news: 'أخبار',
  activity: 'نشاطات',
  program: 'برامج',
  center: 'مراكز',
}

interface PostContentProps {
  post: Post
  related: Post[]
}

export function PostContent({ post, related }: PostContentProps) {
  return (
    <div className="container py-12">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <article className="lg:col-span-2">
          {/* Hero Image */}
          <div className="relative mb-8 h-64 md:h-96 overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--fcps-primary)] to-[var(--fcps-primary-light)]">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-8xl opacity-15">📰</div>
            </div>
          </div>

          {/* Article Header */}
          <div className="mb-8">
            <Badge className="mb-4 bg-[var(--fcps-bg-soft)] text-[var(--fcps-primary)] hover:bg-[var(--fcps-bg-soft)]">
              {typeLabels[post.type]}
            </Badge>
            <h1 className="mb-4 text-3xl md:text-4xl font-bold text-[var(--fcps-dark)] leading-tight">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--fcps-gray-text)]">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--fcps-primary)] text-white text-xs">
                  <User className="h-4 w-4" />
                </div>
                <span>{post.author.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {new Date(post.publishedAt).toLocaleDateString('ar-JO', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
              <div className="flex items-center gap-1.5">
                <Heart className="h-4 w-4 text-red-400" />
                {post.likes} إعجاب
              </div>
            </div>
          </div>

          {/* Article Body */}
          <div
            className="prose prose-lg max-w-none text-[var(--fcps-text)] leading-relaxed
              [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-[var(--fcps-primary-dark)] [&_h2]:mt-8 [&_h2]:mb-4
              [&_p]:mb-4 [&_p]:leading-[1.8]
              [&_ul]:pr-6 [&_ul]:space-y-2
              [&_li]:text-[var(--fcps-gray-text)]"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24">
            <h3 className="mb-6 text-xl font-bold text-[var(--fcps-primary-dark)]">
              مقالات ذات صلة
            </h3>
            <div className="space-y-4">
              {related.map((relatedPost) => (
                <Card
                  key={relatedPost.id}
                  className="group overflow-hidden border-none shadow-sm transition-all hover:shadow-md"
                >
                  <Link href={`/news/${relatedPost.slug}`} className="block p-4">
                    <p className="mb-1 text-xs text-[var(--fcps-gray-text)]">
                      {new Date(relatedPost.publishedAt).toLocaleDateString('ar-JO', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <h4 className="text-sm font-bold leading-snug text-[var(--fcps-dark)] transition-colors group-hover:text-[var(--fcps-primary)]">
                      {relatedPost.title}
                    </h4>
                    <p className="mt-2 text-xs text-[var(--fcps-gray-text)] line-clamp-2">
                      {relatedPost.excerpt}
                    </p>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
