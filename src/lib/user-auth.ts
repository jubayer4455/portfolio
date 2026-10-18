import fs from 'fs'
import path from 'path'
import os from 'os'
import crypto from 'crypto'
import { readAllUserBios, saveUserBio, recordActivity } from '@/lib/builder-store'

export interface UserAccount {
  id: string
  email: string
  username: string
  displayName: string
  passwordHash: string
  salt: string
  createdAt: string
  updatedAt: string
}

const accountsPath = path.join(process.cwd(), 'src', 'data', 'user-accounts.json')
const tmpAccountsPath = path.join(os.tmpdir(), 'user-accounts.json')

export function hashPassword(password: string, salt: string): string {
  return crypto.createHash('sha256').update(`${password}:${salt}`).digest('hex')
}

export function readAllUserAccounts(): UserAccount[] {
  try {
    if (fs.existsSync(tmpAccountsPath)) {
      const data = fs.readFileSync(tmpAccountsPath, 'utf8')
      return JSON.parse(data) as UserAccount[]
    }
    if (fs.existsSync(accountsPath)) {
      const data = fs.readFileSync(accountsPath, 'utf8')
      return JSON.parse(data) as UserAccount[]
    }
  } catch (err) {
    console.error('Error reading user-accounts.json:', err)
  }

  // Seed default accounts if file not found
  const defaultSalt = 'aj-secure-salt-2026'
  const seeded: UserAccount[] = [
    {
      id: 'demo-user-123',
      email: 'sarah@bio.com',
      username: 'sarah',
      displayName: 'Sarah Rahman',
      salt: defaultSalt,
      passwordHash: hashPassword('sarah123', defaultSalt),
      createdAt: '2026-10-10T10:00:00.000Z',
      updatedAt: '2026-10-10T10:00:00.000Z',
    },
    {
      id: '3c04c4e0-1653-4037-af3b-32b7c5c36a16',
      email: 'jubayerahmmed2k@gmail.com',
      username: 'jubayer',
      displayName: 'Abdul Al Jubayer',
      salt: defaultSalt,
      passwordHash: hashPassword('Jubayer444@@', defaultSalt),
      createdAt: '2026-10-11T07:59:06.802Z',
      updatedAt: '2026-10-18T10:00:00.000Z',
    },
  ]
  writeAllUserAccounts(seeded)
  return seeded
}

export function writeAllUserAccounts(accounts: UserAccount[]): boolean {
  try {
    const dir = path.dirname(accountsPath)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(accountsPath, JSON.stringify(accounts, null, 2), 'utf8')
    return true
  } catch {
    try {
      fs.writeFileSync(tmpAccountsPath, JSON.stringify(accounts, null, 2), 'utf8')
      return true
    } catch (err) {
      console.error('Error writing user-accounts to tmp:', err)
      return false
    }
  }
}

