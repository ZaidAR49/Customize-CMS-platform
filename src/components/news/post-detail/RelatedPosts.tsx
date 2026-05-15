import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import type { Post } from '@/types/post'
import { formatSiteDate } from '@/lib/date-format'

interface RelatedPostsProps {
  posts: Post[]
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null

  return (
    <section className="mb-12">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {posts.map((post) => (
          <article
            key={post.id}
            className="group overflow-hidden rounded-lg border border-[#e0e0e0] bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <Link href={`/news/${post.slug}`} className="relative block aspect-[16/10] overflow-hidden bg-(--fcps-bg-soft)">
              {post.coverImage ? (
                <Image
                  src={post.coverImage}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center text-4xl opacity-20">
                  📰
                </span>
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                <ArrowLeft className="h-8 w-8 text-white opacity-0 transition-opacity group-hover:opacity-100" />
              </span>
            </Link>
            <div className="p-4">
              <p className="mb-2 text-xs text-[#777777]">{formatSiteDate(post.publishedAt)}</p>
              <h4 className="mb-3 text-base font-bold leading-snug text-[#1a1a1a]">
                <Link
                  href={`/news/${post.slug}`}
                  className="transition-colors hover:text-[#0073aa]"
                >
                  {post.title}
                </Link>
              </h4>
              <Separator className="mb-3" />
              <Link
                href={`/news/${post.slug}`}
                className="inline-flex items-center gap-1 text-sm font-medium text-[#0073aa] hover:text-[#005580]"
              >
                اقرأ المزيد
                <ArrowLeft className="h-3 w-3" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
