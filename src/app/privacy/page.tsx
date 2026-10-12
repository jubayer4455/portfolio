import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Shield, Lock, Eye, FileText } from 'lucide-react'
import { getSiteSettings } from '@/lib/content-store'
import Navigation from '@/components/navigation/Navigation'
import Footer from '@/components/footer/Footer'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const fullName = `${settings.first_name} ${settings.last_name}`.trim()
  return {
    title: `Privacy Policy | ${fullName}`,
    description: `Privacy policy and data protection guidelines for ${fullName}'s portfolio website.`,
  }
}

export default async function PrivacyPage() {
  const settings = await getSiteSettings()
  const fullName = `${settings.first_name} ${settings.last_name}`.trim()
  const contactEmail = settings.contact_email || 'hello@jubayer.me'

  return (
    <>
      <Navigation settings={settings} />

      <main className="min-h-screen bg-[#0a0a0a] pt-32 pb-24 text-white">
        <div className="container-max px-4 md:px-8 max-w-4xl mx-auto">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-orange-400 transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>

          {/* Header */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-orange-500/20 text-orange-400 text-xs font-semibold uppercase tracking-wider mb-4">
              <Shield size={14} />
              Privacy &amp; Data Protection
            </div>
            <h1 className="heading-lg text-white mb-4">
              Privacy <span className="text-gradient">Policy</span>
            </h1>
            <p className="text-white/50 text-sm">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          {/* Content sections */}
          <div className="space-y-8 text-white/70 text-sm leading-relaxed">
            <section className="glass gradient-border rounded-2xl p-6 md:p-8 space-y-3">
              <div className="flex items-center gap-3 text-white font-semibold text-base mb-2">
                <Eye size={18} className="text-orange-400" />
                <h2>1. Information We Collect</h2>
              </div>
              <p>
                We only collect information that you knowingly and voluntarily provide to us when submitting the contact form on this portfolio website. This includes your name, email address, subject, and message content.
              </p>
              <p>
                We do not use invasive tracking cookies, third-party advertising trackers, or selling user data to third parties.
              </p>
            </section>

            <section className="glass gradient-border rounded-2xl p-6 md:p-8 space-y-3">
              <div className="flex items-center gap-3 text-white font-semibold text-base mb-2">
                <Lock size={18} className="text-orange-400" />
                <h2>2. How Your Information Is Used</h2>
              </div>
              <p>
                Any personal information provided through the contact form is used strictly to respond to your inquiry, freelance proposal, or creative collaboration request. We retain communication history only for legitimate business correspondence.
              </p>
            </section>

            <section className="glass gradient-border rounded-2xl p-6 md:p-8 space-y-3">
              <div className="flex items-center gap-3 text-white font-semibold text-base mb-2">
                <FileText size={18} className="text-orange-400" />
                <h2>3. Security &amp; Data Storage</h2>
              </div>
              <p>
                We implement industry-standard security protocols to safeguard your messages. Form submissions are transmitted using encrypted HTTPS connections and stored securely with Row Level Security (RLS) policies.
              </p>
            </section>

            <section className="glass gradient-border rounded-2xl p-6 md:p-8 space-y-3">
              <div className="flex items-center gap-3 text-white font-semibold text-base mb-2">
                <Shield size={18} className="text-orange-400" />
                <h2>4. Contact Us</h2>
              </div>
              <p>
                If you have questions about this privacy statement or wish to have your submitted messages removed, feel free to reach out directly at{' '}
                <a href={`mailto:${contactEmail}`} className="text-orange-400 hover:underline">
                  {contactEmail}
                </a>.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer settings={settings} />
    </>
  )
}
