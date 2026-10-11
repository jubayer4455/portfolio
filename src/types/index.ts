// ── Gallery ──────────────────────────────────────────────────────────────────

export interface GalleryCategory {
  id: string
  name: string
  slug: string
  sort_order: number
  created_at: string
}

export interface GalleryImage {
  id: string
  title: string
  slug: string
  description: string | null
  alt_text: string | null
  caption: string | null
  storage_path: string
  public_url: string | null
  width: number | null
  height: number | null
  category_id: string | null
  gallery_categories?: GalleryCategory | null
  is_public: boolean
  is_featured: boolean
  seo_title: string | null
  seo_description: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

// ── Social ────────────────────────────────────────────────────────────────────

export interface SocialProfile {
  id: string
  platform: string
  display_label: string
  profile_url: string
  icon_name: string | null
  sort_order: number
  is_visible: boolean
  created_at: string
  updated_at: string
}

// ── Site Settings ─────────────────────────────────────────────────────────────

export interface SiteSettings {
  key: string
  value: string | null
  updated_at: string
}

export type SiteSettingsMap = Record<string, string | null>

// ── Contact ───────────────────────────────────────────────────────────────────

export interface ContactSubmission {
  id: string
  name: string
  email: string
  subject: string | null
  message: string
  ip_address: string | null
  created_at: string
  is_read: boolean
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string
  email: string | undefined
  role: string
  created_at: string | undefined
  last_sign_in_at: string | undefined
}

// ── Page SEO ──────────────────────────────────────────────────────────────────

export interface PageSeo {
  page_slug: string
  title: string | null
  description: string | null
  og_title: string | null
  og_description: string | null
  og_image_url: string | null
  updated_at: string
}

// ── API Response ──────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data?: T
  error?: string
  success?: boolean
  message?: string
}
