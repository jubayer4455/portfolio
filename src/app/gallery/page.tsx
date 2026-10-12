import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { getSiteSettings } from '@/lib/content-store'
import MaintenanceScreen from '@/components/common/MaintenanceScreen'
import type { GalleryImage } from '@/types'

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'Browse the complete gallery of photography, portraits, travel captures, and moments by Abdul Al Jubayer.',
  alternates: { canonical: '/gallery' },
  openGraph: {
    title: 'Gallery | Abdul Al Jubayer',
    description: 'Browse the visual diary and captured moments by Abdul Al Jubayer.',
    type: 'website',
  },
}

const imageObjectSchema = (images: GalleryImage[], baseUrl: string) => ({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Gallery — Abdul Al Jubayer',
  description: 'Personal visual diary including portraits, travel, and lifestyle moments.',
  url: `${baseUrl}/gallery`,
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: images.map((img, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'ImageObject',
        name: img.title,
        description: img.description,
        contentUrl: img.public_url,
        url: `${baseUrl}/gallery/${img.slug}`,
      },
    })),
  },
})

const breadcrumbSchema = (baseUrl: string) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
    { '@type': 'ListItem', position: 2, name: 'Gallery', item: `${baseUrl}/gallery` },
  ],
})

// Placeholder images when Supabase is not configured
const placeholderImages: GalleryImage[] = [
  {
    id: '1', title: 'Golden Hour Peaks', slug: 'golden-hour-peaks',
    description: 'Mountain peaks bathed in golden hour light.', alt_text: 'Golden hour mountains',
    caption: null, storage_path: '', is_public: true, is_featured: true,
    public_url: 'https://picsum.photos/seed/g1/800/600',
    width: 800, height: 600, category_id: null, sort_order: 1,
    seo_title: null, seo_description: null,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: '2', title: 'Neon Dreamscape', slug: 'neon-dreamscape',
    description: 'A vibrant digital painting of a futuristic cityscape.', alt_text: 'Neon city',
    caption: null, storage_path: '', is_public: true, is_featured: false,
    public_url: 'https://picsum.photos/seed/g2/600/800',
    width: 600, height: 800, category_id: null, sort_order: 2,
    seo_title: null, seo_description: null,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: '3', title: 'Tokyo Streets', slug: 'tokyo-streets',
    description: 'Rainy streets of Tokyo reflecting neon signs.', alt_text: 'Tokyo rainy street',
    caption: null, storage_path: '', is_public: true, is_featured: false,
    public_url: 'https://picsum.photos/seed/g3/800/500',
    width: 800, height: 500, category_id: null, sort_order: 3,
    seo_title: null, seo_description: null,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: '4', title: '3D Dashboard', slug: '3d-portfolio-dashboard',
    description: 'An interactive 3D dashboard built with Three.js.', alt_text: '3D dashboard',
    caption: null, storage_path: '', is_public: true, is_featured: false,
    public_url: 'https://picsum.photos/seed/g4/900/600',
    width: 900, height: 600, category_id: null, sort_order: 4,
    seo_title: null, seo_description: null,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: '5', title: 'Forest Mist', slug: 'forest-mist',
    description: 'Ancient forest wrapped in morning mist.', alt_text: 'Misty forest',
    caption: null, storage_path: '', is_public: true, is_featured: false,
    public_url: 'https://picsum.photos/seed/g5/600/900',
    width: 600, height: 900, category_id: null, sort_order: 5,
    seo_title: null, seo_description: null,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: '6', title: 'Santorini Sunrise', slug: 'santorini-sunrise',
    description: 'Breathtaking sunrise over the white domes of Santorini.', alt_text: 'Santorini sunrise',
    caption: null, storage_path: '', is_public: true, is_featured: false,
    public_url: 'https://picsum.photos/seed/g6/800/600',
    width: 800, height: 600, category_id: null, sort_order: 6,
    seo_title: null, seo_description: null,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
]

import { getGalleryItems } from '@/lib/content-store'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getGalleryImages(): Promise<GalleryImage[]> {
  try {
    const items = await getGalleryItems()
    if (items && items.length > 0) {
      return items
        .filter((i) => i.is_public !== false)
        .map((i) => ({
          id: i.id,
          title: i.title,
          slug: i.slug,
          description: i.description || null,
          alt_text: i.alt_text || null,
          caption: i.caption || null,
          storage_path: '',
          public_url: i.public_url || `https://picsum.photos/seed/${i.slug}/800/600`,
          width: i.width || 800,
          height: i.height || 600,
          category_id: null,
          is_public: i.is_public,
          is_featured: i.is_featured,
          seo_title: null,
          seo_description: null,
          sort_order: i.sort_order,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }))
    }
  } catch {
    // fallback
  }

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('gallery_images')
      .select('*, gallery_categories(name, slug)')
      .eq('is_public', true)
      .order('sort_order', { ascending: true })

    if (data && data.length > 0) return data as GalleryImage[]
  } catch {
    // fallback
  }

  return placeholderImages
}

export default async function GalleryPage() {
  const [settings, images] = await Promise.all([getSiteSettings(), getGalleryImages()])
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jubayer.me'

  const cookieStore = cookies()
  const isDemoAdmin = cookieStore.get('demo_admin')?.value === 'true'
  const sessionUser = cookieStore.get('user_session_username')?.value
  const sessionEmail = cookieStore.get('user_session_email')?.value
  const isAdmin =
    isDemoAdmin ||
    sessionUser === 'admin' ||
    sessionUser === 'jubayer' ||
    sessionEmail === 'admin@portfolio.com' ||
    sessionEmail === 'jubayerahmmed2k@gmail.com'

  if (settings.maintenance_mode_enabled && !isAdmin) {
    return <MaintenanceScreen settings={settings} />
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(imageObjectSchema(images, baseUrl)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(baseUrl)) }}
      />

      <div className="min-h-screen bg-[#0a0a0a] pt-28 pb-20">
        <div className="container-max px-4 md:px-8">
          {/* Header */}
          <div className="mb-12">
            <nav className="flex items-center gap-2 text-sm text-white/40 mb-6">
              <Link href="/" className="hover:text-orange-400 transition-colors">Home</Link>
              <span>/</span>
              <span className="text-white/70">Gallery</span>
            </nav>
            <h1 className="heading-lg text-white mb-4">
              Full <span className="text-gradient">Gallery</span>
            </h1>
            <p className="text-white/50 max-w-xl">
              A curated collection of {images.length} works spanning photography, digital art, travel, and project showcases.
            </p>
          </div>

          {/* Masonry grid */}
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            {images.map((image) => (
              <div key={image.id} className="break-inside-avoid mb-4">
                <Link
                  href={`/gallery/${image.slug}`}
                  className="group relative block rounded-2xl overflow-hidden glass gradient-border"
                >
                  <div
                    className="relative w-full overflow-hidden"
                    style={{ paddingBottom: `${((image.height || 600) / (image.width || 800)) * 100}%` }}
                  >
                    <Image
                      src={image.public_url || `https://picsum.photos/seed/${image.slug}/800/600`}
                      alt={image.alt_text || image.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <h2 className="text-white font-semibold text-sm">{image.title}</h2>
                    {image.description && (
                      <p className="text-white/60 text-xs mt-1 line-clamp-2">{image.description}</p>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {images.length === 0 && (
            <div className="text-center py-32 text-white/30">
              No gallery images available yet.
            </div>
          )}
        </div>
      </div>
    </>
  )
}
