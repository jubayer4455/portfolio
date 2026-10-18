import fs from 'fs'
import path from 'path'
import os from 'os'
import { revalidatePath } from 'next/cache'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { generatePhotoSeo } from '@/lib/seo-engine'

export interface UserBioData {
  id: string
  user_id: string
  username: string
  display_name: string
  tagline?: string
  bio?: string
  avatar_url?: string
  cover_url?: string
  location?: string
  social_links: Array<{
    id: string
    platform: string
    display_label: string
    profile_url: string
    icon_name?: string
    color?: string
  }>
  photos: Array<{
    id: string
    url: string
    caption?: string
    alt_text?: string
  }>
  theme?: string
  font_family?: string
  views?: number
  clicks?: number
  clicks_by_platform?: Record<string, number>
  is_verified?: boolean
  is_suspended?: boolean
  is_featured?: boolean
  phone?: string
  email?: string
  whatsapp_enabled?: boolean
  whatsapp_number?: string
  whatsapp_message?: string
  whatsapp_status?: string
  bg_3d_style?: 'particles' | 'orbit' | 'sculpture' | 'waves' | 'matrix' | 'fireflies' | 'grid' | 'none'
  status_badge?: string
  music_enabled?: boolean
  music_title?: string
  music_url?: string
  layout_style?: 'classic' | 'bento'
  created_at: string
  updated_at: string
}

export interface SiteReviewData {
  id: string
  user_id?: string
  user_name: string
  user_photo?: string
  social_link?: string
  rating: number
  comment: string
  is_approved: boolean
  created_at: string
}

const userBiosPath = path.join(process.cwd(), 'src', 'data', 'user-bios.json')
const tmpUserBiosPath = path.join(os.tmpdir(), 'user-bios.json')

const reviewsPath = path.join(process.cwd(), 'src', 'data', 'site-reviews.json')
const tmpReviewsPath = path.join(os.tmpdir(), 'site-reviews.json')

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key || url.includes('placeholder')) return null
  try {
    return createServiceClient(url, key, { auth: { persistSession: false } })
  } catch {
    return null
  }
}

// ── USER BIOS STORAGE ─────────────────────────────────────────
export function readAllUserBios(): UserBioData[] {
  try {
    if (fs.existsSync(tmpUserBiosPath)) {
      const data = fs.readFileSync(tmpUserBiosPath, 'utf8')
      return JSON.parse(data) as UserBioData[]
    }
    if (fs.existsSync(userBiosPath)) {
      const data = fs.readFileSync(userBiosPath, 'utf8')
      return JSON.parse(data) as UserBioData[]
    }
  } catch (err) {
    console.error('Error reading user-bios.json:', err)
  }
  return []
}

export function writeAllUserBios(bios: UserBioData[]): boolean {
  try {
    const dir = path.dirname(userBiosPath)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(userBiosPath, JSON.stringify(bios, null, 2), 'utf8')
    return true
  } catch {
    try {
      fs.writeFileSync(tmpUserBiosPath, JSON.stringify(bios, null, 2), 'utf8')
      return true
    } catch (err) {
      console.error('Error writing user-bios to tmp:', err)
      return false
    }
  }
}

export async function getUserBioByUsername(username: string): Promise<UserBioData | null> {
  const clean = decodeURIComponent(username || '')
    .replace(/^@+/, '')
    .trim()
    .toLowerCase()

  if (!clean) return null

  const supabase = getServiceSupabase()
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('user_bios')
        .select('*')
        .ilike('username', clean)
        .maybeSingle()
      if (!error && data) {
        return data as UserBioData
      }
    } catch {}

    try {
      const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'all_user_bios_json')
        .single()
      if (data?.value) {
        const parsed = JSON.parse(data.value) as UserBioData[]
        const found = parsed.find(
          (b) => (b.username || '').replace(/^@+/, '').trim().toLowerCase() === clean
        )
        if (found) return found
      }
    } catch {}
  }

  const all = readAllUserBios()
  return (
    all.find((b) => {
      const u = (b.username || '').replace(/^@+/, '').trim().toLowerCase()
      return u === clean
    }) || null
  )
}

