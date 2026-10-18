'use client'

import { useEffect, useRef } from 'react'

export type Bio3DStyle =
  | 'particles'
  | 'orbit'
  | 'sculpture'
  | 'waves'
  | 'matrix'
  | 'fireflies'
  | 'grid'
  | 'none'

interface Props {
  style?: Bio3DStyle
  glowColor?: string
  contained?: boolean
  className?: string
}

function parseRgb(color: string): { r: number; g: number; b: number } {
  if (!color) return { r: 249, g: 115, b: 22 }
  if (color.startsWith('#')) {
    const hex = color.replace('#', '')
    if (hex.length === 6) {
      return {
        r: parseInt(hex.substring(0, 2), 16) || 249,
        g: parseInt(hex.substring(2, 4), 16) || 115,
        b: parseInt(hex.substring(4, 6), 16) || 22,
      }
    }
  }
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i)
  if (match) {
    return {
      r: parseInt(match[1], 10),
      g: parseInt(match[2], 10),
      b: parseInt(match[3], 10),
    }
  }
  return { r: 249, g: 115, b: 22 }
}

export default function Bio3DBackground({
  style = 'particles',
  glowColor = 'rgba(249,115,22,0.3)',
  contained = false,
  className = '',
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (style === 'none') return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    const parent = canvas.parentElement

    const updateDimensions = () => {
      if (!canvas) return { width: 0, height: 0 }
      let w = window.innerWidth
      let h = window.innerHeight
      if (contained && parent) {
        w = parent.clientWidth || 360
        h = parent.clientHeight || 700
      }
      canvas.width = w
      canvas.height = h
      return { width: w, height: h }
    }

    let { width, height } = updateDimensions()

    const handleResize = () => {
      const dim = updateDimensions()
      width = dim.width
      height = dim.height
    }

    window.addEventListener('resize', handleResize)
    let resizeObserver: ResizeObserver | null = null
    if (contained && parent && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => handleResize())
      resizeObserver.observe(parent)
    }

    // Mouse parallax tracking
    let mouseX = width / 2
    let mouseY = height / 2
    let targetMouseX = width / 2
    let targetMouseY = height / 2

    const handleMouseMove = (e: MouseEvent) => {
      if (contained && parent) {
        const rect = parent.getBoundingClientRect()
        targetMouseX = e.clientX - rect.left
        targetMouseY = e.clientY - rect.top
      } else {
        targetMouseX = e.clientX
        targetMouseY = e.clientY
      }
    }

    if (contained && parent) {
      parent.addEventListener('mousemove', handleMouseMove as any)
    } else {
      window.addEventListener('mousemove', handleMouseMove)
    }

    const { r, g, b } = parseRgb(glowColor)
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

    // ─────────────────────────────────────────────────────────────
    // 1. PARTICLES INITIALIZATION (Constellation Dust)
    // ─────────────────────────────────────────────────────────────
    const particleCount = contained ? 28 : isMobile ? 35 : 70
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      size: Math.random() * 2.2 + 1,
      alpha: Math.random() * 0.6 + 0.3,
      pulseSpeed: Math.random() * 0.02 + 0.01,
      pulse: Math.random() * Math.PI * 2,
    }))

    // ─────────────────────────────────────────────────────────────
    // 2. MATRIX RAIN INITIALIZATION
    // ─────────────────────────────────────────────────────────────
    const matrixCols = Math.max(12, Math.floor(width / (contained ? 18 : 22)))
    const glyphs = '01AJ9X8F#*+~<>{}[]¥$%&'
    const matrixDrops = Array.from({ length: matrixCols }, () => ({
      y: Math.random() * -height,
      speed: Math.random() * 1.8 + 1.2,
      chars: Array.from({ length: 14 }, () => glyphs[Math.floor(Math.random() * glyphs.length)]),
      changeRate: Math.random() * 0.05 + 0.02,
    }))

    // ─────────────────────────────────────────────────────────────
    // 3. FIREFLIES INITIALIZATION (Bioluminescent Orbs)
    // ─────────────────────────────────────────────────────────────
    const fireflyCount = contained ? 18 : isMobile ? 24 : 45
    const fireflies = Array.from({ length: fireflyCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 3.5 + 2,
      glowRadius: Math.random() * 16 + 10,
      vx: (Math.random() - 0.5) * 0.5,
      vy: -Math.random() * 0.6 - 0.2, // Drift gently upward
      alpha: Math.random() * 0.7 + 0.3,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.03 + 0.015,
    }))

    let angle = 0

    // ─────────────────────────────────────────────────────────────
    // MAIN RENDER LOOP
    // ─────────────────────────────────────────────────────────────
    const render = () => {
      ctx.clearRect(0, 0, width, height)

      // Smooth mouse follow interpolation
      mouseX += (targetMouseX - mouseX) * 0.06
      mouseY += (targetMouseY - mouseY) * 0.06
      const offsetX = (mouseX - width / 2) * (contained ? 0.02 : 0.04)
      const offsetY = (mouseY - height / 2) * (contained ? 0.02 : 0.04)

      angle += 0.01

      // ── STYLE 1: PARTICLES (3D Neon Dust & Constellations) ────
      if (style === 'particles') {
        // Draw constellation lines
        const maxDist = contained ? 65 : 85
        ctx.lineWidth = 0.8
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x
            const dy = particles[i].y - particles[j].y
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < maxDist) {
              const lineAlpha = (1 - dist / maxDist) * 0.22
              ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${lineAlpha})`
              ctx.beginPath()
              ctx.moveTo(particles[i].x, particles[i].y)
              ctx.lineTo(particles[j].x, particles[j].y)
              ctx.stroke()
            }
          }
        }

        // Draw glowing particle nodes
        particles.forEach((p) => {
          p.x += p.vx + offsetX * 0.05
          p.y += p.vy + offsetY * 0.05
          p.pulse += p.pulseSpeed

          if (p.x < 0) p.x = width
          if (p.x > width) p.x = 0
          if (p.y < 0) p.y = height
          if (p.y > height) p.y = 0

          const currentAlpha = p.alpha * (0.7 + Math.sin(p.pulse) * 0.3)
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3)
          grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${currentAlpha})`)
          grad.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, ${currentAlpha * 0.5})`)
          grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)

          ctx.fillStyle = grad
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2)
          ctx.fill()

          ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha * 0.9})`
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size * 0.7, 0, Math.PI * 2)
          ctx.fill()
        })
      }

      // ── STYLE 2: ORBIT (Cosmic Gyroscope Rings) ───────────────
      else if (style === 'orbit') {
        const cx = width / 2 + offsetX * 1.5
        const cy = height * (contained ? 0.32 : 0.36) + offsetY * 1.5
        const baseRadius = Math.min(width, height) * (contained ? 0.38 : 0.28)

        // Pulsing central planetary core
        const corePulse = 18 + Math.sin(angle * 2) * 4
        const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, corePulse * 2.5)
        coreGrad.addColorStop(0, `rgba(255, 255, 255, 0.9)`)
        coreGrad.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, 0.8)`)
        coreGrad.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, 0.25)`)
        coreGrad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)
        ctx.fillStyle = coreGrad
        ctx.beginPath()
        ctx.arc(cx, cy, corePulse * 2.5, 0, Math.PI * 2)
        ctx.fill()

        // 3 concentric glowing 3D rings with different axes
        const rings = [
          { rx: baseRadius * 1.2, ry: baseRadius * 0.42, rot: angle * 0.6, tilt: Math.PI / 4, color: `rgba(${r}, ${g}, ${b}, 0.55)`, width: 2 },
          { rx: baseRadius * 0.95, ry: baseRadius * 0.32, rot: -angle * 0.8, tilt: -Math.PI / 5, color: `rgba(255, 255, 255, 0.4)`, width: 1.5 },
          { rx: baseRadius * 0.65, ry: baseRadius * 0.22, rot: angle * 1.2, tilt: Math.PI / 2.5, color: `rgba(${r}, ${g}, ${b}, 0.7)`, width: 2 },
        ]

        rings.forEach((ring) => {
          ctx.save()
          ctx.translate(cx, cy)
          ctx.rotate(ring.tilt)
          ctx.rotate(ring.rot)

          ctx.beginPath()
          ctx.ellipse(0, 0, ring.rx, ring.ry, 0, 0, Math.PI * 2)
          ctx.strokeStyle = ring.color
          ctx.lineWidth = ring.width
          ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.8)`
          ctx.shadowBlur = 12
          ctx.stroke()

          // Orbiting satellite bead
          const satAngle = angle * 2.5
          const sx = Math.cos(satAngle) * ring.rx
          const sy = Math.sin(satAngle) * ring.ry
          ctx.beginPath()
          ctx.arc(sx, sy, 4, 0, Math.PI * 2)
          ctx.fillStyle = '#ffffff'
          ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 1)`
          ctx.shadowBlur = 15
          ctx.fill()

          ctx.restore()
        })
      }

      // ── STYLE 3: SCULPTURE (3D Rotating Cyber Polyhedron) ─────
      else if (style === 'sculpture') {
        const cx = width / 2 + offsetX * 1.8
        const cy = height * (contained ? 0.32 : 0.35) + offsetY * 1.8
        const scale = Math.min(width, height) * (contained ? 0.28 : 0.22)

        // 3D Octahedron Vertices: [X, Y, Z]
        const vertices = [
          [0, -1.35, 0], // Top apex
          [1, 0, 0],     // Right
          [0, 0, 1],     // Front
          [-1, 0, 0],    // Left
          [0, 0, -1],    // Back
          [0, 1.35, 0],  // Bottom apex
        ]

        // Rotation angles
        const rotY = angle * 0.75
        const rotX = Math.sin(angle * 0.5) * 0.35 + 0.2
        const rotZ = Math.cos(angle * 0.3) * 0.15

        // Project 3D -> 2D
        const projected = vertices.map(([x, y, z]) => {
          // Rotate Y
          let x1 = x * Math.cos(rotY) + z * Math.sin(rotY)
          let z1 = -x * Math.sin(rotY) + z * Math.cos(rotY)
          // Rotate X
          let y2 = y * Math.cos(rotX) - z1 * Math.sin(rotX)
          let z2 = y * Math.sin(rotX) + z1 * Math.cos(rotX)
          // Rotate Z
          let x3 = x1 * Math.cos(rotZ) - y2 * Math.sin(rotZ)
          let y3 = x1 * Math.sin(rotZ) + y2 * Math.cos(rotZ)

          const persp = 3.2 / (3.2 + z2)
          return {
            x: cx + x3 * scale * persp,
            y: cy + y3 * scale * persp,
            z: z2,
            persp,
          }
        })

        // Triangular faces
        const faces = [
          [0, 1, 2], [0, 2, 3], [0, 3, 4], [0, 4, 1],
          [5, 2, 1], [5, 3, 2], [5, 4, 3], [5, 1, 4],
        ]

        // Draw translucent shaded faces
        faces.forEach(([a, b, c]) => {
          const avgZ = (projected[a].z + projected[b].z + projected[c].z) / 3
          const faceAlpha = Math.max(0.04, 0.15 + avgZ * 0.08)

          ctx.beginPath()
          ctx.moveTo(projected[a].x, projected[a].y)
          ctx.lineTo(projected[b].x, projected[b].y)
          ctx.lineTo(projected[c].x, projected[c].y)
          ctx.closePath()
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${faceAlpha})`
          ctx.fill()
        })

        // Draw glowing wireframe edges
        const edges = [
          [0, 1], [0, 2], [0, 3], [0, 4],
          [5, 1], [5, 2], [5, 3], [5, 4],
          [1, 2], [2, 3], [3, 4], [4, 1],
        ]

        ctx.lineWidth = 1.8
        edges.forEach(([start, end]) => {
          ctx.beginPath()
          ctx.moveTo(projected[start].x, projected[start].y)
          ctx.lineTo(projected[end].x, projected[end].y)
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.7)`
          ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.9)`
          ctx.shadowBlur = 10
          ctx.stroke()
        })

        // Draw glowing light beads at vertices
        projected.forEach((p) => {
          ctx.beginPath()
          ctx.arc(p.x, p.y, 4 * p.persp, 0, Math.PI * 2)
          ctx.fillStyle = '#ffffff'
          ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 1)`
          ctx.shadowBlur = 14
          ctx.fill()
        })
      }

      // ── STYLE 4: WAVES (Multi-layered Neon Cyber Waves) ──────
      else if (style === 'waves') {
        const waveLayers = [
          { baseY: height * 0.42, amp: 28, freq: 0.008, speed: 1.2, alpha: 0.35, width: 2.2 },
          { baseY: height * 0.52, amp: 38, freq: 0.005, speed: 0.8, alpha: 0.45, width: 2.5 },
          { baseY: height * 0.65, amp: 45, freq: 0.004, speed: 1.5, alpha: 0.55, width: 3 },
          { baseY: height * 0.78, amp: 55, freq: 0.003, speed: 0.6, alpha: 0.3, width: 1.8 },
        ]

        waveLayers.forEach((wave, idx) => {
          ctx.beginPath()
          for (let x = 0; x <= width; x += 8) {
            const y =
              wave.baseY +
              Math.sin(x * wave.freq + angle * wave.speed) * wave.amp +
              Math.cos(x * wave.freq * 0.5 + angle * 0.5) * (wave.amp * 0.4) +
              offsetY * 0.8

            if (x === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
          }

          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${wave.alpha})`
          ctx.lineWidth = wave.width
          ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.8)`
          ctx.shadowBlur = 12
          ctx.stroke()

          // Draw gradient fill beneath the lowest wave
          if (idx === 2) {
            ctx.lineTo(width, height)
            ctx.lineTo(0, height)
            ctx.closePath()
            const fillGrad = ctx.createLinearGradient(0, wave.baseY, 0, height)
            fillGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.12)`)
            fillGrad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)
            ctx.fillStyle = fillGrad
            ctx.fill()
          }
        })
      }

      // ── STYLE 5: MATRIX (Cyber Matrix Digital Stream Rain) ────
      else if (style === 'matrix') {
        ctx.font = `${contained ? '10px' : '12px'} monospace`
        const colWidth = width / matrixDrops.length

        matrixDrops.forEach((drop, col) => {
          drop.y += drop.speed
          if (drop.y > height + 200) {
            drop.y = -Math.random() * 150
            drop.speed = Math.random() * 2 + 1.2
          }

          const x = col * colWidth + colWidth / 2

          drop.chars.forEach((ch, charIdx) => {
            const charY = drop.y - charIdx * (contained ? 14 : 18)
            if (charY > -20 && charY < height + 20) {
              const isLeader = charIdx === 0
              if (isLeader) {
                ctx.fillStyle = '#ffffff'
                ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 1)`
                ctx.shadowBlur = 10
              } else {
                const charAlpha = Math.max(0, 1 - charIdx / drop.chars.length) * 0.65
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${charAlpha})`
                ctx.shadowBlur = 0
              }
              ctx.fillText(ch, x, charY)
            }
          })
        })
      }

      // ── STYLE 6: FIREFLIES (Floating Bioluminescent Orbs) ─────
      else if (style === 'fireflies') {
        fireflies.forEach((f) => {
          f.x += f.vx + Math.sin(angle * 2 + f.phase) * 0.4
          f.y += f.vy

          // Repulsion from cursor
          const dx = f.x - mouseX
          const dy = f.y - mouseY
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 80) {
            f.x += (dx / dist) * 2
            f.y += (dy / dist) * 2
          }

          if (f.y < -20) {
            f.y = height + 20
            f.x = Math.random() * width
          }
          if (f.x < 0) f.x = width
          if (f.x > width) f.x = 0

          f.phase += f.speed
          const breathe = 0.5 + Math.sin(f.phase) * 0.5
          const currentAlpha = f.alpha * breathe

          // Outer halo
          const halo = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.glowRadius * (1 + breathe * 0.3))
          halo.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${currentAlpha * 0.9})`)
          halo.addColorStop(0.35, `rgba(${r}, ${g}, ${b}, ${currentAlpha * 0.4})`)
          halo.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)
          ctx.fillStyle = halo
          ctx.beginPath()
          ctx.arc(f.x, f.y, f.glowRadius * 1.5, 0, Math.PI * 2)
          ctx.fill()

          // Bright center core
          ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha})`
          ctx.beginPath()
          ctx.arc(f.x, f.y, f.radius * 0.7, 0, Math.PI * 2)
          ctx.fill()
        })
      }

      // ── STYLE 7: GRID (Synthwave 3D Perspective Grid) ─────────
      else if (style === 'grid') {
        const horizonY = height * (contained ? 0.45 : 0.48) + offsetY * 0.5

        // Glowing horizon radiant beam
        const horizonGrad = ctx.createLinearGradient(0, horizonY - 40, 0, horizonY + 40)
        horizonGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`)
        horizonGrad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.45)`)
        horizonGrad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)
        ctx.fillStyle = horizonGrad
        ctx.fillRect(0, horizonY - 40, width, 80)

        // Horizon line
        ctx.strokeStyle = `rgba(255, 255, 255, 0.7)`
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(0, horizonY)
        ctx.lineTo(width, horizonY)
        ctx.stroke()

        // Converging perspective lines radiating from center horizon
        const linesCount = contained ? 14 : 22
        const cx = width / 2 + offsetX * 1.5
        for (let i = -linesCount / 2; i <= linesCount / 2; i++) {
          const bottomX = cx + i * (width / (linesCount * 0.38))
          ctx.beginPath()
          ctx.moveTo(cx, horizonY)
          ctx.lineTo(bottomX, height)
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.28)`
          ctx.lineWidth = 1.2
          ctx.stroke()
        }

        // Horizontal grid lines with perspective compression
        const gridLines = 10
        const speed = (angle * 25) % 35
        for (let i = 1; i <= gridLines; i++) {
          const progress = Math.pow((i * 35 + speed) / (gridLines * 35), 2.2)
          const lineY = horizonY + progress * (height - horizonY)
          if (lineY <= height) {
            ctx.beginPath()
            ctx.moveTo(0, lineY)
            ctx.lineTo(width, lineY)
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${progress * 0.45})`
            ctx.lineWidth = 1 + progress * 1.5
            ctx.stroke()
          }
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      if (contained && parent) {
        parent.removeEventListener('mousemove', handleMouseMove as any)
        if (resizeObserver) resizeObserver.disconnect()
      } else {
        window.removeEventListener('mousemove', handleMouseMove)
      }
    }
  }, [style, glowColor, contained])

  if (style === 'none') return null

  return (
    <canvas
      ref={canvasRef}
      className={`${
        contained
          ? 'absolute inset-0 pointer-events-none z-0 w-full h-full rounded-[32px]'
          : 'fixed inset-0 pointer-events-none z-0 w-full h-full'
      } ${className}`}
    />
  )
}
