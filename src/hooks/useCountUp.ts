'use client'
import { useEffect, useRef, useState } from 'react'

export function useCountUp(target: number, duration = 2000) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      const steps    = duration / 16
      const stepVal  = target / steps
      let current    = 0
      const interval = setInterval(() => {
        current += stepVal
        if (current >= target) { setCount(target); clearInterval(interval) }
        else setCount(Math.floor(current))
      }, 16)
    }, { threshold: 0.3 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [target, duration])

  return { count, ref }
}