export async function getUserBioByUserId(userId: string): Promise<UserBioData | null> {
  const supabase = getServiceSupabase()
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('user_bios')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()
      if (!error && data) {
        return data as UserBioData
      }
    } catch {}

    try {
      const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'all_user_bios_json')
        .single()
      if (data?.value) {
        const parsed = JSON.parse(data.value) as UserBioData[]
        const found = parsed.find((b) => b.user_id === userId)
        if (found) return found
      }
    } catch {}
  }

  const all = readAllUserBios()
  return all.find((b) => b.user_id === userId) || null
}

export async function saveUserBio(bio: Partial<UserBioData> & { user_id: string; username: string }): Promise<UserBioData> {
  const all = readAllUserBios()
  const cleanUser = decodeURIComponent(bio.username || '').replace(/^@+/, '').trim().toLowerCase()
  const existingIdx = all.findIndex((b) => b.user_id === bio.user_id || b.username.toLowerCase() === cleanUser)

  const now = new Date().toISOString()
  const record: UserBioData = {
    id: bio.id || (existingIdx >= 0 ? all[existingIdx].id : `bio-${Date.now()}`),
    user_id: bio.user_id,
    username: cleanUser,
    display_name: bio.display_name || 'My Bio Profile',
    tagline: bio.tagline || '',
    bio: bio.bio || '',
    avatar_url: bio.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    cover_url: bio.cover_url !== undefined ? bio.cover_url : (existingIdx >= 0 ? (all[existingIdx].cover_url || '') : ''),
    location: bio.location || '',
    phone: bio.phone !== undefined ? bio.phone : (existingIdx >= 0 ? all[existingIdx].phone : ''),
    email: bio.email !== undefined ? bio.email : (existingIdx >= 0 ? all[existingIdx].email : ''),
    social_links: bio.social_links || [],
    photos: (bio.photos || []).slice(0, 4).map((p, idx) => {
      const seo = generatePhotoSeo({
        caption: p.caption,
        displayName: bio.display_name,
        username: cleanUser,
        photoType: 'user-photo',
        slotIndex: idx,
      })
      return {
        id: p.id || `photo-${Date.now()}-${idx}`,
        url: p.url,
        caption: p.caption || `Featured Photo ${idx + 1}`,
        alt_text: (p as any).alt_text || seo.alt_text,
      }
    }),
    theme: bio.theme || 'orange',
    font_family: bio.font_family || (existingIdx >= 0 ? all[existingIdx].font_family : 'sans'),
    bg_3d_style: bio.bg_3d_style || (existingIdx >= 0 ? all[existingIdx].bg_3d_style : 'particles'),
    status_badge: bio.status_badge !== undefined ? bio.status_badge : (existingIdx >= 0 ? all[existingIdx].status_badge : 'Open to chats & new connections ✨'),
    music_enabled: bio.music_enabled !== undefined ? bio.music_enabled : (existingIdx >= 0 ? all[existingIdx].music_enabled : false),
    music_title: bio.music_title !== undefined ? bio.music_title : (existingIdx >= 0 ? all[existingIdx].music_title : 'Lofi Beats 🎧'),
    music_url: bio.music_url !== undefined ? bio.music_url : (existingIdx >= 0 ? all[existingIdx].music_url : 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3'),
    layout_style: bio.layout_style || (existingIdx >= 0 ? all[existingIdx].layout_style : 'classic'),
    views: bio.views !== undefined ? bio.views : (existingIdx >= 0 ? (all[existingIdx].views || 0) : 0),
    clicks: bio.clicks !== undefined ? bio.clicks : (existingIdx >= 0 ? (all[existingIdx].clicks || 0) : 0),
    clicks_by_platform: bio.clicks_by_platform || (existingIdx >= 0 ? all[existingIdx].clicks_by_platform : {}),
    is_verified: bio.is_verified !== undefined ? bio.is_verified : (existingIdx >= 0 ? all[existingIdx].is_verified : false),
    is_suspended: bio.is_suspended !== undefined ? bio.is_suspended : (existingIdx >= 0 ? all[existingIdx].is_suspended : false),
    is_featured: bio.is_featured !== undefined ? bio.is_featured : (existingIdx >= 0 ? all[existingIdx].is_featured : false),
    created_at: existingIdx >= 0 ? all[existingIdx].created_at : now,
    updated_at: now,
  }

  if (existingIdx >= 0) {
    all[existingIdx] = record
  } else {
    all.push(record)
  }
  writeAllUserBios(all)

  const supabase = getServiceSupabase()
  if (supabase) {
    try {
      await supabase.from('user_bios').upsert(
        {
          id: record.id,
          user_id: record.user_id,
          username: record.username,
          display_name: record.display_name,
          tagline: record.tagline,
          bio: record.bio,
          avatar_url: record.avatar_url,
          cover_url: record.cover_url,
          location: record.location,
          social_links: record.social_links,
          photos: record.photos,
          theme: record.theme,
          updated_at: now,
        },
        { onConflict: 'username' }
      )
    } catch {}

    // Always mirror to site_settings for serverless persistence
    try {
      await supabase.from('site_settings').upsert({
        key: 'all_user_bios_json',
        value: JSON.stringify(all),
        updated_at: now,
      })
    } catch {}
  }

  try {
    revalidatePath('/')
    revalidatePath(`/u/${cleanUser}`)
    revalidatePath('/dashboard')
    revalidatePath('/admin/users')
  } catch {}

  return record
}

export async function getAllUserBios(): Promise<UserBioData[]> {
  const supabase = getServiceSupabase()
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('user_bios')
        .select('*')
        .order('created_at', { ascending: false })
      if (!error && data && data.length > 0) {
        return data as UserBioData[]
      }
    } catch {}

    try {
      const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'all_user_bios_json')
        .single()
      if (data?.value) {
        const parsed = JSON.parse(data.value) as UserBioData[]
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
        }
      }
    } catch {}
  }
  return readAllUserBios()
}

