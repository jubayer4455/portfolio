'use client'

import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Mail, Lock, User, AtSign, AlertCircle, Loader2, Eye, EyeOff, Sparkles, CheckCircle2 } from 'lucide-react'

function SignupForm() {
  const router = useRouter()

  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleNameChange = (val: string) => {
    setDisplayName(val)
    if (!username || username === displayName.toLowerCase().replace(/[^a-z0-9]/g, '')) {
      setUsername(val.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 20))
    }
  }

  const handleGoogleSignup = async () => {
    setError('')
    setGoogleLoading(true)
    try {
      const supabase = createClient()
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback?redirectTo=/dashboard`,
        },
      })
      if (oauthError) {
        setError(oauthError.message)
        setGoogleLoading(false)
      }
    } catch {
      setError('Google signup unavailable right now. Please create your account with email.')
      setGoogleLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const cleanEmail = email.trim()
    const cleanUser = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '')
    const cleanName = displayName.trim()

    if (!cleanName || !cleanUser || !cleanEmail || !password) {
      setError('Please fill in all required fields.')
      return
    }

    if (cleanUser.length < 3) {
      setError('Username must be at least 3 characters long.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: cleanName,
          username: cleanUser,
          email: cleanEmail,
          password,
        }),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setError(data.error || 'Failed to create account. Please try again.')
        setLoading(false)
        return
      }

      setSuccess('Account created successfully! Preparing your dashboard...')
      setTimeout(() => {
        router.push(data.redirect || '/dashboard')
        router.refresh()
      }, 800)
    } catch {
      setError('Connection error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="relative w-full max-w-md">
      <div className="glass gradient-border rounded-3xl p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-block group mb-3">
            <div className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center font-display font-bold text-white text-2xl mx-auto orange-glow group-hover:scale-105 transition-transform">
              AJ
            </div>
          </Link>
          <h1 className="text-white text-2xl font-bold font-display">Create Your Bio Profile</h1>
          <p className="text-white/50 text-xs mt-1">
            Build your personalized Link-in-Bio page with your photos & social links
          </p>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignup}
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
          <span>Sign up with Google</span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="h-px bg-white/10 flex-1" />
          <span className="text-[11px] uppercase tracking-wider text-white/30 font-semibold">Or with Email</span>
          <div className="h-px bg-white/10 flex-1" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Full Name */}
          <div>
            <label className="block text-white/60 text-xs font-medium mb-1 uppercase tracking-wider">
              Your Full Name
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Sarah Rahman"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-orange-500/60 transition-colors"
              />
            </div>
          </div>

          {/* Username / Bio Slug */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-white/60 text-xs font-medium uppercase tracking-wider">
                Choose Username
              </label>
              {username && (
                <span className="text-[11px] text-orange-400 font-mono">
                  /u/{username}
                </span>
              )}
            </div>
            <div className="relative">
              <AtSign size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                placeholder="sarah"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass border border-white/10 text-white placeholder-white/30 text-sm font-mono focus:outline-none focus:border-orange-500/60 transition-colors"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-white/60 text-xs font-medium mb-1 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-orange-500/60 transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-white/60 text-xs font-medium mb-1 uppercase tracking-wider">
              Create Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-12 py-2.5 rounded-xl glass border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-orange-500/60 transition-colors"
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

          {/* Feedback messages */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              <AlertCircle size={15} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
              <CheckCircle2 size={15} className="flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center py-3 mt-2 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Setting up your bio site...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Create Bio Site 🚀</span>
              </>
            )}
          </button>
        </form>

        {/* Existing account link */}
        <p className="text-center text-white/50 text-xs mt-5">
          Already have an account?{' '}
          <Link href="/login" className="text-orange-400 hover:text-orange-300 font-semibold underline underline-offset-4">
            Sign In Here →
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 relative py-12">
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.07] pointer-events-none"
        style={{ background: 'radial-gradient(circle, #F97316 0%, transparent 70%)' }}
      />
      <Suspense fallback={<div className="text-white/40 text-sm">Loading signup...</div>}>
        <SignupForm />
      </Suspense>
    </div>
  )
}
