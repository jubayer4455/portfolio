import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, Share2 } from 'lucide-react'
import type { GalleryImage } from '@/types'
import ShareBar from '@/components/gallery/ShareBar'

interface Props {
  params: { slug: string }
}

// Static placeholder data
const placeholderImages: GalleryImage[] = [
  { id: '1', title: 'Golden Hour Peaks', slug: 'golden-hour-peaks', description: 'Mountain peaks bathed in golden hour light.', alt_text: 'Mountains', caption: null, storage_path: '', is_public: true, is_featured: true, public_url: 'https://picsum.photos/seed/g1/1200/800', width: 1200, height: 800, category_id: null, sort_order: 1, seo_title: 'Golden Hour Peaks', seo_description: 'Mountain peaks bathed in golden hour light.', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '2', title: 'Neon Dreamscape', slug: 'neon-dreamscape', description: 'A vibrant digital painting of a futuristic cityscape.', alt_text: 'Neon city', caption: null, storage_path: '', is_public: true, is_featured: false, public_url: 'https://picsum.photos/seed/g2/900/1200', width: 900, height: 1200, category_id: null, sort_order: 2, seo_title: null, seo_description: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '3', title: 'Tokyo Streets', slug: 'tokyo-streets', description: 'Rainy streets of Tokyo reflecting neon signs.', alt_text: 'Tokyo', caption: null, storage_path: '', is_public: true, is_featured: false, public_url: 'https://picsum.photos/seed/g3/1200/750', width: 1200, height: 750, category_id: null, sort_order: 3, seo_title: null, seo_description: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '4', title: '3D Dashboard', slug: '3d-portfolio-dashboard', description: 'An interactive 3D dashboard built with Three.js.', alt_text: '3D dashboard', caption: null, storage_path: '', is_public: true, is_featured: false, public_url: 'https://picsum.photos/seed/g4/1350/900', width: 1350, height: 900, category_id: null, sort_order: 4, seo_title: null, seo_description: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '5', title: 'Forest Mist', slug: 'forest-mist', description: 'Ancient forest wrapped in morning mist.', alt_text: 'Forest', caption: null, storage_path: '', is_public: true, is_featured: false, public_url: 'https://picsum.photos/seed/g5/900/1350', width: 900, height: 1350, category_id: null, sort_order: 5, seo_title: null, seo_description: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '6', title: 'Santorini Sunrise', slug: 'santorini-sunrise', description: 'Breathtaking sunrise over the white domes of Santorini.', alt_text: 'Santorini', caption: null, storage_path: '', is_public: true, is_featured: false, public_url: 'https://picsum.photos/seed/g6/1200/800', width: 1200, height: 800, category_id: null, sort_order: 6, seo_title: null, seo_description: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
]

import { getGalleryItems } from '@/lib/content-store'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getImageBySlug(slug: string): Promise<GalleryImage | null> {
  try {
    const items = await getGalleryItems()
    const found = items.find((i) => i.slug === slug && i.is_public !== false)
    if (found) {
      return {
        id: found.id,
        title: found.title,
        slug: found.slug,
        description: found.description || null,
        alt_text: found.alt_text || null,
        caption: found.caption || null,
        storage_path: '',
        public_url: found.public_url || `https://picsum.photos/seed/${found.slug}/1200/800`,
        width: found.width || 1200,
        height: found.height || 800,
        category_id: null,
        is_public: found.is_public,
        is_featured: found.is_featured,
        seo_title: found.title,
        seo_description: found.description || null,
        sort_order: found.sort_order,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    }
  } catch {
    // fallback
  }

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('gallery_images')
      .select('*')
      .eq('slug', slug)
      .eq('is_public', true)
      .single()
    if (data) return data as GalleryImage
  } catch {
    // fallback
  }

  return placeholderImages.find((i) => i.slug === slug) ?? null
}

async function getRelatedImages(currentId: string): Promise<GalleryImage[]> {
  try {
    const items = await getGalleryItems()
    const related = items.filter((i) => i.id !== currentId && i.is_public !== false).slice(0, 4)
    if (related.length > 0) {
      return related.map((i) => ({
        id: i.id,
        title: i.title,
        slug: i.slug,
        description: i.description || null,
        alt_text: i.alt_text || null,
        caption: i.caption || null,
        storage_path: '',
        public_url: i.public_url || `https://picsum.photos/seed/${i.slug}/400/400`,
        width: i.width || 400,
        height: i.height || 400,
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
      .select('*')
      .eq('is_public', true)
      .neq('id', currentId)
      .limit(4)
      .order('sort_order')
    if (data && data.length > 0) return data as GalleryImage[]
  } catch {
    // fallback
  }

  return placeholderImages.filter((i) => i.id !== currentId).slice(0, 4)
}

export async function generateStaticParams() {
  try {
    const items = await getGalleryItems()
    if (items.length > 0) return items.map((i) => ({ slug: i.slug }))
  } catch {}
  return placeholderImages.map((img) => ({ slug: img.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const image = await getImageBySlug(params.slug)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://alexmorgan.dev'

  if (!image) {
    return { title: 'Image Not Found' }
  }

  const title = image.seo_title || image.title
  const description = image.seo_description || image.description || `Gallery image: ${image.title}`

  return {
    title,
    description,
    alternates: { canonical: `/gallery/${image.slug}` },
    openGraph: {
      title: `${title} | Abdul Al Jubayer Gallery`,
      description,
      type: 'article',
      images: image.public_url
        ? [{ url: image.public_url, width: image.width || 1200, height: image.height || 800, alt: image.alt_text || title }]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image.public_url ? [image.public_url] : [],
    },
  }
}

export default async function GalleryImagePage({ params }: Props) {
  const image = await getImageBySlug(params.slug)

  if (!image) notFound()

  const related = await getRelatedImages(image.id)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const pageUrl = `${baseUrl}/gallery/${image.slug}`

  const imageObjectSchema = {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    name: image.title,
    description: image.description,
    contentUrl: image.public_url,
    url: pageUrl,
    author: { '@type': 'Person', name: 'Abdul Al Jubayer' },
    ...(image.width && image.height ? { width: image.width, height: image.height } : {}),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(imageObjectSchema) }}
      />

      <div className="min-h-screen bg-[#0a0a0a] pt-28 pb-20">
        <div className="container-max px-4 md:px-8">
          {/* Breadcrumb + back */}
          <div className="flex items-center justify-between mb-8">
            <nav className="flex items-center gap-2 text-sm text-white/40">
              <Link href="/" className="hover:text-orange-400 transition-colors">Home</Link>
              <span>/</span>
              <Link href="/gallery" className="hover:text-orange-400 transition-colors">Gallery</Link>
              <span>/</span>
              <span className="text-white/70 truncate max-w-[200px]">{image.title}</span>
            </nav>
            <Link
              href="/gallery"
              className="flex items-center gap-1.5 text-sm text-white/50 hover:text-orange-400 transition-colors"
            >
              <ArrowLeft size={14} />
              Back to Gallery
            </Link>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Image */}
            <div className="lg:col-span-2">
              <div className="relative rounded-2xl overflow-hidden glass gradient-border">
                <Image
                  src={image.public_url || `https://picsum.photos/seed/${image.slug}/1200/800`}
                  alt={image.alt_text || image.title}
                  width={image.width || 1200}
                  height={image.height || 800}
                  className="w-full h-auto"
                  priority
                />
              </div>

              {/* Related images */}
              {related.length > 0 && (
                <div className="mt-12">
                  <h2 className="text-white font-semibold text-lg mb-6">More from the Gallery</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {related.map((rel) => (
                      <Link
                        key={rel.id}
                        href={`/gallery/${rel.slug}`}
                        className="group relative aspect-square rounded-xl overflow-hidden glass gradient-border"
                      >
                        <Image
                          src={rel.public_url || `https://picsum.photos/seed/${rel.slug}/400/400`}
                          alt={rel.alt_text || rel.title}
                          fill
                          sizes="(max-width: 640px) 50vw, 25vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white text-xs text-center px-2">{rel.title}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="glass gradient-border rounded-2xl p-6">
                <h1 className="text-white text-2xl font-bold font-display mb-2">{image.title}</h1>
                {image.description && (
                  <p className="text-white/60 leading-relaxed text-sm mt-4">{image.description}</p>
                )}
                {image.caption && (
                  <p className="text-white/40 text-xs italic mt-3">{image.caption}</p>
                )}
              </div>

              {/* Share */}
              <div className="glass gradient-border rounded-2xl p-6">
                <h3 className="text-white/60 text-xs uppercase tracking-wider font-semibold mb-4 flex items-center gap-2">
                  <Share2 size={13} /> Share
                </h3>
                <ShareBar title={image.title} pageUrl={pageUrl} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
