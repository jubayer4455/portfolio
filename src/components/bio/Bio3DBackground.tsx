'use client'

import { useEffect, useRef } from 'react'

interface Props {
  style?: 'particles' | 'orbit' | 'sculpture' | 'waves' | 'none'
  glowColor?: string
}

export default function Bio3DBackground({ style = 'particles', glowColor = 'rgba(249,115,22,0.3)' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (style === 'none') return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    // Mouse coordinates for 3D parallax
    let mouseX = width / 2
    let mouseY = height / 2
    let targetMouseX = width / 2
    let targetMouseY = height / 2

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX
      targetMouseY = e.clientY
    }
    window.addEventListener('mousemove', handleMouseMove)

    // Parse glow color rgb values
    let r = 249, g = 115, b = 22
    if (glowColor.includes('168,85,247')) { r = 168; g = 85; b = 247 } // purple
    else if (glowColor.includes('6,182,212')) { r = 6; g = 182; b = 212 } // cyan
    else if (glowColor.includes('16,185,129')) { r = 16; g = 185; b = 129 } // emerald
    else if (glowColor.includes('244,63,94')) { r = 244; g = 63; b = 94 } // rose

    // 1. PARTICLES INITIALIZATION
    const particlesCount = 85
    const particles: Array<{
      x: number
      y: number
      z: number
      size: number
      vx: number
      vy: number
      alpha: number
    }> = []

    for (let i = 0; i < particlesCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 500 + 100,
        size: Math.random() * 2.5 + 1,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.7 + 0.2,
      })
    }

    let angle = 0

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      // Smooth mouse follow
      mouseX += (targetMouseX - mouseX) * 0.05
      mouseY += (targetMouseY - mouseY) * 0.05
      const offsetX = (mouseX - width / 2) * 0.03
      const offsetY = (mouseY - height / 2) * 0.03

      angle += 0.008

      if (style === 'particles') {
        // Draw 3D Floating Dust & Constellations
        particles.forEach((p) => {
          p.x += p.vx + offsetX * 0.1
          p.y += p.vy + offsetY * 0.1

          if (p.x < 0) p.x = width
          if (p.x > width) p.x = 0
          if (p.y < 0) p.y = height
          if (p.y > height) p.y = 0

          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.alpha * 0.8})`
          ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.8)`
          ctx.shadowBlur = 10
          ctx.fill()
        })
      } else if (style === 'orbit') {
        // Draw 3D Orbiting Cosmic Rings
        const cx = width / 2 + offsetX * 2
        const cy = height / 3 + offsetY * 2
        const radiusX = 180 + Math.sin(angle) * 20
        const radiusY = 60 + Math.cos(angle) * 10

        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate(angle * 0.5)

        // Outer ring
        ctx.beginPath()
        ctx.ellipse(0, 0, radiusX, radiusY, Math.PI / 4, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.25)`
        ctx.lineWidth = 2
        ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.6)`
        ctx.shadowBlur = 15
        ctx.stroke()

        // Inner ring
        ctx.beginPath()
        ctx.ellipse(0, 0, radiusX * 0.6, radiusY * 0.6, -Math.PI / 4, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(255, 255, 255, 0.15)`
        ctx.lineWidth = 1.5
        ctx.stroke()

        // Orbiting satellite point
        const satX = Math.cos(angle * 2) * radiusX
        const satY = Math.sin(angle * 2) * radiusY
        ctx.beginPath()
        ctx.arc(satX, satY, 4, 0, Math.PI * 2)
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`
        ctx.shadowBlur = 20
        ctx.fill()

        ctx.restore()
      } else if (style === 'sculpture') {
        // Draw 3D Rotating Wireframe Cube / Octahedron
        const cx = width / 2 + offsetX * 2
        const cy = height / 3.5 + offsetY * 2
        const size = 90

        ctx.save()
        ctx.translate(cx, cy)

        const vertices = [
          [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
          [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
        ]

        // 3D rotation transform
        const rotX = angle * 0.7
        const rotY = angle * 0.9

        const projected = vertices.map(([x, y, z]) => {
          // Rotate Y
          const x1 = x * Math.cos(rotY) + z * Math.sin(rotY)
          const z1 = -x * Math.sin(rotY) + z * Math.cos(rotY)
          // Rotate X
          const y2 = y * Math.cos(rotX) - z1 * Math.sin(rotX)
          const z2 = y * Math.sin(rotX) + z1 * Math.cos(rotX)
          // Project
          const scale = 250 / (250 + z2 * size)
          return [x1 * size * scale, y2 * size * scale]
        })

        const edges = [
          [0, 1], [1, 2], [2, 3], [3, 0],
          [4, 5], [5, 6], [6, 7], [7, 4],
          [0, 4], [1, 5], [2, 6], [3, 7],
        ]

        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.35)`
        ctx.lineWidth = 1.5
        ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.8)`
        ctx.shadowBlur = 12

        edges.forEach(([start, end]) => {
          ctx.beginPath()
          ctx.moveTo(projected[start][0], projected[start][1])
          ctx.lineTo(projected[end][0], projected[end][1])
          ctx.stroke()
        })

        ctx.restore()
      } else if (style === 'waves') {
        // Draw 3D Sine Wave Ribbons
        ctx.beginPath()
        ctx.lineWidth = 2
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.2)`
        ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.5)`
        ctx.shadowBlur = 10

        for (let x = 0; x < width; x += 15) {
          const y = height * 0.35 + Math.sin(x * 0.005 + angle) * 40 + Math.cos(x * 0.01 + angle * 0.5) * 20 + offsetY
          if (x === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [style, glowColor])

  if (style === 'none') return null

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none -z-10 w-full h-full"
    />
  )
}
