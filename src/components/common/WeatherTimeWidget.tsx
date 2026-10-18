'use client'

import { useState, useEffect } from 'react'
import { Sun, Moon, Cloud, CloudRain, Zap, Clock, MapPin } from 'lucide-react'

interface Props {
  enabled?: boolean
  locationName?: string
  timezone?: string
  className?: string
}

interface WeatherData {
  temp: number
  condition: string
  icon: 'sun' | 'moon' | 'cloud' | 'rain' | 'storm'
}

export default function WeatherTimeWidget({
  enabled = true,
  locationName = 'Dhaka, BD',
  timezone = 'Asia/Dhaka',
  className = '',
}: Props) {
  const [timeStr, setTimeStr] = useState('')
  const [isNight, setIsNight] = useState(false)
  const [weather, setWeather] = useState<WeatherData | null>(null)

  // 1. Live ticking clock
  useEffect(() => {
    if (!enabled) return

    const updateClock = () => {
      try {
        const now = new Date()
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: timezone,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
        setTimeStr(formatter.format(now))

        // Check hour for day/night
        const hourFormatter = new Intl.DateTimeFormat('en-US', {
          timeZone: timezone,
          hour: 'numeric',
          hour12: false,
        })
        const hour = parseInt(hourFormatter.format(now), 10)
        setIsNight(hour < 6 || hour >= 18)
      } catch {
        setTimeStr(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
      }
    }

    updateClock()
    const timer = setInterval(updateClock, 1000)
    return () => clearInterval(timer)
  }, [enabled, timezone])

  // 2. Weather fetching from Open-Meteo
  useEffect(() => {
    if (!enabled) return

    const cacheKey = `aj_weather_${locationName}`
    const cached = typeof window !== 'undefined' ? sessionStorage.getItem(cacheKey) : null
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        if (Date.now() - parsed.timestamp < 15 * 60 * 1000) {
          setWeather(parsed.data)
          return
        }
      } catch {}
    }

    // Default Dhaka coords: 23.8103, 90.4125
    fetch('https://api.open-meteo.com/v1/forecast?latitude=23.8103&longitude=90.4125&current=temperature_2m,weather_code')
      .then((res) => res.json())
      .then((json) => {
        if (json?.current?.temperature_2m !== undefined) {
          const temp = Math.round(json.current.temperature_2m)
          const code = json.current.weather_code || 0

          let condition = 'Clear Sky'
          let icon: WeatherData['icon'] = isNight ? 'moon' : 'sun'

          if (code === 0) {
            condition = isNight ? 'Clear Night' : 'Sunny'
            icon = isNight ? 'moon' : 'sun'
          } else if (code >= 1 && code <= 3) {
            condition = 'Partly Cloudy'
            icon = 'cloud'
          } else if (code >= 51 && code <= 67) {
            condition = 'Light Rain'
            icon = 'rain'
          } else if (code >= 80 && code <= 82) {
            condition = 'Showers'
            icon = 'rain'
          } else if (code >= 95) {
            condition = 'Thunderstorm'
            icon = 'storm'
          }

          const weatherObj: WeatherData = { temp, condition, icon }
          setWeather(weatherObj)
          sessionStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: weatherObj }))
        }
      })
      .catch(() => {
        // Fallback
        setWeather({
          temp: 27,
          condition: isNight ? 'Clear Night' : 'Pleasant',
          icon: isNight ? 'moon' : 'sun',
        })
      })
  }, [enabled, locationName, isNight])

  if (!enabled || !timeStr) return null

  const renderWeatherIcon = () => {
    if (!weather) return isNight ? <Moon size={12} className="text-blue-300" /> : <Sun size={12} className="text-amber-400" />
    switch (weather.icon) {
      case 'moon':
        return <Moon size={12} className="text-blue-300" />
      case 'cloud':
        return <Cloud size={12} className="text-gray-300" />
      case 'rain':
        return <CloudRain size={12} className="text-cyan-400" />
      case 'storm':
        return <Zap size={12} className="text-yellow-400" />
      default:
        return <Sun size={12} className="text-amber-400" />
    }
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-white/10 text-[11px] text-white/80 font-mono shadow-md backdrop-blur-md ${className}`}
      title={`Current local time & weather in ${locationName}`}
    >
      <span className="flex h-2 w-2 relative flex-shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
      </span>

      <span className="text-white/60 hidden sm:inline flex items-center gap-1 font-sans">
        <MapPin size={11} className="text-orange-400" />
        {locationName}
      </span>

      <span className="text-white/30 hidden sm:inline">•</span>

      <span className="text-white font-medium flex items-center gap-1">
        <Clock size={11} className="text-orange-400" />
        {timeStr}
      </span>

      {weather && (
        <>
          <span className="text-white/30">•</span>
          <span className="flex items-center gap-1 text-white/90">
            {renderWeatherIcon()}
            <span>{weather.temp}°C</span>
            <span className="text-white/40 hidden md:inline font-sans text-[10px]">({weather.condition})</span>
          </span>
        </>
      )}
    </div>
  )
}
