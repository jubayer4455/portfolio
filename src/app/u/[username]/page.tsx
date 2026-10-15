import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getUserBioByUsername } from '@/lib/builder-store'
import { generateUserBioSchema } from '@/lib/seo-engine'
import UserBioClientView from './UserBioClientView'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface Props {
  params: {
    username: string
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cleanUser = decodeURIComponent(params.username || '').replace(/^@+/, '').trim()
  const bio = await getUserBioByUsername(cleanUser)

  if (!bio) {
    return {
      title: 'User Not Found — Bio Builder',
      description: 'The requested personal bio page does not exist.',
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jubayer.me'
  const title = `${bio.display_name} (@${bio.username}) — Official 3D Link in Bio`
  const description = bio.tagline || bio.bio || `Connect with ${bio.display_name} (@${bio.username}) across all social platforms, view photos, and chat.`
  const profileImages = [bio.avatar_url, bio.cover_url].filter(Boolean) as string[]

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/u/${bio.username}`,
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/u/${bio.username}`,
      type: 'profile',
      images: profileImages.map((img) => ({ url: img, alt: `${bio.display_name} Profile` })),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: profileImages,
    },
  }
}

export default async function UserBioPage({ params }: Props) {
  const cleanUser = decodeURIComponent(params.username || '').replace(/^@+/, '').trim()
  const bio = await getUserBioByUsername(cleanUser)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jubayer.me'

  if (!bio) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 text-center">
        <div className="glass gradient-border rounded-3xl p-8 max-w-md w-full">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center font-display font-bold text-orange-400 text-2xl mx-auto mb-4">
            ?
          </div>
          <h1 className="text-xl font-bold font-display text-white mb-2">
            @{cleanUser} is available!
          </h1>
          <p className="text-white/50 text-xs mb-6">
            No bio profile exists for this username yet. You can claim it right now and build your own 3D Link-in-Bio profile.
          </p>
          <div className="space-y-3">
            <Link href="/signup" className="btn-primary w-full justify-center text-xs py-2.5">
              Claim @{params.username} &amp; Build Bio 🚀
            </Link>
            <Link href="/" className="block text-white/40 hover:text-white text-xs">
              ← Back to Homepage
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const bioSchema = generateUserBioSchema(bio, baseUrl)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bioSchema) }}
      />
      <UserBioClientView bio={bio} />
    </>
  )
}
