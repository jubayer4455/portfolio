import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AJ Bio — 3D Link in Bio & Creator Hub',
    short_name: 'AJ Bio',
    description: 'Create your official 3D holographic personal bio profile, photo showcase, and social hub.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#f97316',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'My Dashboard',
        short_name: 'Dashboard',
        description: 'Edit your bio, links, and photos',
        url: '/dashboard',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Explore Creators',
        short_name: 'Explore',
        description: 'See trending creators',
        url: '/',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
    ],
  }
}
