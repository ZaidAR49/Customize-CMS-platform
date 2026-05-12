'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const slides = [
  {
    id: 1,
    title: 'مقتطفات من نشاطاتنا',
    subtitle: 'جمعية حماية الأسرة والطفولة تعمل على حماية ودعم الأسر والأطفال في إربد',
    gradient: 'from-[#1b5e20] via-[#2e7d32] to-[#00695c]',
  },
  {
    id: 2,
    title: 'نحو طفولة آمنة',
    subtitle: 'نسعى لتوفير بيئة آمنة ومحفزة لنمو الأطفال وحمايتهم من جميع أشكال العنف',
    gradient: 'from-[#00695c] via-[#00838f] to-[#0277bd]',
  },
  {
    id: 3,
    title: 'معاً من أجل مجتمع أفضل',
    subtitle: 'نؤمن بأن التعاون المجتمعي هو الأساس لبناء مستقبل مشرق لأطفالنا وأسرنا',
    gradient: 'from-[#0277bd] via-[#1565c0] to-[#2e7d32]',
  },
]

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const goToSlide = useCallback((index: number) => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentSlide(index)
    setTimeout(() => setIsAnimating(false), 500)
  }, [isAnimating])

  const nextSlide = useCallback(() => {
    goToSlide((currentSlide + 1) % slides.length)
  }, [currentSlide, goToSlide])

  const prevSlide = useCallback(() => {
    goToSlide((currentSlide - 1 + slides.length) % slides.length)
  }, [currentSlide, goToSlide])

  // Auto-play
  useEffect(() => {
    const timer = setInterval(nextSlide, 4000)
    return () => clearInterval(timer)
  }, [nextSlide])

  return (
    <section className="relative h-[520px] overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={cn(
            'absolute inset-0 flex items-center justify-center transition-all duration-700',
            `bg-gradient-to-l ${slide.gradient}`,
            index === currentSlide
              ? 'opacity-100 scale-100'
              : 'opacity-0 scale-105'
          )}
        >
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/5 blur-sm" />
            <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-white/5 blur-sm" />
            <div className="absolute top-1/3 left-1/4 h-40 w-40 rounded-full bg-white/3" />
            {/* Grid pattern */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '30px 30px'
            }} />
          </div>

          {/* Content */}
          <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
            <h1
              className={cn(
                'text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight transition-all duration-700',
                index === currentSlide
                  ? 'translate-y-0 opacity-100'
                  : 'translate-y-8 opacity-0'
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
                  : 'translate-y-8 opacity-0'
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
                  : 'translate-y-8 opacity-0'
              )}
              style={{ transitionDelay: '600ms' }}
            >
              <a
                href="/about"
                className="rounded-lg bg-white px-6 py-3 text-sm font-bold text-(--fcps-primary-dark) transition-all hover:bg-white/90 hover:scale-105 shadow-lg"
              >
                تعرف علينا
              </a>
              <a
                href="/contact"
                className="rounded-lg border-2 border-white px-6 py-3 text-sm font-bold text-white transition-all hover:bg-white/10 hover:scale-105"
              >
                تواصل معنا
              </a>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute right-4 top-1/2 z-20 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-all hover:bg-white/25 hover:scale-110"
        aria-label="الشريحة السابقة"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute left-4 top-1/2 z-20 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-all hover:bg-white/25 hover:scale-110"
        aria-label="الشريحة التالية"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      {/* Dot Navigation */}
      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              'h-2.5 rounded-full transition-all duration-300',
              index === currentSlide
                ? 'w-8 bg-white'
                : 'w-2.5 bg-white/40 hover:bg-white/60'
            )}
            aria-label={`الشريحة ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
