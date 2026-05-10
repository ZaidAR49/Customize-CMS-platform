import { posts } from '@/data/posts'
import { organization } from '@/data/organization'
import { HeroSlider } from '@/components/home/HeroSlider'
import { TargetSectors } from '@/components/home/TargetSectors'
import { MissionVision } from '@/components/home/MissionVision'
import { StatsCounter } from '@/components/home/StatsCounter'
import { LatestNews } from '@/components/home/LatestNews'

export default function HomePage() {
  const latestPosts = posts.slice(0, 3)
  return (
    <>
      <HeroSlider />
      <TargetSectors />
      <MissionVision mission={organization.missionAr} vision={organization.visionAr} />
      <StatsCounter stats={organization.stats} />
      <LatestNews posts={latestPosts} />
    </>
  )
}
