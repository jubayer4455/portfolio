import fs from 'fs'
import path from 'path'
import os from 'os'
import { revalidatePath } from 'next/cache'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export interface SiteSettingsData {
  site_name: string
  first_name: string
  last_name: string
  tagline: string
  bio_intro: string
  avatar_url?: string
  verified?: boolean
  location: string
  contact_email: string
  spotlight_title?: string
  spotlight_url?: string
  spotlight_enabled?: boolean
  quote_or_motto?: string
  whatsapp_number?: string
  status_badge?: string
  music_enabled?: boolean
  music_title?: string
  music_url?: string
  total_views?: number
  bio_full_p1?: string
  bio_full_p2?: string
  seo_title: string
  seo_description: string

  // Master Section Visibility Toggles
  gallery_enabled?: boolean
  projects_enabled?: boolean
  socials_enabled?: boolean
  about_enabled?: boolean
  reviews_enabled?: boolean
  creators_enabled?: boolean
  anonymous_box_enabled?: boolean
  faq_enabled?: boolean
  contact_enabled?: boolean

  // Master Section Custom Titles
  gallery_title?: string
  gallery_subtitle?: string
  projects_title?: string
  projects_subtitle?: string
  socials_title?: string
  socials_subtitle?: string
  about_title?: string
  reviews_title?: string

  // Telegram Notifications
  telegram_notifications_enabled?: boolean
  telegram_bot_token?: string
  telegram_chat_id?: string

  // Maintenance Mode
  maintenance_mode_enabled?: boolean
  maintenance_title?: string
  maintenance_message?: string

  // Admin Security & Password
  admin_password_hash?: string
  admin_password_salt?: string
  admin_password_updated_at?: string
}

export interface SocialProfileData {
  id: string
  platform: string
  display_label: string
  handle: string
  profile_url: string
  icon_name: string
  color: string
  sort_order: number
  is_visible: boolean
  click_count?: number
}

export interface GalleryImageData {
  id: string
  title: string
  category: string
  slug: string
  description: string
  alt_text: string
  caption: string
  public_url: string
  width: number
  height: number
  is_public: boolean
  is_featured: boolean
  sort_order: number
  likes_count?: number
}

export interface AnonymousMessageData {
  id: string
  message: string
  emoji: string
  created_at: string
  is_read: boolean
}

export interface FullSiteContent {
  settings: SiteSettingsData
  socials: SocialProfileData[]
  gallery: GalleryImageData[]
}

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'site-content.json')
const tmpDataPath = path.join(os.tmpdir(), 'site-content.json')

const anonMsgFilePath = path.join(process.cwd(), 'src', 'data', 'anonymous-messages.json')
const tmpAnonMsgFilePath = path.join(os.tmpdir(), 'anonymous-messages.json')

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key || url.includes('placeholder')) return null
  try {
    return createServiceClient(url, key, { auth: { persistSession: false } })
  } catch {
    return null
  }
}

export function readContentFile(): FullSiteContent {
  try {
    if (fs.existsSync(tmpDataPath)) {
      const fileData = fs.readFileSync(tmpDataPath, 'utf8')
      return JSON.parse(fileData) as FullSiteContent
    }
    if (fs.existsSync(dataFilePath)) {
      const fileData = fs.readFileSync(dataFilePath, 'utf8')
      return JSON.parse(fileData) as FullSiteContent
    }
  } catch (err) {
    console.error('Error reading site-content.json:', err)
  }

  // Fallback defaults if file read fails
  return {
    settings: {
      site_name: 'Abdul Al Jubayer',
      first_name: 'Abdul Al',
      last_name: 'Jubayer',
      tagline: 'Visual Creator & Lifestyle Storyteller',
      bio_intro: 'Welcome to my official social hub! Connect with me across all my platforms and explore my visual diary.',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
      verified: true,
      location: 'Dhaka, Bangladesh',
      quote_or_motto: 'Living passionately, capturing moments, and connecting with inspiring minds.',
      spotlight_title: 'Check out my latest Instagram Reels & Photos 📸',
      spotlight_url: 'https://instagram.com',
      spotlight_enabled: true,
      whatsapp_number: '+8801700000000',
      status_badge: 'Open to chats & new connections ✨',
      music_enabled: true,
      music_title: 'Lofi Sunset Chill 🎧',
      music_url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
      total_views: 120,
      contact_email: 'hello@jubayer.me',
      bio_full_p1: "Hey there! I'm Abdul Al Jubayer, a visual creator and lifestyle storyteller based in Dhaka, Bangladesh.",
      bio_full_p2: 'I believe every day holds a story waiting to be told. Whether exploring new spots or meeting inspiring minds, this space is where I share my personal journey.',
      seo_title: 'Abdul Al Jubayer — Official Bio & Social Hub',
      seo_description: 'Official link-in-bio and personal social hub of Abdul Al Jubayer.',
    },
    socials: [],
    gallery: [],
  }
}