export async function deleteUserBio(id: string): Promise<boolean> {
  const all = readAllUserBios()
  const filtered = all.filter((b) => b.id !== id && b.username !== id)
  writeAllUserBios(filtered)

  const supabase = getServiceSupabase()
  if (supabase) {
    try {
      await supabase.from('user_bios').delete().or(`id.eq.${id},username.eq.${id}`)
    } catch {}
  }
  return true
}

export async function incrementBioViews(username: string): Promise<number> {
  const all = readAllUserBios()
  const target = all.find((b) => b.username.toLowerCase() === username.toLowerCase())
  if (!target) return 0

  target.views = (target.views || 0) + 1
  writeAllUserBios(all)
  return target.views
}

export async function incrementBioClicks(username: string, platform?: string): Promise<number> {
  const all = readAllUserBios()
  const target = all.find((b) => b.username.toLowerCase() === username.toLowerCase())
  if (!target) return 0

  target.clicks = (target.clicks || 0) + 1
  if (platform) {
    target.clicks_by_platform = target.clicks_by_platform || {}
    target.clicks_by_platform[platform] = (target.clicks_by_platform[platform] || 0) + 1
  }
  writeAllUserBios(all)
  return target.clicks
}

// ── REVIEWS STORAGE ───────────────────────────────────────────
export function readAllReviews(): SiteReviewData[] {
  try {
    if (fs.existsSync(tmpReviewsPath)) {
      const data = fs.readFileSync(tmpReviewsPath, 'utf8')
      return JSON.parse(data) as SiteReviewData[]
    }
    if (fs.existsSync(reviewsPath)) {
      const data = fs.readFileSync(reviewsPath, 'utf8')
      return JSON.parse(data) as SiteReviewData[]
    }
  } catch (err) {
    console.error('Error reading site-reviews.json:', err)
  }
  return []
}

export function writeAllReviews(reviews: SiteReviewData[]): boolean {
  try {
    const dir = path.dirname(reviewsPath)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(reviewsPath, JSON.stringify(reviews, null, 2), 'utf8')
    return true
  } catch {
    try {
      fs.writeFileSync(tmpReviewsPath, JSON.stringify(reviews, null, 2), 'utf8')
      return true
    } catch (err) {
      console.error('Error writing site-reviews to tmp:', err)
      return false
    }
  }
}

export async function getAllReviews(): Promise<SiteReviewData[]> {
  const supabase = getServiceSupabase()
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'site_reviews_json')
        .maybeSingle()
      if (!error && data && data.value) {
        const parsed = JSON.parse(data.value)
        if (Array.isArray(parsed)) {
          return parsed
        }
      }
    } catch (err) {
      console.warn('Error reading site_reviews_json from Supabase:', err)
    }
  }
  return readAllReviews()
}