export async function registerUserAccount(params: {
  email: string
  username: string
  displayName: string
  password: string
}): Promise<{ success: boolean; account?: UserAccount; error?: string }> {
  const cleanEmail = (params.email || '').toLowerCase().trim()
  const cleanUsername = (params.username || '')
    .toLowerCase()
    .trim()
    .replace(/^@+/, '')
    .replace(/[^a-z0-9_-]/g, '')
  const cleanName = (params.displayName || '').trim()

  if (!cleanName || !cleanUsername || !cleanEmail || !params.password) {
    return { success: false, error: 'Please fill in all required fields.' }
  }

  if (cleanUsername.length < 3) {
    return { success: false, error: 'Username must be at least 3 characters long.' }
  }

  if (params.password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' }
  }

  const accounts = readAllUserAccounts()

  // Check email conflict
  if (accounts.some((a) => a.email.toLowerCase() === cleanEmail)) {
    return {
      success: false,
      error: `An account with email ${cleanEmail} already exists. Please sign in instead.`,
    }
  }

  // Check username conflict in accounts or existing bios
  const allBios = readAllUserBios()
  if (
    accounts.some((a) => a.username.toLowerCase() === cleanUsername) ||
    allBios.some((b) => b.username.toLowerCase() === cleanUsername)
  ) {
    return {
      success: false,
      error: `Username @${cleanUsername} is already taken. Please choose another username.`,
    }
  }

  const salt = crypto.randomBytes(16).toString('hex')
  const passwordHash = hashPassword(params.password, salt)
  const newId = `user-${Date.now()}`

  const newAccount: UserAccount = {
    id: newId,
    email: cleanEmail,
    username: cleanUsername,
    displayName: cleanName,
    passwordHash,
    salt,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  accounts.push(newAccount)
  writeAllUserAccounts(accounts)

  // Ensure user bio is initialized
  await saveUserBio({
    user_id: newId,
    username: cleanUsername,
    display_name: cleanName,
    email: cleanEmail,
    tagline: 'Visual Creator & Digital Explorer ✨',
    bio: 'Welcome to my official 3D Link-in-Bio profile! Connect with me on my social accounts below.',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    location: 'Dhaka, Bangladesh',
    font_family: 'sans',
    bg_3d_style: 'particles',
    status_badge: '🟢 Open for projects',
    layout_style: 'bento',
    views: 0,
    clicks: 0,
    clicks_by_platform: {},
    social_links: [
      { id: '1', platform: 'Instagram', display_label: `@${cleanUsername}`, profile_url: 'https://instagram.com' },
      { id: '2', platform: 'Facebook', display_label: cleanName, profile_url: 'https://facebook.com' },
    ],
    photos: [],
    theme: 'orange',
  })

  recordActivity(
    'user_signup',
    'New User Registered',
    `@${cleanUsername} (${cleanName}) created a new bio profile.`,
    'user',
    cleanUsername
  )

  return { success: true, account: newAccount }
}

export function authenticateUser(
  identifier: string,
  password: string
): { success: boolean; account?: UserAccount; error?: string } {
  const cleanId = (identifier || '')
    .toLowerCase()
    .trim()
    .replace(/^@+/, '')
  const cleanPass = (password || '').trim()

  if (!cleanId || !cleanPass) {
    return { success: false, error: 'Please enter your email or username and password.' }
  }

  const accounts = readAllUserAccounts()
  const allBios = readAllUserBios()

  // 1. Direct match by email or username in accounts
  let matched = accounts.find(
    (a) =>
      a.email.toLowerCase() === cleanId ||
      a.username.toLowerCase() === cleanId
  )

  // 2. Jubayer master alias check
  if (!matched && (
    cleanId === 'jubayer' ||
    cleanId === 'jubayer0' ||
    cleanId === 'jubayerahmmed2k@gmail.com' ||
    cleanId === 'jubayer@portfolio.com' ||
    cleanId === 'jubayer@bio.com' ||
    cleanId.startsWith('jubayer')
  )) {
    matched = accounts.find((a) => a.username.toLowerCase() === 'jubayer')
    if (!matched) {
      const salt = 'aj-secure-salt-2026'
      matched = {
        id: '3c04c4e0-1653-4037-af3b-32b7c5c36a16',
        email: cleanId.includes('@') ? cleanId : 'jubayerahmmed2k@gmail.com',
        username: 'jubayer',
        displayName: 'Abdul Al Jubayer',
        passwordHash: hashPassword(cleanPass, salt),
        salt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      accounts.push(matched)
      writeAllUserAccounts(accounts)
    }
  }

  // 3. Sarah master alias check
  if (!matched && (
    cleanId === 'sarah' ||
    cleanId === 'sarah@creator.me' ||
    cleanId === 'sarah@bio.com'
  )) {
    matched = accounts.find((a) => a.username.toLowerCase() === 'sarah')
  }

  // 4. Bio match: Check if username or email exists in user-bios.json
  if (!matched) {
    const matchingBio = allBios.find(
      (b) =>
        b.username.toLowerCase() === cleanId ||
        (b.email && b.email.toLowerCase() === cleanId)
    )

    if (matchingBio) {
      matched = accounts.find(
        (a) =>
          a.username.toLowerCase() === matchingBio.username.toLowerCase() ||
          a.id === matchingBio.user_id
      )

      if (!matched) {
        const salt = 'aj-secure-salt-2026'
        matched = {
          id: matchingBio.user_id || `user-${Date.now()}`,
          email: matchingBio.email || `${matchingBio.username}@portfolio.user`,
          username: matchingBio.username,
          displayName: matchingBio.display_name,
          passwordHash: hashPassword(cleanPass, salt),
          salt,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        accounts.push(matched)
        writeAllUserAccounts(accounts)
      }
    }
  }

  // 5. Seamless on-the-fly registration: If account doesn't exist anywhere
  if (!matched) {
    if (cleanPass.length >= 4) {
      const uname = (cleanId.includes('@') ? cleanId.split('@')[0] : cleanId).replace(/[^a-z0-9_-]/g, '').slice(0, 20) || `user${Math.floor(Math.random() * 1000)}`
      const email = cleanId.includes('@') ? cleanId : `${uname}@portfolio.user`
      const dname = uname.charAt(0).toUpperCase() + uname.slice(1)
      const salt = crypto.randomBytes(16).toString('hex')
      const passwordHash = hashPassword(cleanPass, salt)
      const newId = `user-${Date.now()}`

      matched = {
        id: newId,
        email,
        username: uname,
        displayName: dname,
        passwordHash,
        salt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      accounts.push(matched)
      writeAllUserAccounts(accounts)

      saveUserBio({
        user_id: newId,
        username: uname,
        display_name: dname,
        email,
        tagline: 'Visual Creator & Digital Explorer ✨',
        bio: 'Welcome to my official 3D Link-in-Bio profile! Connect with me on my social accounts below.',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
        location: 'Dhaka, Bangladesh',
        layout_style: 'bento',
        theme: 'orange',
      })

      return { success: true, account: matched }
    } else {
      return { success: false, error: 'Password must be at least 4 characters long.' }
    }
  }

  // 6. Verify password
  const computedHash = hashPassword(cleanPass, matched.salt)
  const isPasswordCorrect = computedHash === matched.passwordHash

  if (!isPasswordCorrect) {
    return { success: false, error: 'Incorrect password. Please verify and try again.' }
  }

  matched.updatedAt = new Date().toISOString()
  writeAllUserAccounts(accounts)

  return { success: true, account: matched }
}
