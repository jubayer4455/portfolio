import { NextRequest, NextResponse } from 'next/server'
import { sendTelegramNotification } from '@/lib/telegram'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { botToken, chatId } = body

    const timeString = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Dhaka',
      dateStyle: 'medium',
      timeStyle: 'short',
    })

    const testMessage = [
      `🎉 <b>Telegram Bot Test Successful!</b>`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `Your portfolio notification bot is now connected and operational.`,
      ``,
      `You will receive instant alerts for:`,
      `• 📩 <b>Contact Form Inquiries</b>`,
      `• 🤫 <b>Secret Anonymous Notes</b>`,
      ``,
      `⏰ <b>Test Timestamp:</b> ${timeString} (BST)`,
      `✨ <i>Live bio alerts powered by Antigravity.</i>`,
    ].join('\n')

    const result = await sendTelegramNotification(testMessage, {
      botToken: botToken || undefined,
      chatId: chatId || undefined,
      parseMode: 'HTML',
    })

    if (!result.success) {
      return NextResponse.json(
        {
          error:
            result.error ||
            'Could not send message. Please verify your Bot Token and Chat ID.',
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Test message sent! Check your Telegram app for the notification.',
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to process Telegram test request.' },
      { status: 500 }
    )
  }
}