export function writeContentFile(content: FullSiteContent): boolean {
  try {
    const dir = path.dirname(dataFilePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(dataFilePath, JSON.stringify(content, null, 2), 'utf8')
  } catch {
    try {
      fs.writeFileSync(tmpDataPath, JSON.stringify(content, null, 2), 'utf8')
    } catch (err) {
      console.error('Error writing site-content to tmp:', err)
      return false
    }
  }

  try {
    revalidatePath('/')
    revalidatePath('/gallery')
    revalidatePath('/admin')
    revalidatePath('/admin/settings')
    revalidatePath('/admin/social')
    revalidatePath('/admin/gallery')
    revalidatePath('/admin/profile')
  } catch {
    // safe in non-route context
  }
  return true
}

// ── SETTINGS ───────────────────────────────────────────────────
export async function getSiteSettings(): Promise<SiteSettingsData> {
  const supabase = getServiceSupabase()
  if (supabase) {
    try {
      const { data } = await supabase.from('site_settings').select('*')
      if (data && data.length > 0) {
        const fileContent = readContentFile()
        const merged: Record<string, unknown> = { ...fileContent.settings }
        const forceStringKeys = [
          'whatsapp_number',
          'telegram_chat_id',
          'telegram_bot_token',
          'admin_password_hash',
          'admin_password_salt',
          'admin_password_updated_at',
          'maintenance_title',
          'maintenance_message',
        ]
        data.forEach((row: { key: string; value: string }) => {
          if (!row.key.endsWith('_json')) {
            if (row.value === 'true') {
              merged[row.key] = true
            } else if (row.value === 'false') {
              merged[row.key] = false
            } else if (forceStringKeys.includes(row.key) || isNaN(Number(row.value)) || typeof row.value !== 'string') {
              merged[row.key] = row.value
            } else {
              merged[row.key] = Number(row.value)
            }
          }
        })
        return merged as unknown as SiteSettingsData
      }
    } catch {
      // fallback to file
    }
  }
  return readContentFile().settings
}

export async function updateSiteSettings(
  updates: Partial<SiteSettingsData>
): Promise<SiteSettingsData> {
  const content = readContentFile()
  content.settings = { ...content.settings, ...updates }
  writeContentFile(content)

  const supabase = getServiceSupabase()
  if (supabase) {
    try {
      const rows = Object.entries(updates)
        .filter(([key]) => !key.endsWith('_json'))
        .map(([key, value]) => ({
          key,
          value: String(value),
          updated_at: new Date().toISOString(),
        }))
      await supabase.from('site_settings').upsert(rows)
    } catch (err) {
      console.warn('Supabase settings sync failed (using local store):', err)
    }
  }

  try {
    revalidatePath('/')
    revalidatePath('/admin')
    revalidatePath('/admin/settings')
  } catch {}

  return content.settings
}

// ── PAGE VIEWS ─────────────────────────────────────────────────
export async function incrementPageViews(): Promise<number> {
  const content = readContentFile()
  const current = (content.settings.total_views || 0) + 1
  content.settings.total_views = current
  writeContentFile(content)

  const supabase = getServiceSupabase()
  if (supabase) {
    try {
      await supabase
        .from('site_settings')
        .upsert([{ key: 'total_views', value: String(current), updated_at: new Date().toISOString() }])
    } catch {}
  }
  return current
}

// ── SOCIALS & CLICK TRACKING ───────────────────────────────────
export async function getSocialProfiles(): Promise<SocialProfileData[]> {
  const supabase = getServiceSupabase()
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'social_profiles_json')
        .maybeSingle()
      if (!error && data && data.value !== null && data.value !== undefined) {
        const parsed = JSON.parse(data.value)
        if (Array.isArray(parsed)) {
          return parsed.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
        }
      }
    } catch (err) {
      console.warn('Error reading social_profiles_json from Supabase:', err)
    }
  }
  const content = readContentFile()
  return (content.socials || []).sort((a, b) => a.sort_order - b.sort_order)
}

export async function saveSocialProfiles(
  socials: SocialProfileData[]
): Promise<SocialProfileData[]> {
  const content = readContentFile()
  content.socials = socials
  writeContentFile(content)

  const supabase = getServiceSupabase()
  if (supabase) {
    try {
      await supabase.from('site_settings').upsert({
        key: 'social_profiles_json',
        value: JSON.stringify(socials),
        updated_at: new Date().toISOString(),
      })
    } catch (err) {
      console.warn('Failed to sync social profiles to Supabase:', err)
    }
  }

  try {
    revalidatePath('/')
    revalidatePath('/admin')
    revalidatePath('/admin/social')
  } catch {}

  return content.socials
}

