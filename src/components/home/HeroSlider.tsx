'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

/** Height bounds so the slider never gets too short or too tall */
const MIN_HEIGHT = 360
const MAX_HEIGHT = 720
const FALLBACK_HEIGHT = 520

interface HeroSliderProps {
  /** Image URLs uploaded via the dashboard. When provided, shown as real slides. */
  slides?: string[]
}

export function HeroSlider({ slides = [] }: HeroSliderProps) {
  const t = useTranslations('homePage.heroSlider')

  const fallbackSlides = [
    {
      id: 1,
      title: t('slide1Title'),
      subtitle: t('slide1Subtitle'),
      gradient: 'from-[#1b5e20] via-[#2e7d32] to-[#00695c]',
    },
    {
      id: 2,
      title: t('slide2Title'),
      subtitle: t('slide2Subtitle'),
      gradient: 'from-[#00695c] via-[#00838f] to-[#0277bd]',
    },
    {
      id: 3,
      title: t('slide3Title'),
      subtitle: t('slide3Subtitle'),
      gradient: 'from-[#0277bd] via-[#1565c0] to-[#2e7d32]',
    },
  ]

  const hasImages = slides.length > 0
  const count = hasImages ? slides.length : fallbackSlides.length

  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  // Store the natural aspect ratio (width / height) for each image slide
  const [ratios, setRatios] = useState<Record<number, number>>({})
  const sectionRef = useRef<HTMLElement>(null)

  // Preload images and measure their natural aspect ratios
  useEffect(() => {
    if (!hasImages) return
    slides.forEach((url, idx) => {
      const img = new Image()
      img.onload = () => {
        setRatios((prev) => ({ ...prev, [idx]: img.naturalWidth / img.naturalHeight }))
      }
      img.src = url
    })
  }, [slides, hasImages])

  // Compute the target height based on the current slide's aspect ratio
  const computeHeight = useCallback(() => {
    if (!hasImages) return FALLBACK_HEIGHT
    const ratio = ratios[currentSlide]
    if (!ratio) return FALLBACK_HEIGHT

    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1280
    const idealHeight = viewportWidth / ratio
    return Math.round(Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, idealHeight)))
  }, [hasImages, ratios, currentSlide])

  const [sliderHeight, setSliderHeight] = useState(FALLBACK_HEIGHT)

  // Recalculate height when current slide changes or ratios load
  useEffect(() => {
    setSliderHeight(computeHeight())
  }, [computeHeight])

  // Also recalculate on window resize
  useEffect(() => {
    function handleResize() {
      setSliderHeight(computeHeight())
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [computeHeight])

  const goToSlide = useCallback(
    (index: number) => {
      if (isAnimating) return
      setIsAnimating(true)
      setCurrentSlide(index)
      setTimeout(() => setIsAnimating(false), 500)
    },
    [isAnimating],
  )

  const nextSlide = useCallback(() => {
    goToSlide((currentSlide + 1) % count)
  }, [currentSlide, count, goToSlide])

  const prevSlide = useCallback(() => {
    goToSlide((currentSlide - 1 + count) % count)
  }, [currentSlide, count, goToSlide])

  // Auto-play
  useEffect(() => {
    const timer = setInterval(nextSlide, 4000)
    return () => clearInterval(timer)
  }, [nextSlide])

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden transition-[height] duration-700 ease-in-out"
      style={{ height: `${sliderHeight}px` }}
    >
      {hasImages ? (
        /* ── Real image slides ──────────────────────────────────────── */
        <>
          {slides.map((url, index) => (
            <div
              key={url}
              className={cn(
                'absolute inset-0 transition-all duration-700',
                index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105',
              )}
            >
              {/* Background image — object-cover, adapts via container height */}
              <img
                src={url}
                alt={`${t('sliderTitle')} ${index + 1}`}
                className="absolute inset-0 w-full h-full object-cover"
                loading={index === 0 ? 'eager' : 'lazy'}
              />
            </div>
          ))}
          {/* Dark overlay for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10 z-10" />

          {/* Content (fixed/stuck on top of backgrounds) */}
          <div className="absolute inset-0 z-10 flex h-full items-center justify-center">
            <div className="text-center px-4 max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
                {t('sliderTitle')}
              </h1>
              <div className="flex gap-4 justify-center">
                <a
                  href="/about"
                  className="rounded-lg bg-white px-6 py-3 text-sm font-bold text-(--fcps-primary-dark) transition-all hover:bg-white/90 hover:scale-105 shadow-lg"
                >
                  {t('learnAboutUs')}
                </a>
                <a
                  href="/contact"
                  className="rounded-lg border-2 border-white px-6 py-3 text-sm font-bold text-white transition-all hover:bg-white/10 hover:scale-105"
                >
                  {t('contactUs')}
                </a>
              </div>
            </div>
          </div>
        </>
      ) : ( /* ── Gradient fallback slides ────────────────────────────────── */
          fallbackSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={cn(
                'absolute inset-0 flex items-center justify-center transition-all duration-700',
                `bg-gradient-to-l ${slide.gradient}`,
                index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105',
              )}
            >
              {/* Decorative elements */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/5 blur-sm" />
                <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-white/5 blur-sm" />
                <div className="absolute top-1/3 left-1/4 h-40 w-40 rounded-full bg-white/3" />
                <div
                  className="absolute inset-0 opacity-[0.03]"
                  style={{
                    backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                    backgroundSize: '30px 30px',
                  }}
                />
              </div>

              {/* Content */}
              <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
                <h1
                  className={cn(
                    'text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight transition-all duration-700',
                    index === currentSlide
                      ? 'translate-y-0 opacity-100'
                      : 'translate-y-8 opacity-0',
                  )}
                  style={{ transitionDelay: '200ms' }}
                >
                  {slide.title}
                </h1>
                <p
                  className={cn(
                    'text-lg md:text-xl text-white/85 mb-8 leading-relaxed max-w-2xl mx-auto transition-all duration-700',
                    index === currentSlide
                      ? 'translate-y-0 opacity-100'
                      : 'translate-y-8 opacity-0',
                  )}
                  style={{ transitionDelay: '400ms' }}
                >
                  {slide.subtitle}
                </p>
                <div
                  className={cn(
                    'flex gap-4 justify-center transition-all duration-700',
                    index === currentSlide
                      ? 'translate-y-0 opacity-100'
                      : 'translate-y-8 opacity-0',
                  )}
                  style={{ transitionDelay: '600ms' }}
                >
                  <a
                    href="/about"
                    className="rounded-lg bg-white px-6 py-3 text-sm font-bold text-(--fcps-primary-dark) transition-all hover:bg-white/90 hover:scale-105 shadow-lg"
                  >
                    {t('learnAboutUs')}
                  </a>
                  <a
                    href="/contact"
                    className="rounded-lg border-2 border-white px-6 py-3 text-sm font-bold text-white transition-all hover:bg-white/10 hover:scale-105"
                  >
                    {t('contactUs')}
                  </a>
                </div>
              </div>
            </div>
          )))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute right-4 top-1/2 z-20 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-all hover:bg-white/25 hover:scale-110"
        aria-label="previous slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute left-4 top-1/2 z-20 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-all hover:bg-white/25 hover:scale-110"
        aria-label="next slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      {/* Dot Navigation */}
      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {Array.from({ length: count }).map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              'h-2.5 rounded-full transition-all duration-300',
              index === currentSlide ? 'w-8 bg-white' : 'w-2.5 bg-white/40 hover:bg-white/60',
            )}
            aria-label={`slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
