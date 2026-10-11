'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Mail, Lock, AlertCircle, Loader2, Eye, EyeOff, Sparkles } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleFillDemo = () => {
    setEmail('admin@portfolio.com')
    setPassword('admin123')
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const cleanIdentifier = email.trim()
    if (!cleanIdentifier || !password.trim()) {
      setError('Please enter your email/username and password.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanIdentifier,
          password,
        }),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        // Fallback for direct local admin demo check
        if ((cleanIdentifier === 'admin@portfolio.com' || cleanIdentifier === 'admin') && password === 'admin123') {
          document.cookie = 'demo_admin=true; path=/; max-age=86400;'
          router.push('/admin')
          router.refresh()
          return
        }

        setError(data.error || 'Invalid credentials.')
        setLoading(false)
        return
      }

      document.cookie = 'demo_admin=true; path=/; max-age=86400;'
      router.push('/admin')
      router.refresh()
    } catch {
      if ((cleanIdentifier === 'admin@portfolio.com' || cleanIdentifier === 'admin') && password === 'admin123') {
        document.cookie = 'demo_admin=true; path=/; max-age=86400;'
        router.push('/admin')
        router.refresh()
        return
      }
      setError('Could not connect to authentication service. Try demo: admin@portfolio.com / admin123')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      {/* Background decoration */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.06] pointer-events-none"
        style={{ background: 'radial-gradient(circle, #F97316 0%, transparent 70%)' }}
      />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="glass gradient-border rounded-3xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-orange-500 flex items-center justify-center font-display font-bold text-white text-2xl mx-auto mb-4 orange-glow">
              AJ
            </div>
            <h1 className="text-white text-2xl font-bold font-display">Abdul Al Jubayer</h1>
            <p className="text-white/40 text-sm mt-1">Sign in to your bio admin panel</p>
          </div>

          {/* Quick Demo Pill */}
          <div className="mb-6 p-3 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-orange-400">
              <Sparkles size={14} />
              <span>Local Demo Available</span>
            </div>
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-white font-medium bg-orange-500/30 hover:bg-orange-500/50 px-2.5 py-1 rounded-lg transition-colors"
            >
              Fill Demo Login
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email or Username */}
            <div>
              <label htmlFor="email" className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wider">
                Email Address or Username
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  id="email"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@portfolio.com or admin"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-orange-500/60 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-12 py-3 rounded-xl glass border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-orange-500/60 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle size={15} />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="text-center text-white/30 text-xs mt-6">
            This is a protected admin area.{' '}
            <a href="/" className="text-orange-400 hover:underline">Back to site →</a>
          </p>
        </div>
      </div>
    </div>
  )
}
