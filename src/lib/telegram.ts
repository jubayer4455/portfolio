import { getSiteSettings } from '@/lib/content-store'

interface SendTelegramOptions {
  botToken?: string
  chatId?: string
  parseMode?: 'HTML' | 'Markdown'
}

/**
 * Sends a raw text message to Telegram via Bot API
 */
export async function sendTelegramNotification(
  text: string,
  options?: SendTelegramOptions
): Promise<{ success: boolean; error?: string }> {
  try {
    const settings = await getSiteSettings()

    // Determine bot token and chat ID
    const botToken = (options?.botToken || settings.telegram_bot_token || '').trim()
    const chatId = (options?.chatId || settings.telegram_chat_id || '').trim()

    // If options are not custom test overrides, check if notifications are enabled
    if (!options?.botToken && !settings.telegram_notifications_enabled) {
      return { success: false, error: 'Telegram notifications are disabled in settings.' }
    }

    if (!botToken || !chatId) {
      return {
        success: false,
        error: 'Telegram Bot Token or Chat ID is missing. Please configure them in Bio Settings.',
      }
    }

    const parseMode = options?.parseMode || 'HTML'
    const endpoint = `https://api.telegram.org/bot${botToken}/sendMessage`

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: parseMode,
        disable_web_page_preview: true,
      }),
      // Set reasonable timeout so it doesn't hang background requests
      signal: AbortSignal.timeout(10000),
    })

    const data = await response.json()

    if (!response.ok || !data.ok) {
      const errorMsg = data?.description || `HTTP ${response.status}: Failed to deliver message to Telegram.`
      console.warn('Telegram API delivery error:', errorMsg)
      return { success: false, error: errorMsg }
    }

    return { success: true }
  } catch (err: any) {
    console.error('Telegram notification network error:', err)
    return { success: false, error: err.message || 'Network error connecting to Telegram API.' }
  }
}

/**
 * Sends an instant alert when a contact form is submitted on the website
 */
export async function sendContactTelegramAlert(submission: {
  name: string
  email: string
  subject: string
  message: string
  ip?: string
}): Promise<boolean> {
  const escapeHtml = (str: string) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

  const timeString = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Dhaka',
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  const text = [
    `📬 <b>New Contact Form Submission!</b>`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `👤 <b>Name:</b> ${escapeHtml(submission.name)}`,
    `📧 <b>Email:</b> ${escapeHtml(submission.email)}`,
    `📌 <b>Subject:</b> ${escapeHtml(submission.subject)}`,
    ``,
    `💬 <b>Message:</b>`,
    `<i>${escapeHtml(submission.message)}</i>`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `🌐 <b>IP:</b> ${submission.ip || 'Unknown'}`,
    `⏰ <b>Received:</b> ${timeString} (BST)`,
    `⚡ <i>View full inbox in your Admin Dashboard.</i>`,
  ].join('\n')

  const res = await sendTelegramNotification(text)
  return res.success
}

/**
 * Sends an instant alert when an anonymous secret note is dropped
 */
export async function sendAnonymousNoteTelegramAlert(note: {
  message: string
  emoji: string
}): Promise<boolean> {
  const escapeHtml = (str: string) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

  const timeString = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Dhaka',
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  const text = [
    `🤫 <b>New Secret Anonymous Note!</b>`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `${note.emoji || '💭'} <b>Message:</b>`,
    `<i>${escapeHtml(note.message)}</i>`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `⏰ <b>Received:</b> ${timeString} (BST)`,
    `🔒 <i>Read & moderate in Admin &gt; Anonymous Inbox.</i>`,
  ].join('\n')

  const res = await sendTelegramNotification(text)
  return res.success
}
