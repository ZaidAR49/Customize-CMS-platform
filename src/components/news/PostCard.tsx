import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Heart, ArrowLeft } from 'lucide-react'
import type { Post } from '@/types/post'
import { formatSiteDate, formatSiteNumber } from '@/lib/date-format'
import { useLocale, useTranslations } from 'next-intl'

const typeColors: Record<string, string> = {
  news: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
  activity: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
  program: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
  center: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
}

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const locale = useLocale()
  const t = useTranslations('newsPage.sidebar')
  const tNav = useTranslations('nav')
  const tCard = useTranslations('newsPage')

  const title = locale === 'ar' ? post.title : (post.title_en || post.title)
  const excerpt = locale === 'ar' ? post.excerpt : (post.excerpt_en || post.excerpt)
  const activeSlug = locale === 'en' ? (post.slug_en || post.slug) : post.slug

  const typeLabels: Record<string, string> = {
    news: t('newsBadge') || 'أخبار',
    activity: t('activityBadge') || 'نشاطات',
    program: tNav('programs') || 'برامج',
    center: tNav('centers') || 'مراكز',
  }

  return (
    <Card className="group overflow-hidden border-none shadow-(--fcps-shadow-card) transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-(--fcps-primary) to-(--fcps-primary-light)">
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl opacity-20">📰</div>
          </div>
        )}
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        {/* Badge */}
        <div className="absolute top-3 right-3 z-10">
          <Badge className={`${typeColors[post.type]} border-none text-xs font-medium`}>
            {typeLabels[post.type] || post.type}
          </Badge>
        </div>
      </div>

      <CardContent className="p-5">
        {/* Date */}
        <p className="mb-2 text-xs text-(--fcps-gray-text)">
          {formatSiteDate(post.publishedAt)}
        </p>

        {/* Title */}
        <h3 className="mb-2 text-lg font-bold leading-tight text-(--fcps-dark) transition-colors group-hover:text-(--fcps-primary)">
          <Link href={`/news/${activeSlug}`} className="block">
            {title}
          </Link>
        </h3>

        {/* Excerpt */}
        <p className="mb-4 text-sm leading-relaxed text-(--fcps-gray-text) line-clamp-2">
          {excerpt}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between border-t pt-3">
          <Link
            href={`/news/${activeSlug}`}
            className="flex items-center gap-1 text-sm font-medium text-(--fcps-primary) transition-colors hover:text-(--fcps-primary-dark)"
          >
            {tCard('readMore') || 'اقرأ المزيد'}
            <ArrowLeft className={`h-3 w-3 ${locale === 'en' ? 'rotate-180' : ''}`} />
          </Link>
          <div className="flex items-center gap-1 text-sm text-(--fcps-gray-text)">
            <Heart className="h-3.5 w-3.5 text-red-400" />
            {formatSiteNumber(post.likes)}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
