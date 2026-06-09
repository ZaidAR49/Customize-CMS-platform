import { HeroSlider } from '@/components/home/HeroSlider'
import { TargetSectors } from '@/components/home/TargetSectors'
import { MissionVision } from '@/components/home/MissionVision'
import { StatsCounter } from '@/components/home/StatsCounter'
import { LatestNews } from '@/components/home/LatestNews'
import { organizationService } from '@/lib/services/organization.service'
import { organizationStatsService } from '@/lib/services/organization-stats.service'
import { postsService } from '@/lib/services/posts.service'
import { getLocale } from 'next-intl/server'

export const revalidate = 3600

function parseHeroSlides(metadata: unknown, locale: string): string[] {
  if (!metadata || typeof metadata !== 'object') return []
  
  const record = metadata as Record<string, unknown>
  const raw = record[`hero_slides_${locale}`] || record['hero_slides']
  
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed.filter((u): u is string => typeof u === 'string')
    } catch {
      return []
    }
  }
  if (Array.isArray(raw)) return raw.filter((u): u is string => typeof u === 'string')
  return []
}

export default async function HomePage() {
  const locale = await getLocale()
  const [org, statsRows, allPosts] = await Promise.all([
    organizationService.getOrganization(),
    organizationStatsService.getAllStats(),
    postsService.getPosts(undefined, true),
  ])

  const heroSlides = parseHeroSlides(org?.metadata, locale)
  const latestPosts = allPosts.slice(0, 3)

  const stats = {
    families: parseInt(statsRows.find(s => s.key === 'families')?.value || '0', 10),
    children: parseInt(statsRows.find(s => s.key === 'children')?.value || '0', 10),
    women: parseInt(statsRows.find(s => s.key === 'women')?.value || '0', 10),
    activities: parseInt(statsRows.find(s => s.key === 'activities')?.value || '0', 10),
  }

  const orgMission = locale === 'ar' ? org?.mission_ar : org?.mission_en
  const orgVision = locale === 'ar' ? org?.vision_ar : org?.vision_en

  return (
    <>
      <HeroSlider slides={heroSlides} />
      <TargetSectors />
      <MissionVision mission={orgMission || ''} vision={orgVision || ''} />
      <StatsCounter stats={stats} />
      <LatestNews posts={latestPosts} />
    </>
  )
}
