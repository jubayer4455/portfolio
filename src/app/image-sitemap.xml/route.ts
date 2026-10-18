import { NextResponse } from 'next/server'
import { getGalleryItems, getSiteSettings } from '@/lib/content-store'
import { readAllUserBios } from '@/lib/builder-store'

export const dynamic = 'force-dynamic'
export const revalidate = 3600

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;'
      case '>': return '&gt;'
      case '&': return '&amp;'
      case '\'': return '&apos;'
      case '"': return '&quot;'
      default: return c
    }
  })
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hellojubayer.online'

  let settings: any = null
  let galleryItems: any[] = []
  try {
    settings = await getSiteSettings()
    galleryItems = await getGalleryItems()
  } catch (err) {
    console.warn('Image sitemap content load error:', err)
  }

  const publicGallery = (galleryItems || []).filter((item) => item.is_public !== false)

  let userBios: any[] = []
  try {
    userBios = readAllUserBios().filter((b) => !b.is_suspended)
  } catch (err) {
    console.warn('Image sitemap user bios load error:', err)
  }

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`
  xml += `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`

  // 1. Homepage with avatar & top gallery images
  xml += `  <url>\n`
  xml += `    <loc>${baseUrl}/</loc>\n`
  if (settings?.avatar_url) {
    xml += `    <image:image>\n`
    xml += `      <image:loc>${escapeXml(settings.avatar_url)}</image:loc>\n`
    xml += `      <image:title>${escapeXml(settings.site_name || 'Abdul Al Jubayer')} Profile Avatar</image:title>\n`
    xml += `      <image:caption>${escapeXml(settings.tagline || 'Visual Creator & Lifestyle Storyteller')}</image:caption>\n`
    xml += `    </image:image>\n`
  }
  for (const img of publicGallery.slice(0, 8)) {
    if (img.public_url) {
      xml += `    <image:image>\n`
      xml += `      <image:loc>${escapeXml(img.public_url)}</image:loc>\n`
      xml += `      <image:title>${escapeXml(img.title || 'Visual Capture')}</image:title>\n`
      if (img.caption || img.alt_text) {
        xml += `      <image:caption>${escapeXml(img.caption || img.alt_text)}</image:caption>\n`
      }
      xml += `    </image:image>\n`
    }
  }
  xml += `  </url>\n`

  // 2. Main Gallery Page with all gallery images
  xml += `  <url>\n`
  xml += `    <loc>${baseUrl}/gallery</loc>\n`
  for (const img of publicGallery) {
    if (img.public_url) {
      xml += `    <image:image>\n`
      xml += `      <image:loc>${escapeXml(img.public_url)}</image:loc>\n`
      xml += `      <image:title>${escapeXml(img.title)}</image:title>\n`
      if (img.caption || img.alt_text) {
        xml += `      <image:caption>${escapeXml(img.caption || img.alt_text)}</image:caption>\n`
      }
      xml += `    </image:image>\n`
    }
  }
  xml += `  </url>\n`

  // 3. Individual gallery item pages
  for (const img of publicGallery) {
    if (img.public_url && img.slug) {
      xml += `  <url>\n`
      xml += `    <loc>${baseUrl}/gallery/${img.slug}</loc>\n`
      xml += `    <image:image>\n`
      xml += `      <image:loc>${escapeXml(img.public_url)}</image:loc>\n`
      xml += `      <image:title>${escapeXml(img.title)}</image:title>\n`
      if (img.caption || img.alt_text) {
        xml += `      <image:caption>${escapeXml(img.caption || img.alt_text)}</image:caption>\n`
      }
      xml += `    </image:image>\n`
      xml += `  </url>\n`
    }
  }

  // 4. User Bio profile pages with avatar, cover, and photos
  for (const bio of userBios) {
    xml += `  <url>\n`
    xml += `    <loc>${baseUrl}/u/${bio.username}</loc>\n`
    if (bio.avatar_url) {
      xml += `    <image:image>\n`
      xml += `      <image:loc>${escapeXml(bio.avatar_url)}</image:loc>\n`
      xml += `      <image:title>${escapeXml(bio.display_name || bio.username)} Avatar</image:title>\n`
      xml += `      <image:caption>Official avatar of ${escapeXml(bio.display_name || bio.username)} on 3D Bio</image:caption>\n`
      xml += `    </image:image>\n`
    }
    if (bio.cover_url) {
      xml += `    <image:image>\n`
      xml += `      <image:loc>${escapeXml(bio.cover_url)}</image:loc>\n`
      xml += `      <image:title>${escapeXml(bio.display_name || bio.username)} Cover Banner</image:title>\n`
      xml += `    </image:image>\n`
    }
    if (Array.isArray(bio.photos)) {
      for (const photo of bio.photos) {
        if (photo?.url) {
          xml += `    <image:image>\n`
          xml += `      <image:loc>${escapeXml(photo.url)}</image:loc>\n`
          xml += `      <image:title>${escapeXml(photo.caption || `${bio.display_name || bio.username} Photo`)}</image:title>\n`
          if (photo.alt_text || photo.caption) {
            xml += `      <image:caption>${escapeXml(photo.alt_text || photo.caption)}</image:caption>\n`
          }
          xml += `    </image:image>\n`
        }
      }
    }
    xml += `  </url>\n`
  }

  xml += `</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
