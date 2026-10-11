import { NextResponse } from 'next/server'
import { getSiteSettings } from '@/lib/content-store'

export const dynamic = 'force-dynamic'

export async function GET() {
  const settings = await getSiteSettings()
  const firstName = settings.first_name || 'Abdul Al'
  const lastName = settings.last_name || 'Jubayer'
  const fullName = `${firstName} ${lastName}`.trim()
  const phone = settings.whatsapp_number || '+8801700000000'
  const email = settings.contact_email || 'hello@jubayer.me'
  const tagline = settings.tagline || 'Visual Creator & Life Storyteller'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const note = settings.quote_or_motto || 'Living passionately, capturing moments, and connecting with inspiring minds.'

  const vcard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${fullName}`,
    `N:${lastName};${firstName};;;`,
    'NICKNAME:AJ',
    `TITLE:${tagline}`,
    `TEL;TYPE=CELL,VOICE,PREF:${phone}`,
    `EMAIL;TYPE=INTERNET,PREF:${email}`,
    `URL;TYPE=WORK:${siteUrl}`,
    `NOTE:${note}`,
    'END:VCARD',
  ].join('\r\n')

  return new NextResponse(vcard, {
    headers: {
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': `attachment; filename="${firstName}_${lastName}.vcf"`,
      'Cache-Control': 'no-cache',
    },
  })
}
