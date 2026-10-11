'use client'

import { useEffect } from 'react'

export default function VisitTracker() {
  useEffect(() => {
    // Only ping once per browser tab session
    const tracked = sessionStorage.getItem('visit_tracked')
    if (!tracked) {
      sessionStorage.setItem('visit_tracked', 'true')
      try {
        fetch('/api/analytics/visit', { method: 'POST' }).catch(() => {})
      } catch {}
    }
  }, [])

  return null
}