export async function incrementSocialClick(profileIdOrPlatform: string): Promise<number> {
  const allSocials = await getSocialProfiles()
  const item = allSocials.find(
    (s) => s.id === profileIdOrPlatform || s.platform.toLowerCase() === profileIdOrPlatform.toLowerCase()
  )
  if (item) {
    item.click_count = (item.click_count || 0) + 1
    await saveSocialProfiles(allSocials)
    return item.click_count
  }
  return 0
}

// ── GALLERY & LIKES ────────────────────────────────────────────
export async function getGalleryItems(): Promise<GalleryImageData[]> {
  const supabase = getServiceSupabase()
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'gallery_images_json')
        .maybeSingle()
      if (!error && data && data.value !== null && data.value !== undefined) {
        const parsed = JSON.parse(data.value)
        if (Array.isArray(parsed)) {
          return parsed.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
        }
      }
    } catch (err) {
      console.warn('Error reading gallery_images_json from Supabase:', err)
    }
  }
  const content = readContentFile()
  return (content.gallery || []).sort((a, b) => a.sort_order - b.sort_order)
}

export async function saveGalleryItems(
  gallery: GalleryImageData[]
): Promise<GalleryImageData[]> {
  const content = readContentFile()
  content.gallery = gallery
  writeContentFile(content)

  const supabase = getServiceSupabase()
  if (supabase) {
    try {
      await supabase.from('site_settings').upsert({
        key: 'gallery_images_json',
        value: JSON.stringify(gallery),
        updated_at: new Date().toISOString(),
      })
    } catch (err) {
      console.warn('Failed to sync gallery to Supabase site_settings:', err)
    }
  }

  try {
    revalidatePath('/')
    revalidatePath('/gallery')
    revalidatePath('/admin')
    revalidatePath('/admin/gallery')
  } catch {}

  return content.gallery
}

export async function incrementPhotoLike(photoId: string): Promise<number> {
  const allGallery = await getGalleryItems()
  const item = allGallery.find((g) => g.id === photoId || g.slug === photoId)
  if (item) {
    item.likes_count = (item.likes_count || 0) + 1
    await saveGalleryItems(allGallery)
    return item.likes_count
  }
  return 0
}

// ── ANONYMOUS SECRET MESSAGES ──────────────────────────────────
export function readAnonymousMessages(): AnonymousMessageData[] {
  try {
    if (fs.existsSync(tmpAnonMsgFilePath)) {
      const data = fs.readFileSync(tmpAnonMsgFilePath, 'utf8')
      return JSON.parse(data) as AnonymousMessageData[]
    }
    if (fs.existsSync(anonMsgFilePath)) {
      const data = fs.readFileSync(anonMsgFilePath, 'utf8')
      return JSON.parse(data) as AnonymousMessageData[]
    }
  } catch (err) {
    console.error('Error reading anonymous-messages.json:', err)
  }
  return []
}

export function writeAnonymousMessages(messages: AnonymousMessageData[]): boolean {
  try {
    const dir = path.dirname(anonMsgFilePath)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(anonMsgFilePath, JSON.stringify(messages, null, 2), 'utf8')
    return true
  } catch {
    try {
      fs.writeFileSync(tmpAnonMsgFilePath, JSON.stringify(messages, null, 2), 'utf8')
      return true
    } catch (err) {
      console.error('Error writing anonymous-messages to tmp:', err)
      return false
    }
  }
}

export async function getAnonymousMessages(): Promise<AnonymousMessageData[]> {
  const supabase = getServiceSupabase()
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'anonymous_messages_json')
        .maybeSingle()
      if (!error && data && data.value) {
        const parsed = JSON.parse(data.value)
        if (Array.isArray(parsed)) {
          return parsed
        }
      }
    } catch (err) {
      console.warn('Error reading anonymous_messages_json from Supabase:', err)
    }
  }
  return readAnonymousMessages()
}

export async function saveAnonymousMessages(
  messages: AnonymousMessageData[]
): Promise<AnonymousMessageData[]> {
  writeAnonymousMessages(messages)

  const supabase = getServiceSupabase()
  if (supabase) {
    try {
      await supabase.from('site_settings').upsert({
        key: 'anonymous_messages_json',
        value: JSON.stringify(messages),
        updated_at: new Date().toISOString(),
      })
    } catch (err) {
      console.warn('Failed to sync anonymous messages to Supabase:', err)
    }
  }

  try {
    revalidatePath('/admin')
    revalidatePath('/admin/messages')
  } catch {}

  return messages
}

export async function addAnonymousMessage(message: string, emoji: string = '💭'): Promise<AnonymousMessageData> {
  const newMsg: AnonymousMessageData = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    message: message.trim(),
    emoji: emoji || '💭',
    created_at: new Date().toISOString(),
    is_read: false,
  }

  const list = await getAnonymousMessages()
  list.unshift(newMsg)
  await saveAnonymousMessages(list)

  return newMsg
}
