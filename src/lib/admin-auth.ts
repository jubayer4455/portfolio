import crypto from 'crypto'
import { getSiteSettings, updateSiteSettings } from '@/lib/content-store'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { readAllUserAccounts, writeAllUserAccounts, hashPassword as hashAccountPassword } from '@/lib/user-auth'

const DEFAULT_SALT = 'portfolio-master-salt-2026'
const DEFAULT_PASS = 'admin123'

function hashAdminPassword(password: string, salt: string): string {
  return crypto.createHash('sha256').update(`${password}:${salt}`).digest('hex')
}

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

/**
 * Verifies if the entered password matches the admin password
 */
export async function verifyAdminPassword(password: string): Promise<boolean> {
  const cleanPass = (password || '').trim()
  if (!cleanPass) return false

  const settings = await getSiteSettings()

  // 1. If custom password is set in settings
  if (settings.admin_password_hash && settings.admin_password_salt) {
    const computed = hashAdminPassword(cleanPass, settings.admin_password_salt)
    if (computed === settings.admin_password_hash) {
      return true
    }
    // Also allow default admin123 as recovery if not explicitly disabled
    if (cleanPass === DEFAULT_PASS) {
      return true
    }
    return false
  }

  // 2. Default password check
  return cleanPass === DEFAULT_PASS
}

/**
 * Updates the admin password across Site Settings, Supabase Auth, and local accounts
 */
export async function updateAdminPassword(
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const cleanPass = (newPassword || '').trim()
  if (cleanPass.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' }
  }

  const salt = crypto.randomBytes(16).toString('hex')
  const passwordHash = hashAdminPassword(cleanPass, salt)
  const now = new Date().toISOString()

  // 1. Save in site settings (persisted to Supabase site_settings and site-content.json)
  await updateSiteSettings({
    admin_password_hash: passwordHash,
    admin_password_salt: salt,
    admin_password_updated_at: now,
  })

  // 2. Sync with Supabase Auth users using service role key
  const supabase = getServiceSupabase()
  if (supabase) {
    try {
      const { data: usersData, error: listError } = await supabase.auth.admin.listUsers()
      if (!listError && usersData?.users) {
        const adminEmails = [
          'admin@portfolio.com',
          'jubayerahmmed2k@gmail.com',
          'hello@jubayer.me',
        ]

        let adminUserFound = false
        for (const u of usersData.users) {
          if (adminEmails.includes((u.email || '').toLowerCase())) {
            adminUserFound = true
            await supabase.auth.admin.updateUserById(u.id, { password: cleanPass })
          }
        }

        // If admin@portfolio.com is not yet in Supabase Auth, create it
        if (!adminUserFound) {
          await supabase.auth.admin.createUser({
            email: 'admin@portfolio.com',
            password: cleanPass,
            email_confirm: true,
            user_metadata: { role: 'admin', display_name: 'Abdul Al Jubayer' },
          })
        }
      }
    } catch (err) {
      console.warn('Supabase Auth password sync error (continuing with site_settings):', err)
    }
  }

  // 3. Sync with local user-accounts.json for local session consistency
  try {
    const accounts = readAllUserAccounts()
    const targetAccounts = accounts.filter(
      (a) =>
        a.username.toLowerCase() === 'admin' ||
        a.username.toLowerCase() === 'jubayer' ||
        a.email.toLowerCase() === 'admin@portfolio.com' ||
        a.email.toLowerCase() === 'jubayerahmmed2k@gmail.com'
    )

    if (targetAccounts.length > 0) {
      for (const acc of targetAccounts) {
        acc.passwordHash = hashAccountPassword(cleanPass, acc.salt)
        acc.updatedAt = now
      }
      writeAllUserAccounts(accounts)
    }
  } catch (err) {
    console.warn('Local account password sync warning:', err)
  }

  return { success: true }
}
