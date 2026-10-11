import fs from 'fs'
import path from 'path'
import os from 'os'
import { revalidatePath } from 'next/cache'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export interface FeaturedProject {
  id: string
  title: string
  url: string
  description?: string
  category?: string
  logo_url?: string
  preview_image?: string
  tags: string[]
  is_featured: boolean
  sort_order: number
  clicks?: number
  created_at: string
  updated_at?: string
}

const projectsFilePath = path.join(process.cwd(), 'src', 'data', 'featured-projects.json')
const tmpProjectsPath = path.join(os.tmpdir(), 'featured-projects.json')

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

/**
 * Extracts a clean domain and builds high-res Google / IconHorse favicon URL
 */
export function getDomainLogoUrl(inputUrl: string): string {
  try {
    let clean = inputUrl.trim()
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = `https://${clean}`
    }
    const parsed = new URL(clean)
    const host = parsed.hostname.replace(/^www\./, '')
    // Use high-res 128px Google Favicon Service
    return `https://www.google.com/s2/favicons?domain=${host}&sz=128`
  } catch {
    return 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=128&q=80'
  }
}

export function readAllFeaturedProjects(): FeaturedProject[] {
  try {
    if (fs.existsSync(tmpProjectsPath)) {
      const data = fs.readFileSync(tmpProjectsPath, 'utf8')
      const parsed = JSON.parse(data)
      if (Array.isArray(parsed)) {
        return parsed.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      }
    }
    if (fs.existsSync(projectsFilePath)) {
      const data = fs.readFileSync(projectsFilePath, 'utf8')
      const parsed = JSON.parse(data)
      if (Array.isArray(parsed)) {
        return parsed.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      }
    }
  } catch (err) {
    console.error('Error reading featured-projects.json:', err)
  }
  return []
}

export function writeAllFeaturedProjects(projects: FeaturedProject[]): boolean {
  try {
    const dir = path.dirname(projectsFilePath)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(projectsFilePath, JSON.stringify(projects, null, 2), 'utf8')
    return true
  } catch {
    try {
      fs.writeFileSync(tmpProjectsPath, JSON.stringify(projects, null, 2), 'utf8')
      return true
    } catch (err) {
      console.error('Error writing featured-projects to tmp:', err)
      return false
    }
  }
}

export async function getFeaturedProjects(): Promise<FeaturedProject[]> {
  const supabase = getServiceSupabase()
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'featured_projects_json')
        .single()
      if (!error && data?.value) {
        const parsed = JSON.parse(data.value)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
        }
      }
    } catch {
      // fallback to file
    }
  }
  return readAllFeaturedProjects()
}

export async function saveFeaturedProject(input: Partial<FeaturedProject>): Promise<FeaturedProject> {
  const all = await getFeaturedProjects()
  const now = new Date().toISOString()

  let logo = input.logo_url?.trim()
  if (!logo && input.url) {
    logo = getDomainLogoUrl(input.url)
  }

  let resultProject: FeaturedProject

  if (input.id) {
    const idx = all.findIndex((p) => p.id === input.id)
    if (idx !== -1) {
      const updated: FeaturedProject = {
        ...all[idx],
        ...input,
        logo_url: logo || all[idx].logo_url,
        updated_at: now,
      } as FeaturedProject
      all[idx] = updated
      resultProject = updated
    } else {
      resultProject = {
        id: input.id,
        title: input.title?.trim() || 'My Web Project',
        url: input.url?.trim() || 'https://',
        description: input.description?.trim() || '',
        category: input.category?.trim() || 'Website',
        logo_url: logo || getDomainLogoUrl(input.url || ''),
        preview_image: input.preview_image?.trim() || '',
        tags: Array.isArray(input.tags) ? input.tags : [],
        is_featured: input.is_featured !== false,
        sort_order: input.sort_order ?? all.length + 1,
        clicks: input.clicks || 0,
        created_at: now,
        updated_at: now,
      }
      all.push(resultProject)
    }
  } else {
    resultProject = {
      id: `proj-${Date.now()}`,
      title: input.title?.trim() || 'My Web Project',
      url: input.url?.trim() || 'https://',
      description: input.description?.trim() || '',
      category: input.category?.trim() || 'Website',
      logo_url: logo || getDomainLogoUrl(input.url || ''),
      preview_image: input.preview_image?.trim() || '',
      tags: Array.isArray(input.tags) ? input.tags : [],
      is_featured: input.is_featured !== false,
      sort_order: input.sort_order ?? all.length + 1,
      clicks: input.clicks || 0,
      created_at: now,
      updated_at: now,
    }
    all.push(resultProject)
  }

  writeAllFeaturedProjects(all)

  // Sync to Supabase site_settings
  const supabase = getServiceSupabase()
  if (supabase) {
    try {
      await supabase.from('site_settings').upsert({
        key: 'featured_projects_json',
        value: JSON.stringify(all),
        updated_at: now,
      })
    } catch (err) {
      console.warn('Failed to sync featured projects to Supabase:', err)
    }
  }

  try {
    revalidatePath('/')
    revalidatePath('/admin/projects')
  } catch {}

  return resultProject
}

export async function deleteFeaturedProject(id: string): Promise<boolean> {
  const all = await getFeaturedProjects()
  const filtered = all.filter((p) => p.id !== id)
  if (filtered.length !== all.length) {
    writeAllFeaturedProjects(filtered)

    const supabase = getServiceSupabase()
    if (supabase) {
      try {
        await supabase.from('site_settings').upsert({
          key: 'featured_projects_json',
          value: JSON.stringify(filtered),
          updated_at: new Date().toISOString(),
        })
      } catch {}
    }

    try {
      revalidatePath('/')
      revalidatePath('/admin/projects')
    } catch {}

    return true
  }
  return false
}

export async function incrementProjectClicks(id: string): Promise<number> {
  const all = await getFeaturedProjects()
  const target = all.find((p) => p.id === id)
  if (target) {
    target.clicks = (target.clicks || 0) + 1
    writeAllFeaturedProjects(all)

    const supabase = getServiceSupabase()
    if (supabase) {
      try {
        await supabase.from('site_settings').upsert({
          key: 'featured_projects_json',
          value: JSON.stringify(all),
          updated_at: new Date().toISOString(),
        })
      } catch {}
    }

    return target.clicks
  }
  return 0
}
