'use client'

import { useRef, useState, useEffect, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

// ── Floating icosahedron sculpture ──────────────────────────────────────────
function IcosahedronMesh() {
  const meshRef = useRef<THREE.Mesh>(null)
  const wireRef = useRef<THREE.Mesh>(null)
  const { mouse } = useThree()

  useFrame((state) => {
    if (!meshRef.current || !wireRef.current) return
    const t = state.clock.getElapsedTime()

    // Smooth floating animation
    meshRef.current.position.y = Math.sin(t * 0.6) * 0.25
    wireRef.current.position.y = meshRef.current.position.y

    // Smooth continuous rotation with responsive mouse tilt
    const targetRotX = t * 0.15 - mouse.y * 0.4
    const targetRotY = t * 0.2 + mouse.x * 0.4

    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetRotX, 0.05)
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRotY, 0.05)
    wireRef.current.rotation.x = meshRef.current.rotation.x
    wireRef.current.rotation.y = meshRef.current.rotation.y
  })

  return (
    <group>
      {/* Solid mesh */}
      <mesh ref={meshRef} castShadow receiveShadow>
        <icosahedronGeometry args={[1.4, 1]} />
        <meshStandardMaterial
          color="#1a0a00"
          emissive="#F97316"
          emissiveIntensity={0.25}
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Wireframe overlay */}
      <mesh ref={wireRef}>
        <icosahedronGeometry args={[1.45, 1]} />
        <meshBasicMaterial
          color="#F97316"
          wireframe
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* Inner glow sphere */}
      <mesh>
        <sphereGeometry args={[0.7, 16, 16]} />
        <meshBasicMaterial
          color="#F97316"
          transparent
          opacity={0.06}
        />
      </mesh>
    </group>
  )
}

// ── Particle field ───────────────────────────────────────────────────────────
function ParticleField({ count }: { count: number }) {
  const pointsRef = useRef<THREE.Points>(null)

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 14
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14
      pos[i * 3 + 2] = (Math.random() - 0.5) * 14
    }
    return pos
  }, [count])

  useFrame((state) => {
    if (!pointsRef.current) return
    pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.03
    pointsRef.current.rotation.x = state.clock.getElapsedTime() * 0.01
  })

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#F97316"
        size={0.03}
        sizeAttenuation
        depthWrite={false}
        opacity={0.6}
      />
    </Points>
  )
}

// ── Ring decoration ─────────────────────────────────────────────────────────
function OrangeRing() {
  const ringRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!ringRef.current) return
    const t = state.clock.getElapsedTime()
    ringRef.current.rotation.x = t * 0.2
    ringRef.current.rotation.z = t * 0.1
  })

  return (
    <mesh ref={ringRef}>
      <torusGeometry args={[2.2, 0.015, 8, 80]} />
      <meshBasicMaterial color="#F97316" transparent opacity={0.25} />
    </mesh>
  )
}

// ── Inner canvas scene ───────────────────────────────────────────────────────
// ── Inner canvas scene ───────────────────────────────────────────────────────
function SceneContent({ isMobile }: { isMobile: boolean }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={1.2}
        color="#F97316"
        castShadow={!isMobile}
        shadow-mapSize-width={isMobile ? 512 : 1024}
        shadow-mapSize-height={isMobile ? 512 : 1024}
      />
      <directionalLight position={[-5, -3, -5]} intensity={0.3} color="#ffffff" />
      <pointLight position={[0, 0, 3]} intensity={0.7} color="#F97316" distance={8} />

      <IcosahedronMesh />
      <OrangeRing />
      <ParticleField count={isMobile ? 25 : 100} />

      {!isMobile && (
        <OrbitControls
          autoRotate={false}
          enableZoom={false}
          enablePan={false}
          enableRotate
          dampingFactor={0.05}
          enableDamping
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 3}
        />
      )}
    </>
  )
}

// ── Default export ───────────────────────────────────────────────────────────
export default function Scene3D() {
  const [isMobile, setIsMobile] = useState(false)
  const [isInView, setIsInView] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check, { passive: true })
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (!containerRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting)
      },
      { threshold: 0.05 }
    )
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="w-full h-full pointer-events-none select-none">
      <Canvas
        frameloop={isInView ? 'always' : 'never'}
        shadows={!isMobile}
        dpr={isMobile ? [1, 1.25] : [1, 2]}
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ pointerEvents: 'none' }}
        gl={{
          alpha: true,
          antialias: !isMobile,
          powerPreference: isMobile ? 'low-power' : 'high-performance',
        }}
      >
        <SceneContent isMobile={isMobile} />
      </Canvas>
    </div>
  )
}
