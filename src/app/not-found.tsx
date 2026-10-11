import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(249,115,22,0.08) 0%, transparent 70%)',
        }}
      />

      <div className="relative text-center max-w-lg">
        {/* 404 number */}
        <div className="relative mb-6">
          <span
            className="block font-display font-black leading-none select-none"
            style={{
              fontSize: 'clamp(8rem, 25vw, 16rem)',
              background:
                'linear-gradient(135deg, rgba(249,115,22,0.15) 0%, rgba(249,115,22,0.05) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            404
          </span>
          {/* Overlay with gradient text */}
          <span
            className="absolute inset-0 flex items-center justify-center font-display font-black leading-none"
            style={{
              fontSize: 'clamp(8rem, 25vw, 16rem)',
              background:
                'linear-gradient(135deg, #FB923C 0%, #F97316 50%, #EA580C 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              opacity: 0.8,
            }}
          >
            404
          </span>
        </div>

        {/* Message */}
        <h1 className="text-white text-2xl md:text-3xl font-bold font-display mb-3">
          Page Not Found
        </h1>
        <p className="text-white/50 text-base leading-relaxed mb-8">
          Looks like this page wandered off into the digital void.
          Let&apos;s get you back to familiar territory.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/" className="btn-primary">
            ← Back to Home
          </Link>
          <Link href="/gallery" className="btn-secondary">
            Browse Gallery
          </Link>
        </div>

        {/* Decoration line */}
        <div className="mt-12 flex items-center gap-4 justify-center">
          <div className="h-px flex-1 bg-white/10 max-w-16" />
          <p className="text-white/20 text-xs uppercase tracking-widest">Abdul Al Jubayer</p>
          <div className="h-px flex-1 bg-white/10 max-w-16" />
        </div>
      </div>
    </div>
  )
}
