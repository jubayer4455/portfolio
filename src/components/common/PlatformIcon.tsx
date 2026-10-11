'use client'

import React from 'react'

export interface PlatformIconProps extends React.SVGProps<SVGSVGElement> {
  name?: string
  platform?: string
  size?: number | string
  className?: string
}

export default function PlatformIcon({
  name,
  platform,
  size = 20,
  className = '',
  style,
  ...props
}: PlatformIconProps) {
  const normalized = (platform || name || '').toLowerCase().trim()
  const dim = typeof size === 'number' ? `${size}px` : size

  // 1. INSTAGRAM (Official Camera Gradient Glyph)
  if (normalized.includes('insta')) {
    return (
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 24 24"
        fill="none"
        className={className}
        style={style}
        {...props}
      >
        <defs>
          <linearGradient id="igGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f09433" />
            <stop offset="25%" stopColor="#e6683c" />
            <stop offset="50%" stopColor="#dc2743" />
            <stop offset="75%" stopColor="#cc2366" />
            <stop offset="100%" stopColor="#bc1888" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="20" height="20" rx="5.5" fill="url(#igGrad)" />
        <rect x="6" y="6" width="12" height="12" rx="3.5" fill="none" stroke="#ffffff" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="3" fill="none" stroke="#ffffff" strokeWidth="1.8" />
        <circle cx="15.8" cy="8.2" r="0.9" fill="#ffffff" />
      </svg>
    )
  }

  // 2. FACEBOOK (Official Blue Badge & 'f')
  if (normalized.includes('face') || normalized === 'fb') {
    return (
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 24 24"
        className={className}
        style={style}
        {...props}
      >
        <circle cx="12" cy="12" r="11" fill="#1877F2" />
        <path
          d="M13.8 22.8V13.8H16.8L17.2 10.3H13.8V8.1C13.8 7.1 14.1 6.4 15.6 6.4L17.4 6.4V3.3C17.1 3.2 16.0 3.1 14.7 3.1C12.0 3.1 10.1 4.8 10.1 7.8V10.3H7.1V13.8H10.1V22.8C10.7 22.9 11.3 23 12 23C12.6 23 13.2 22.9 13.8 22.8Z"
          fill="#ffffff"
        />
      </svg>
    )
  }

  // 3. YOUTUBE (Official Red Screen & Play Triangle)
  if (normalized.includes('you') || normalized.includes('yt')) {
    return (
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 24 24"
        className={className}
        style={style}
        {...props}
      >
        <path
          d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"
          fill="#FF0000"
        />
        <path d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#ffffff" />
      </svg>
    )
  }

  // 4. TIKTOK (Official Musical Note with Neon Cyan & Magenta Chromatic Aberration)
  if (normalized.includes('tik') || normalized.includes('tok')) {
    return (
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 24 24"
        className={className}
        style={style}
        {...props}
      >
        <rect width="24" height="24" rx="6" fill="#010101" />
        <path
          d="M17.6 8.1c-1.1-.1-2.2-.6-3-1.4-.4-.4-.7-.9-.9-1.5H11v11.2c0 1.6-1.3 2.9-2.9 2.9s-2.9-1.3-2.9-2.9 1.3-2.9 2.9-2.9c.3 0 .6 0 .9.1v-2.8c-.3 0-.6-.1-.9-.1-3.2 0-5.7 2.6-5.7 5.7s2.6 5.7 5.7 5.7 5.7-2.6 5.7-5.7V9.7c1.3.9 2.9 1.4 4.6 1.4V8.1z"
          fill="#25F4EE"
          transform="translate(-0.6, -0.6)"
        />
        <path
          d="M17.6 8.1c-1.1-.1-2.2-.6-3-1.4-.4-.4-.7-.9-.9-1.5H11v11.2c0 1.6-1.3 2.9-2.9 2.9s-2.9-1.3-2.9-2.9 1.3-2.9 2.9-2.9c.3 0 .6 0 .9.1v-2.8c-.3 0-.6-.1-.9-.1-3.2 0-5.7 2.6-5.7 5.7s2.6 5.7 5.7 5.7 5.7-2.6 5.7-5.7V9.7c1.3.9 2.9 1.4 4.6 1.4V8.1z"
          fill="#FE2C55"
          transform="translate(0.6, 0.6)"
        />
        <path
          d="M17.6 8.1c-1.1-.1-2.2-.6-3-1.4-.4-.4-.7-.9-.9-1.5H11v11.2c0 1.6-1.3 2.9-2.9 2.9s-2.9-1.3-2.9-2.9 1.3-2.9 2.9-2.9c.3 0 .6 0 .9.1v-2.8c-.3 0-.6-.1-.9-.1-3.2 0-5.7 2.6-5.7 5.7s2.6 5.7 5.7 5.7 5.7-2.6 5.7-5.7V9.7c1.3.9 2.9 1.4 4.6 1.4V8.1z"
          fill="#ffffff"
        />
      </svg>
    )
  }

  // 5. WHATSAPP (Official Green Speech Bubble & Phone Receiver)
  if (normalized.includes('whats') || normalized.includes('wa')) {
    return (
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 24 24"
        className={className}
        style={style}
        {...props}
      >
        <circle cx="12" cy="12" r="11" fill="#25D366" />
        <path
          d="M17.5 14.3c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.1-.7.2s-.8 1-.9 1.2c-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.5-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5s-.7-1.7-1-2.3c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4s-1.1 1.1-1.1 2.6c0 1.5 1.1 3 1.3 3.2.1.2 2.2 3.4 5.3 4.7 1.8.8 2.5.8 3.4.7.5-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.2-.3-.3-.6-.4z"
          fill="#ffffff"
        />
      </svg>
    )
  }

  // 6. TELEGRAM (Official Sky Blue Disc & Paper Airplane)
  if (normalized.includes('tele') || normalized.includes('t.me')) {
    return (
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 24 24"
        className={className}
        style={style}
        {...props}
      >
        <circle cx="12" cy="12" r="11" fill="#229ED9" />
        <path
          d="M5.3 11.8l11.7-4.6c.6-.2 1.1.1.9.9l-2 9.4c-.2.8-.7 1-1.3.6l-3.3-2.4-1.6 1.5c-.2.2-.4.4-.8.4l.2-3.4 6.2-5.6c.3-.3-.1-.4-.4-.2L7.3 13.7 4 12.7c-.7-.2-.7-.7.2-1z"
          fill="#ffffff"
        />
      </svg>
    )
  }

  // 7. X / TWITTER (Official New X Logo)
  if (normalized === 'x' || normalized.includes('twit') || normalized.includes('twitter')) {
    return (
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 24 24"
        className={className}
        style={style}
        {...props}
      >
        <rect width="24" height="24" rx="5" fill="#000000" />
        <path
          d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
          fill="#ffffff"
        />
      </svg>
    )
  }

  // 8. LINKEDIN (Official Blue Tile with 'in')
  if (normalized.includes('linkedin') || normalized.includes('linked')) {
    return (
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 24 24"
        className={className}
        style={style}
        {...props}
      >
        <rect width="24" height="24" rx="5" fill="#0A66C2" />
        <path
          d="M7.1 9.2H4.4v8.6h2.7V9.2zM5.7 5c-.9 0-1.5.6-1.5 1.4s.6 1.4 1.5 1.4 1.5-.6 1.5-1.4c0-.8-.6-1.4-1.5-1.4zm14 7.7c0-2.6-1.4-3.8-3.3-3.8-1.5 0-2.2.8-2.6 1.4V9.2h-2.7c.04.8 0 8.6 0 8.6h2.7v-4.8c0-.3.02-.5.1-.7.2-.5.7-1.1 1.6-1.1 1.1 0 1.6.8 1.6 2.1v4.5h2.7v-4.8z"
          fill="#ffffff"
        />
      </svg>
    )
  }

  // 9. GITHUB (Official Invertocat)
  if (normalized.includes('git')) {
    return (
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 24 24"
        className={className}
        style={style}
        {...props}
      >
        <circle cx="12" cy="12" r="11" fill="#181717" />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
          fill="#ffffff"
        />
      </svg>
    )
  }

  // 10. DISCORD (Official Clyde Controller in Blurple)
  if (normalized.includes('discord')) {
    return (
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 24 24"
        className={className}
        style={style}
        {...props}
      >
        <rect width="24" height="24" rx="5" fill="#5865F2" />
        <path
          d="M17.4 6.8c-1.1-.5-2.2-.8-3.4-1-.1.3-.3.7-.4 1-1.3-.2-2.6-.2-3.8 0-.1-.3-.3-.7-.5-1-1.2.2-2.3.5-3.4 1-2.2 3.3-2.8 6.5-2.5 9.7 1.4 1.1 2.8 1.7 4.2 1.7.3-.4.7-.9 1-1.3-.8-.3-1.6-.7-2.3-1.2.2.1.4.3.6.4 1.2.6 2.6 1 4.1 1s2.9-.4 4.1-1c.2-.1.4-.3.6-.4-.7.5-1.5.9-2.3 1.2.3.5.7.9 1 1.3 1.4 0 2.8-.7 4.2-1.7.4-3.6-.4-6.8-2.6-9.7zM9.5 13.9c-.8 0-1.4-.7-1.4-1.6s.6-1.6 1.4-1.6c.8 0 1.4.7 1.4 1.6s-.6 1.6-1.4 1.6zm5 0c-.8 0-1.4-.7-1.4-1.6s.6-1.6 1.4-1.6c.8 0 1.4.7 1.4 1.6s-.6 1.6-1.4 1.6z"
          fill="#ffffff"
        />
      </svg>
    )
  }

  // 11. SPOTIFY (Official Green Disc & Sound Waves)
  if (normalized.includes('spotify') || normalized.includes('song')) {
    return (
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 24 24"
        className={className}
        style={style}
        {...props}
      >
        <circle cx="12" cy="12" r="11" fill="#1ED760" />
        <path
          d="M16.8 16.3c-.2.3-.6.4-.9.2-2.5-1.5-5.6-1.8-9.3-1-.4.1-.7-.1-.8-.4-.1-.3.1-.7.4-.8 4.1-.9 7.6-.6 10.4 1.1.3.2.4.6.2.9zm1.3-2.9c-.3.4-.8.5-1.2.3-3-1.8-7.5-2.3-11-1.3-.4.1-.9-.1-1-.6-.1-.4.1-.9.6-1 4.1-1.2 9.1-.6 12.5 1.5.4.2.5.7.1 1.1zm.1-3C14.6 8.3 8.6 8.1 5.2 9.1c-.5.2-1.1-.1-1.3-.6-.2-.5.1-1.1.6-1.3 4-1.2 10.6-1 14.7 1.4.5.3.7.9.4 1.4-.3.4-.9.6-1.4.4z"
          fill="#000000"
        />
      </svg>
    )
  }

  // 12. SNAPCHAT (Official Yellow Badge & Ghost)
  if (normalized.includes('snap')) {
    return (
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 24 24"
        className={className}
        style={style}
        {...props}
      >
        <rect width="24" height="24" rx="5" fill="#FFFC00" />
        <path
          d="M12 4.5c-2.8 0-4.4 1.9-4.4 4.3 0 .8.2 1.6.4 2.2-.5.2-1.2.6-1.4 1.1-.2.4.1.8.6.9.5.1 1.1 0 1.5-.1.2.8.7 1.5 1.5 1.9-.9.4-2.1.8-2.6 1.5-.3.4 0 .9.5.9.8 0 1.9-.5 2.7-.9.4.6 1.1 1 2 1s1.6-.4 2-.1c.8.4 1.9.9 2.7.9.5 0 .8-.5.5-.9-.5-.7-1.7-1.1-2.6-1.5.8-.4 1.3-1.1 1.5-1.9.4.1 1 .2 1.5.1.5-.1.8-.5.6-.9-.2-.5-.9-.9-1.4-1.1.2-.6.4-1.4.4-2.2 0-2.4-1.6-4.3-4.4-4.3z"
          fill="#000000"
        />
        <path
          d="M12 5.5c-2.2 0-3.4 1.5-3.4 3.3 0 .7.2 1.3.4 1.8-.4.2-.9.5-1 .8-.1.2 0 .4.3.5.4.1.8 0 1.2-.1.2.7.6 1.2 1.3 1.5-.7.3-1.6.6-2 1.1-.1.2 0 .5.3.5.6 0 1.5-.4 2.1-.7.4.5 1 .8 1.7.8s1.3-.3 1.7-.8c.6.3 1.5.7 2.1.7.3 0 .4-.3.3-.5-.4-.5-1.3-.8-2-1.1.7-.3 1.1-.8 1.3-1.5.4.1.8.2 1.2.1.3-.1.4-.3.3-.5-.1-.3-.6-.6-1-.8.2-.5.4-1.1.4-1.8 0-1.8-1.2-3.3-3.4-3.3z"
          fill="#ffffff"
        />
      </svg>
    )
  }

  // 13. PINTEREST (Official Red Disc with 'P')
  if (normalized.includes('pin')) {
    return (
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 24 24"
        className={className}
        style={style}
        {...props}
      >
        <circle cx="12" cy="12" r="11" fill="#BD081C" />
        <path
          d="M12 4.5C7.9 4.5 4.5 7.8 4.5 12c0 3.2 2 6 4.9 7.1-.1-.6-.1-1.5 0-2.1l1.3-5.3s-.3-.6-.3-1.6c0-1.5.9-2.6 2-2.6.9 0 1.4.7 1.4 1.5 0 .9-.6 2.3-.9 3.6-.3 1.1.6 2 1.7 2 2 0 3.6-2.1 3.6-5.2 0-2.7-2-4.6-4.7-4.6-3.2 0-5.1 2.4-5.1 4.9 0 1 .4 2 1 2.6.1.1.1.2.1.3l-.3 1.4c0 .2-.2.3-.4.2-1.3-.6-2.1-2.5-2.1-4.1 0-3.3 2.4-6.3 7-6.3 3.7 0 6.5 2.6 6.5 6.1 0 3.6-2.3 6.6-5.5 6.6-1.1 0-2.1-.6-2.4-1.2l-.7 2.5c-.2 1-.9 2.2-1.3 2.9 1 .3 2.1.5 3.2.5 4.1 0 7.5-3.4 7.5-7.5s-3.4-7.5-7.5-7.5z"
          fill="#ffffff"
        />
      </svg>
    )
  }

  // 14. EMAIL / MAIL (Sleek Envelope)
  if (normalized.includes('mail') || normalized.includes('email') || normalized.includes('inbox')) {
    return (
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={style}
        {...props}
      >
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    )
  }

  // 15. PHONE / CALL / WHATSAPP NUMBER
  if (normalized.includes('phone') || normalized.includes('call') || normalized.includes('tel')) {
    return (
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={style}
        {...props}
      >
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    )
  }

  // 16. WEBSITE / PORTFOLIO / STORE / GENERIC LINK (Modern Globe)
  return (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" x2="22" y1="12" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}
