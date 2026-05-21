import { posts } from '@/data/posts'
import { organization } from '@/data/organization'
import { HeroSlider } from '@/components/home/HeroSlider'
import { TargetSectors } from '@/components/home/TargetSectors'
import { MissionVision } from '@/components/home/MissionVision'
import { StatsCounter } from '@/components/home/StatsCounter'
import { LatestNews } from '@/components/home/LatestNews'
import { organizationService } from '@/lib/services/organization.service'

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
  const latestPosts = posts.slice(0, 3)

  const org = await organizationService.getOrganization()
  const heroSlides = parseHeroSlides(org?.metadata)

  return (
    <>
      <HeroSlider slides={heroSlides} />
      <TargetSectors />
      <MissionVision mission={organization.missionAr} vision={organization.visionAr} />
      <StatsCounter stats={organization.stats} />
      <LatestNews posts={latestPosts} />
    </>
  )
}
