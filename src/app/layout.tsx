import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Suspense } from 'react'
import './globals.css'
import { getSiteSettings, getGalleryItems } from '@/lib/content-store'
import { generateMainSiteSchema, getCanonicalSiteUrl } from '@/lib/seo-engine'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['400', '700', '900'],
})

const siteUrl = getCanonicalSiteUrl()

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const fullName = `${settings.first_name} ${settings.last_name}`.trim()
  const title = settings.seo_title || `${fullName} — ${settings.tagline}`
  const description = settings.seo_description || settings.bio_intro

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: `%s | ${fullName}`,
    },
    description,
    keywords: [
      fullName,
      settings.tagline,
      'Link in Bio',
      'Personal Bio',
      'Visual Creator',
      'Photography',
      'Social Hub',
    ],
    authors: [{ name: fullName, url: siteUrl }],
    creator: fullName,
    publisher: fullName,
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: 'AJ Bio',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: siteUrl,
      siteName: settings.site_name || `${fullName} Portfolio`,
      title,
      description,
      images: [
        {
          url: `${siteUrl}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: `${fullName} Portfolio`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${siteUrl}/og-image.jpg`],
    },
    alternates: {
      canonical: siteUrl,
    },
    icons: {
      icon: [
        { url: '/favicon.svg', type: 'image/svg+xml' },
        { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      ],
      shortcut: '/favicon.svg',
      apple: '/apple-touch-icon.png',
    },
    manifest: '/manifest.webmanifest',
    verification: {
      google: settings.google_site_verification || undefined,
    },
  }
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

import BroadcastBanner from '@/components/common/BroadcastBanner'
import PwaInstallPrompt from '@/components/common/PwaInstallPrompt'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [settings, galleryItems] = await Promise.all([
    getSiteSettings(),
    getGalleryItems().catch(() => []),
  ])

  const schemas = generateMainSiteSchema(settings, galleryItems, siteUrl)

  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
        />
        {settings.google_analytics_id && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${settings.google_analytics_id}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${settings.google_analytics_id}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}
      </head>
      <body className="bg-[#0a0a0a] text-[#fafafa] font-sans antialiased">
        <ThemeProvider>
          <BroadcastBanner />
          <PwaInstallPrompt />
          <Suspense fallback={null}>
            {children}
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  )
}
