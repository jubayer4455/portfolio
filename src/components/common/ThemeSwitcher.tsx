'use client'

import { useState, useEffect } from 'react'
import { Palette, Check } from 'lucide-react'
import { sounds } from '@/lib/sound-effects'

interface Props {
  enabled?: boolean
  className?: string
  onChangeTheme?: (theme: string) => void
}

export const THEME_OPTIONS = [
  { id: 'orange', name: 'Electric Orange', color: '#F97316', glow: 'rgba(249,115,22,0.3)' },
  { id: 'purple', name: 'Cyber Purple', color: '#A855F7', glow: 'rgba(168,85,247,0.3)' },
  { id: 'cyan', name: 'Neon Cyan', color: '#06B6D4', glow: 'rgba(6,182,212,0.3)' },
  { id: 'emerald', name: 'Emerald Glow', color: '#10B981', glow: 'rgba(16,185,129,0.3)' },
  { id: 'rose', name: 'Rose Gold', color: '#F43F5E', glow: 'rgba(244,63,94,0.3)' },
]

export default function ThemeSwitcher({ enabled = true, className = '', onChangeTheme }: Props) {
  const [activeTheme, setActiveTheme] = useState('orange')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem('aj_user_theme')
    if (stored && THEME_OPTIONS.some((t) => t.id === stored)) {
      setActiveTheme(stored)
      applyTheme(stored)
    }
  }, [])

  const applyTheme = (themeId: string) => {
    const selected = THEME_OPTIONS.find((t) => t.id === themeId) || THEME_OPTIONS[0]
    document.documentElement.setAttribute('data-theme', themeId)
    document.documentElement.style.setProperty('--color-primary', selected.color)
    document.documentElement.style.setProperty('--color-primary-glow', selected.glow)
    if (onChangeTheme) onChangeTheme(themeId)
  }

  const handleSelectTheme = (themeId: string) => {
    sounds.playPop()
    setActiveTheme(themeId)
    applyTheme(themeId)
    if (typeof window !== 'undefined') {
      localStorage.setItem('aj_user_theme', themeId)
    }
    setIsOpen(false)
  }

  if (!enabled) return null

  const currentTheme = THEME_OPTIONS.find((t) => t.id === activeTheme) || THEME_OPTIONS[0]

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => {
          sounds.playClick()
          setIsOpen(!isOpen)
        }}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass border border-white/10 hover:border-orange-500/40 text-xs text-white/80 hover:text-white transition-all shadow-md active:scale-95"
        title="Switch color mood"
        aria-label="Quick theme switcher"
      >
        <span
          className="w-3 h-3 rounded-full transition-transform duration-300"
          style={{ backgroundColor: currentTheme.color, boxShadow: `0 0 8px ${currentTheme.color}` }}
        />
        <Palette size={13} className="text-white/60" />
        <span className="hidden sm:inline text-[11px] font-mono">{currentTheme.name}</span>
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 bottom-full mb-2 sm:bottom-auto sm:top-full sm:mt-2 w-48 glass gradient-border rounded-2xl p-2 shadow-2xl z-50 bg-[#0d0d0f]/95 backdrop-blur-xl border border-white/15 animate-fadeInUp">
          <p className="text-[10px] uppercase tracking-wider text-white/40 px-2.5 py-1 font-semibold">
            Color Mood
          </p>
          <div className="space-y-1 mt-1">
            {THEME_OPTIONS.map((theme) => {
              const isSelected = activeTheme === theme.id
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => handleSelectTheme(theme.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-all ${
                    isSelected ? 'bg-white/10 text-white font-medium' : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: theme.color,
                        boxShadow: isSelected ? `0 0 10px ${theme.color}` : 'none',
                      }}
                    />
                    <span>{theme.name}</span>
                  </div>
                  {isSelected && <Check size={13} style={{ color: theme.color }} />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
