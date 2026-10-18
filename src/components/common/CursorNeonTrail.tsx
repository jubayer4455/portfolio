'use client'

import { useEffect, useRef } from 'react'

interface Props {
  enabled?: boolean
  accentColor?: string
}

interface Particle {
  x: number
  y: number
  size: number
  alpha: number
  color: string
}

interface Ripple {
  x: number
  y: number
  radius: number
  maxRadius: number
  alpha: number
}

export default function CursorNeonTrail({ enabled = true, accentColor = '#F97316' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (!enabled) return
    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const particles: Particle[] = []
    const ripples: Ripple[] = []
    let mouse = { x: -100, y: -100, isMoving: false }
    let lastMoveTime = 0

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
      mouse.isMoving = true
      lastMoveTime = performance.now()

      // Spawn 1-2 tiny glowing particles on move
      if (particles.length < 25) {
        particles.push({
          x: e.clientX + (Math.random() - 0.5) * 6,
          y: e.clientY + (Math.random() - 0.5) * 6,
          size: Math.random() * 3 + 1.5,
          alpha: 0.6,
          color: accentColor,
        })
      }
    }

    const handleTouchStart = (e: TouchEvent) => {
      if (!e.touches[0]) return
      const touch = e.touches[0]
      ripples.push({
        x: touch.clientX,
        y: touch.clientY,
        radius: 4,
        maxRadius: 40,
        alpha: 0.5,
      })
    }

    window.addEventListener('resize', handleResize, { passive: true })
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      // 1. Mouse cursor soft ambient glow
      const now = performance.now()
      if (now - lastMoveTime < 1000 && mouse.x > 0 && mouse.y > 0) {
        const rad = 25
        const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, rad)
        grad.addColorStop(0, `${accentColor}40`)
        grad.addColorStop(1, 'transparent')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(mouse.x, mouse.y, rad, 0, Math.PI * 2)
        ctx.fill()
      }

      // 2. Trailing particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.alpha -= 0.025
        p.size *= 0.96

        if (p.alpha <= 0 || p.size <= 0.5) {
          particles.splice(i, 1)
          continue
        }

        ctx.save()
        ctx.globalAlpha = p.alpha
        ctx.fillStyle = p.color
        ctx.shadowColor = p.color
        ctx.shadowBlur = 8
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      // 3. Touch ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i]
        r.radius += 1.8
        r.alpha -= 0.02

        if (r.alpha <= 0 || r.radius >= r.maxRadius) {
          ripples.splice(i, 1)
          continue
        }

        ctx.save()
        ctx.globalAlpha = r.alpha
        ctx.strokeStyle = accentColor
        ctx.lineWidth = 1.5
        ctx.shadowColor = accentColor
        ctx.shadowBlur = 10
        ctx.beginPath()
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2)
        ctx.stroke()
        ctx.restore()
      }

      animId = requestAnimationFrame(render)
    }

    animId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchstart', handleTouchStart)
    }
  }, [enabled, accentColor])

  if (!enabled) return null

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 transition-opacity duration-300"
      aria-hidden="true"
    />
  )
}
