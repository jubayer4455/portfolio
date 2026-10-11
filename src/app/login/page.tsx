'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Mail, Lock, AlertCircle, Loader2, Eye, EyeOff, ArrowRight } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams?.get('redirectTo') || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleGoogleLogin = async () => {
    setError('')
    setGoogleLoading(true)
    try {
      const supabase = createClient()
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`,
        },
      })
      if (oauthError) {
        setError(oauthError.message)
        setGoogleLoading(false)
      }
    } catch {
      setError('Google sign-in is unavailable right now. Please sign in with email.')
      setGoogleLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const cleanEmail = email.trim()
    if (!cleanEmail || !password.trim()) {
      setError('Please provide your email and password.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          password,
        }),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setError(data.error || 'Invalid email or password.')
        setLoading(false)
        return
      }

      // Smooth redirection (Admin goes to /admin, User goes to /dashboard)
      router.push(data.redirect || redirectTo)
      router.refresh()
    } catch {
      setError('Connection error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="relative w-full max-w-md">
      <div className="glass gradient-border rounded-3xl p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-7">
          <Link href="/" className="inline-block group mb-3">
            <div className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center font-display font-bold text-white text-2xl mx-auto orange-glow group-hover:scale-105 transition-transform">
              AJ
            </div>
          </Link>
          <h1 className="text-white text-2xl font-bold font-display">Sign In</h1>
          <p className="text-white/50 text-xs mt-1">Sign in to manage your 3D Link-in-Bio profile</p>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading || loading}
          className="w-full py-3 px-4 rounded-xl glass border border-white/10 hover:border-white/25 flex items-center justify-center gap-3 text-white text-sm font-medium transition-all duration-200 hover:bg-white/[0.04] mb-4 disabled:opacity-50"
        >
          {googleLoading ? (
            <Loader2 size={16} className="animate-spin text-orange-400" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="h-px bg-white/10 flex-1" />
          <span className="text-[11px] uppercase tracking-wider text-white/30 font-semibold">Or with Email</span>
          <div className="h-px bg-white/10 flex-1" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
              Email Address or Username
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com or username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                className="w-full pl-10 pr-4 py-3 rounded-xl glass border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-orange-500/60 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              <AlertCircle size={15} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center py-3 mt-1 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Sign up link */}
        <p className="text-center text-white/50 text-xs mt-6">
          Don&apos;t have an account yet?{' '}
          <Link href="/signup" className="text-orange-400 hover:text-orange-300 font-semibold underline underline-offset-4">
            Create Free Bio Site →
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 relative py-12">
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.07] pointer-events-none"
        style={{ background: 'radial-gradient(circle, #F97316 0%, transparent 70%)' }}
      />
      <Suspense fallback={<div className="text-white/40 text-sm">Loading login...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
