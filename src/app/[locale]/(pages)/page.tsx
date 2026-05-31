import { HeroSlider } from '@/components/home/HeroSlider'
import { TargetSectors } from '@/components/home/TargetSectors'
import { MissionVision } from '@/components/home/MissionVision'
import { StatsCounter } from '@/components/home/StatsCounter'
import { LatestNews } from '@/components/home/LatestNews'
import { organizationService } from '@/lib/services/organization.service'
import { organizationStatsService } from '@/lib/services/organization-stats.service'
import { postsService } from '@/lib/services/posts.service'

function parseHeroSlides(metadata: unknown): string[] {
  if (!metadata || typeof metadata !== 'object') return []
  const raw = (metadata as Record<string, unknown>)['hero_slides']
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
  const [org, statsRows, allPosts] = await Promise.all([
    organizationService.getOrganization(),
    organizationStatsService.getAllStats(),
    postsService.getPosts(undefined, true),
  ])

  const heroSlides = parseHeroSlides(org?.metadata)
  const latestPosts = allPosts.slice(0, 3)

  const stats = {
    families: parseInt(statsRows.find(s => s.key === 'families')?.value || '0', 10),
    children: parseInt(statsRows.find(s => s.key === 'children')?.value || '0', 10),
    women: parseInt(statsRows.find(s => s.key === 'women')?.value || '0', 10),
    activities: parseInt(statsRows.find(s => s.key === 'activities')?.value || '0', 10),
  }

  return (
    <>
      <HeroSlider slides={heroSlides} />
      <TargetSectors />
      <MissionVision mission={org?.mission_ar || ''} vision={org?.vision_ar || ''} />
      <StatsCounter stats={stats} />
      <LatestNews posts={latestPosts} />
    </>
  )
}
