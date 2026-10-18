import { NextRequest, NextResponse } from 'next/server'
import { readContentFile, writeContentFile } from '@/lib/content-store'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const content = await readContentFile()
    const settings = content.settings || {}

    return NextResponse.json({
      enabled: settings.poll_enabled ?? true,
      question: settings.poll_question || 'What project or content should I build next? 📊',
      options: settings.poll_options || [
        { id: '1', text: 'More 3D Creative Web Experiments 🚀', votes: 42 },
        { id: '2', text: 'Behind-the-scenes Vlog & Photography 📸', votes: 28 },
        { id: '3', text: 'Interactive Digital Design Tutorials 💡', votes: 35 },
        { id: '4', text: 'Open-Source Next.js Starters & Templates ⚡', votes: 51 },
      ],
    })
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { optionId } = await req.json()
    if (!optionId) {
      return NextResponse.json({ error: 'Option ID required' }, { status: 400 })
    }

    const content = await readContentFile()
    if (!content.settings) content.settings = {} as any

    const defaultOptions = [
      { id: '1', text: 'More 3D Creative Web Experiments 🚀', votes: 42 },
      { id: '2', text: 'Behind-the-scenes Vlog & Photography 📸', votes: 28 },
      { id: '3', text: 'Interactive Digital Design Tutorials 💡', votes: 35 },
      { id: '4', text: 'Open-Source Next.js Starters & Templates ⚡', votes: 51 },
    ]

    const options = content.settings.poll_options || defaultOptions

    const updatedOptions = options.map((opt: any) =>
      opt.id === optionId ? { ...opt, votes: (opt.votes || 0) + 1 } : opt
    )

    content.settings.poll_options = updatedOptions
    await writeContentFile(content)

    return NextResponse.json({ success: true, options: updatedOptions })
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