export async function saveAllReviews(reviews: SiteReviewData[]): Promise<SiteReviewData[]> {
  writeAllReviews(reviews)

  const supabase = getServiceSupabase()
  if (supabase) {
    try {
      await supabase.from('site_settings').upsert({
        key: 'site_reviews_json',
        value: JSON.stringify(reviews),
        updated_at: new Date().toISOString(),
      })
    } catch (err) {
      console.warn('Failed to sync site reviews to Supabase:', err)
    }
  }

  try {
    revalidatePath('/')
    revalidatePath('/admin')
    revalidatePath('/admin/reviews')
  } catch {}

  return reviews
}

export async function getApprovedReviews(): Promise<SiteReviewData[]> {
  const all = await getAllReviews()
  return all.filter((r) => r.is_approved).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export async function addReview(review: Omit<SiteReviewData, 'id' | 'is_approved' | 'created_at'>): Promise<SiteReviewData> {
  const newReview: SiteReviewData = {
    id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    ...review,
    is_approved: false, // requires master admin approval
    created_at: new Date().toISOString(),
  }

  const all = await getAllReviews()
  all.unshift(newReview)
  await saveAllReviews(all)

  recordActivity(
    'review_submitted',
    'New Review Submitted',
    `${newReview.user_name} left a ${newReview.rating}-star review: "${newReview.comment.slice(0, 30)}..."`,
    'review',
    newReview.user_name
  )

  return newReview
}

export async function setReviewApproval(reviewId: string, isApproved: boolean): Promise<boolean> {
  const all = await getAllReviews()
  const item = all.find((r) => r.id === reviewId)
  if (item) {
    item.is_approved = isApproved
    await saveAllReviews(all)
  }
  return true
}

export async function deleteReview(reviewId: string): Promise<boolean> {
  const all = await getAllReviews()
  const filtered = all.filter((r) => r.id !== reviewId)
  await saveAllReviews(filtered)
  return true
}

// ── USER BIO STATUS CONTROLS (VERIFY / BAN / FEATURE) ─────────
export async function updateUserBioStatus(
  idOrUsername: string,
  updates: { is_verified?: boolean; is_suspended?: boolean; is_featured?: boolean }
): Promise<UserBioData | null> {
  const bios = readAllUserBios()
  const clean = idOrUsername.toLowerCase().trim()
  const bio = bios.find(
    (b) => b.id === idOrUsername || b.username.toLowerCase() === clean
  )

  if (!bio) return null

  if (typeof updates.is_verified === 'boolean') bio.is_verified = updates.is_verified
  if (typeof updates.is_suspended === 'boolean') bio.is_suspended = updates.is_suspended
  if (typeof updates.is_featured === 'boolean') bio.is_featured = updates.is_featured
  bio.updated_at = new Date().toISOString()

  writeAllUserBios(bios)

  const supabase = getServiceSupabase()
  if (supabase) {
    try {
      await supabase
        .from('user_bios')
        .update({
          is_verified: bio.is_verified,
          is_suspended: bio.is_suspended,
          is_featured: bio.is_featured,
          updated_at: bio.updated_at,
        })
        .eq('id', bio.id)
    } catch {}
  }

  return bio
}

// ── ACTIVITY LOG STORAGE ──────────────────────────────────────
export interface ActivityLogItem {
  id: string
  action: string
  title: string
  description: string
  type: 'user' | 'review' | 'security' | 'system'
  timestamp: string
  user_name?: string
}

const activityLogPath = path.join(process.cwd(), 'src', 'data', 'activity-log.json')
const tmpActivityLogPath = path.join(os.tmpdir(), 'activity-log.json')

export function readActivityLogs(): ActivityLogItem[] {
  try {
    if (fs.existsSync(tmpActivityLogPath)) {
      const data = fs.readFileSync(tmpActivityLogPath, 'utf8')
      return JSON.parse(data) as ActivityLogItem[]
    }
    if (fs.existsSync(activityLogPath)) {
      const data = fs.readFileSync(activityLogPath, 'utf8')
      return JSON.parse(data) as ActivityLogItem[]
    }
  } catch (err) {
    console.error('Error reading activity-log.json:', err)
  }
  return []
}

export function writeActivityLogs(logs: ActivityLogItem[]): boolean {
  try {
    const dir = path.dirname(activityLogPath)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(activityLogPath, JSON.stringify(logs.slice(0, 50), null, 2), 'utf8')
    return true
  } catch {
    try {
      fs.writeFileSync(tmpActivityLogPath, JSON.stringify(logs.slice(0, 50), null, 2), 'utf8')
      return true
    } catch (err) {
      console.error('Error writing activity-log to tmp:', err)
      return false
    }
  }
}

export function recordActivity(
  action: string,
  title: string,
  description: string,
  type: 'user' | 'review' | 'security' | 'system' = 'system',
  userName?: string
): ActivityLogItem {
  const logs = readActivityLogs()
  const item: ActivityLogItem = {
    id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    action,
    title,
    description,
    type,
    timestamp: new Date().toISOString(),
    user_name: userName,
  }
  logs.unshift(item)
  writeActivityLogs(logs)
  return item
}

// ── USER ANONYMOUS SECRET MESSAGES (NGL STYLE) ───────────────
export interface UserSecretMessage {
  id: string
  recipient_username: string
  message: string
  emoji: string
  created_at: string
  is_read: boolean
}

const userSecretMessagesPath = path.join(process.cwd(), 'src', 'data', 'user-secret-messages.json')
const tmpUserSecretMessagesPath = path.join(os.tmpdir(), 'user-secret-messages.json')

export function readAllUserSecretMessages(): UserSecretMessage[] {
  try {
    if (fs.existsSync(tmpUserSecretMessagesPath)) {
      const data = fs.readFileSync(tmpUserSecretMessagesPath, 'utf8')
      return JSON.parse(data) as UserSecretMessage[]
    }
    if (fs.existsSync(userSecretMessagesPath)) {
      const data = fs.readFileSync(userSecretMessagesPath, 'utf8')
      return JSON.parse(data) as UserSecretMessage[]
    }
  } catch (err) {
    console.error('Error reading user-secret-messages.json:', err)
  }
  return []
}

export function writeAllUserSecretMessages(messages: UserSecretMessage[]): boolean {
  try {
    const dir = path.dirname(userSecretMessagesPath)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(userSecretMessagesPath, JSON.stringify(messages, null, 2), 'utf8')
    return true
  } catch {
    try {
      fs.writeFileSync(tmpUserSecretMessagesPath, JSON.stringify(messages, null, 2), 'utf8')
      return true
    } catch (err) {
      console.error('Error writing user-secret-messages to tmp:', err)
      return false
    }
  }
}

export function getUserSecretMessages(username: string): UserSecretMessage[] {
  const clean = username.toLowerCase().trim()
  const all = readAllUserSecretMessages()
  return all.filter((m) => m.recipient_username.toLowerCase() === clean)
}

export function sendUserSecretMessage(
  recipient_username: string,
  message: string,
  emoji: string = '💭'
): UserSecretMessage {
  const all = readAllUserSecretMessages()
  const clean = recipient_username.toLowerCase().trim()
  const newMsg: UserSecretMessage = {
    id: `usm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    recipient_username: clean,
    message: message.trim(),
    emoji: emoji || '💭',
    created_at: new Date().toISOString(),
    is_read: false,
  }
  all.unshift(newMsg)
  writeAllUserSecretMessages(all)

  recordActivity(
    'user_secret_message',
    'Secret Note Received',
    `Someone sent an anonymous note to @${clean}: "${message.slice(0, 30)}..."`,
    'user',
    clean
  )

  return newMsg
}

export function markUserSecretMessageRead(id: string): boolean {
  const all = readAllUserSecretMessages()
  const item = all.find((m) => m.id === id)
  if (item) {
    item.is_read = true
    writeAllUserSecretMessages(all)
    return true
  }
  return false
}

export function deleteUserSecretMessage(id: string): boolean {
  const all = readAllUserSecretMessages()
  const filtered = all.filter((m) => m.id !== id)
  if (filtered.length !== all.length) {
    writeAllUserSecretMessages(filtered)
    return true
  }
  return false
}


