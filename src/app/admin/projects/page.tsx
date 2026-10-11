'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  Globe,
  Plus,
  ExternalLink,
  Trash2,
  Edit2,
  Check,
  X,
  Sparkles,
  Loader2,
  Star,
  Search,
  MousePointerClick,
  Layers,
  RefreshCw,
  FolderGit2
} from 'lucide-react'
import type { FeaturedProject } from '@/lib/projects-store'

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<FeaturedProject[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingProject, setEditingProject] = useState<FeaturedProject | null>(null)

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    category: 'Website',
    tags: '',
    logo_url: '',
    preview_image: '',
    is_featured: true,
  })

  // Auto-detect logo as user types URL
  const handleUrlChange = (val: string) => {
    let clean = val.trim()
    let autoLogo = formData.logo_url

    if (clean) {
      try {
        if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
          clean = `https://${clean}`
        }
        const host = new URL(clean).hostname.replace(/^www\./, '')
        if (host && (!formData.logo_url || formData.logo_url.includes('google.com/s2/favicons'))) {
          autoLogo = `https://www.google.com/s2/favicons?domain=${host}&sz=128`
        }
      } catch {}
    }

    setFormData((prev) => ({
      ...prev,
      url: val,
      logo_url: autoLogo,
    }))
  }

  const loadProjects = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/projects')
      const json = await res.json()
      if (res.ok && json.data) {
        setProjects(json.data)
      }
    } catch (err) {
      console.error('Failed to load projects:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  const handleOpenAdd = () => {
    setEditingProject(null)
    setFormData({
      title: '',
      url: '',
      description: '',
      category: 'Website',
      tags: 'Next.js, Tailwind, React',
      logo_url: '',
      preview_image: '',
      is_featured: true,
    })
    setShowModal(true)
  }

  const handleOpenEdit = (project: FeaturedProject) => {
    setEditingProject(project)
    setFormData({
      title: project.title,
      url: project.url,
      description: project.description || '',
      category: project.category || 'Website',
      tags: Array.isArray(project.tags) ? project.tags.join(', ') : '',
      logo_url: project.logo_url || '',
      preview_image: project.preview_image || '',
      is_featured: project.is_featured,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.url) return

    setSaving(true)
    try {
      const payload = {
        ...(editingProject ? { id: editingProject.id } : {}),
        title: formData.title.trim(),
        url: formData.url.trim(),
        description: formData.description.trim(),
        category: formData.category.trim(),
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        logo_url: formData.logo_url.trim(),
        preview_image: formData.preview_image.trim(),
        is_featured: formData.is_featured,
      }

      const method = editingProject ? 'PATCH' : 'POST'
      const res = await fetch('/api/admin/projects', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setShowModal(false)
        await loadProjects()
      }
    } catch (err) {
      console.error('Error saving project:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this website showcase project?')) return

    try {
      const res = await fetch(`/api/admin/projects?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== id))
      }
    } catch (err) {
      console.error('Error deleting project:', err)
    }
  }

  const handleToggleFeatured = async (project: FeaturedProject) => {
    try {
      const updated = !project.is_featured
      setProjects((prev) => prev.map((p) => (p.id === project.id ? { ...p, is_featured: updated } : p)))
      await fetch('/api/admin/projects', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: project.id, is_featured: updated }),
      })
    } catch {}
  }

  const filteredProjects = projects.filter((p) => {
    const q = searchTerm.toLowerCase()
    return (
      p.title.toLowerCase().includes(q) ||
      p.url.toLowerCase().includes(q) ||
      (p.category && p.category.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q))
    )
  })

  const totalClicks = projects.reduce((acc, p) => acc + (p.clicks || 0), 0)
  const featuredCount = projects.filter((p) => p.is_featured).length

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-display text-white flex items-center gap-2.5">
            <Globe className="text-orange-500" size={28} />
            <span>Featured Web Projects</span>
          </h1>
          <p className="text-white/40 text-xs md:text-sm mt-1">
            Showcase your previous websites with live links, original brand logos, and click tracking on the main homepage
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="btn-primary text-xs sm:text-sm py-2.5 px-4 rounded-xl flex items-center gap-2 self-start sm:self-auto shadow-lg shadow-orange-500/20"
        >
          <Plus size={16} />
          <span>Add Website Project</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="glass gradient-border rounded-2xl p-4">
          <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
            <FolderGit2 size={14} className="text-orange-400" />
            <span>Total Websites</span>
          </div>
          <p className="text-2xl font-bold font-display text-white">{projects.length}</p>
        </div>

        <div className="glass gradient-border rounded-2xl p-4">
          <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
            <Star size={14} className="text-amber-400" />
            <span>Active on Homepage</span>
          </div>
          <p className="text-2xl font-bold font-display text-amber-400">{featuredCount}</p>
        </div>

        <div className="glass gradient-border rounded-2xl p-4">
          <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
            <MousePointerClick size={14} className="text-emerald-400" />
            <span>Total Outbound Clicks</span>
          </div>
          <p className="text-2xl font-bold font-display text-emerald-400">{totalClicks}</p>
        </div>

        <div className="glass gradient-border rounded-2xl p-4">
          <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
            <Layers size={14} className="text-cyan-400" />
            <span>Categories</span>
          </div>
          <p className="text-2xl font-bold font-display text-cyan-400">
            {new Set(projects.map((p) => p.category)).size}
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search projects by title, URL or tags..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-orange-500/50"
          />
        </div>

        <button
          onClick={loadProjects}
          className="p-2.5 rounded-xl glass border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-all"
          title="Refresh projects"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="p-12 text-center text-white/40 flex items-center justify-center gap-2 text-sm">
          <Loader2 size={18} className="animate-spin text-orange-500" />
          <span>Loading web projects...</span>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="glass gradient-border rounded-3xl p-12 text-center">
          <Globe size={40} className="mx-auto text-white/20 mb-3" />
          <h3 className="text-base font-semibold text-white">No web projects found</h3>
          <p className="text-white/40 text-xs mt-1 mb-4">
            {searchTerm ? 'Try a different search keyword' : 'Add the websites you have previously built to showcase on your portfolio'}
          </p>
          <button onClick={handleOpenAdd} className="btn-primary text-xs py-2 px-4 rounded-xl">
            <Plus size={14} /> Add First Website
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => {
            const domain = (() => {
              try {
                return new URL(project.url).hostname.replace(/^www\./, '')
              } catch {
                return project.url
              }
            })()

            return (
              <div
                key={project.id}
                className="glass gradient-border rounded-2xl p-5 flex flex-col justify-between hover:border-orange-500/40 transition-all duration-300 group shadow-xl relative overflow-hidden"
              >
                <div>
                  {/* Top Bar: Logo, Domain & Featured Toggle */}
                  <div className="flex items-start justify-between gap-3 mb-3.5">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Original Website Logo */}
                      <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 p-2 flex items-center justify-center relative overflow-hidden shrink-0 group-hover:scale-105 transition-transform shadow-md">
                        {project.logo_url ? (
                          <Image
                            src={project.logo_url}
                            alt={`${project.title} logo`}
                            width={32}
                            height={32}
                            className="object-contain"
                            unoptimized
                          />
                        ) : (
                          <Globe size={20} className="text-orange-400" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/10 text-orange-400 block truncate max-w-[170px]">
                          {domain}
                        </span>
                        <h3 className="font-bold text-white text-sm truncate mt-0.5" title={project.title}>
                          {project.title}
                        </h3>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(project)}
                      title={project.is_featured ? 'Active on Homepage' : 'Hidden from Homepage'}
                      className={`p-1.5 rounded-lg border transition-all ${
                        project.is_featured
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                          : 'bg-white/5 border-white/5 text-white/30 hover:text-white'
                      }`}
                    >
                      <Star size={14} className={project.is_featured ? 'fill-amber-400' : ''} />
                    </button>
                  </div>

                  {/* Category Pill */}
                  {project.category && (
                    <span className="inline-block text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-md bg-orange-500/10 border border-orange-500/20 text-orange-400 mb-2">
                      {project.category}
                    </span>
                  )}

                  {/* Description */}
                  <p className="text-white/60 text-xs line-clamp-2 leading-relaxed mb-3">
                    {project.description || 'No description provided.'}
                  </p>

                  {/* Tags */}
                  {project.tags && project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {project.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/5 text-white/50"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Bar: Actions & Stats */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs mt-2">
                  <div className="flex items-center gap-1.5 text-white/40 text-[11px]">
                    <MousePointerClick size={12} className="text-emerald-400" />
                    <span>{project.clicks || 0} visits</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg glass border border-white/10 hover:border-orange-500/40 text-white/70 hover:text-white transition-colors"
                      title="Visit Live Site"
                    >
                      <ExternalLink size={13} />
                    </a>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(project)}
                      className="p-1.5 rounded-lg glass border border-white/10 hover:border-cyan-500/40 text-white/70 hover:text-white transition-colors"
                      title="Edit project"
                    >
                      <Edit2 size={13} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(project.id)}
                      className="p-1.5 rounded-lg glass border border-white/10 hover:border-red-500/40 text-white/70 hover:text-red-400 transition-colors"
                      title="Delete project"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add / Edit Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass gradient-border rounded-3xl p-6 md:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold font-display text-white flex items-center gap-2">
                <Globe size={18} className="text-orange-500" />
                <span>{editingProject ? 'Edit Website Project' : 'Add Previous Website Project'}</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-white/40 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Website URL */}
              <div>
                <label className="block text-white/60 text-xs font-medium mb-1 uppercase tracking-wider">
                  Website Live URL *
                </label>
                <div className="relative">
                  <input
                    type="url"
                    required
                    value={formData.url}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="https://my-previous-site.com"
                    className="w-full px-3.5 py-2.5 rounded-xl glass border border-white/10 text-white text-xs placeholder-white/30 focus:outline-none focus:border-orange-500/50"
                  />
                </div>
                <p className="text-[11px] text-white/40 mt-1">
                  Logo will be automatically fetched from the website domain.
                </p>
              </div>

              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/60 text-xs font-medium mb-1 uppercase tracking-wider">
                    Website Name / Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. NextGen Store"
                    className="w-full px-3.5 py-2.5 rounded-xl glass border border-white/10 text-white text-xs placeholder-white/30 focus:outline-none focus:border-orange-500/50"
                  />
                </div>

                <div>
                  <label className="block text-white/60 text-xs font-medium mb-1 uppercase tracking-wider">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                    placeholder="E-Commerce, Agency, SaaS, Blog"
                    className="w-full px-3.5 py-2.5 rounded-xl glass border border-white/10 text-white text-xs placeholder-white/30 focus:outline-none focus:border-orange-500/50"
                  />
                </div>
              </div>

              {/* Logo Preview & Custom Logo URL */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-white/60 text-xs font-medium uppercase tracking-wider">
                    Website Original Logo
                  </label>
                  {formData.logo_url && (
                    <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                      <Check size={11} /> Logo Detected
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/15 p-2 flex items-center justify-center shrink-0">
                    {formData.logo_url ? (
                      <Image
                        src={formData.logo_url}
                        alt="Logo preview"
                        width={32}
                        height={32}
                        className="object-contain"
                        unoptimized
                      />
                    ) : (
                      <Globe size={20} className="text-white/30" />
                    )}
                  </div>

                  <input
                    type="url"
                    value={formData.logo_url}
                    onChange={(e) => setFormData((p) => ({ ...p, logo_url: e.target.value }))}
                    placeholder="Auto-detected or paste custom logo URL"
                    className="flex-1 px-3.5 py-2.5 rounded-xl glass border border-white/10 text-white text-xs placeholder-white/30 focus:outline-none focus:border-orange-500/50 font-mono"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-white/60 text-xs font-medium mb-1 uppercase tracking-wider">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  placeholder="What is this website about? Key features, purpose, or achievements."
                  className="w-full px-3.5 py-2.5 rounded-xl glass border border-white/10 text-white text-xs placeholder-white/30 focus:outline-none focus:border-orange-500/50 resize-none"
                />
              </div>

              {/* Tech Stack Tags */}
              <div>
                <label className="block text-white/60 text-xs font-medium mb-1 uppercase tracking-wider">
                  Tech Stack Tags (Comma separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData((p) => ({ ...p, tags: e.target.value }))}
                  placeholder="Next.js, Tailwind, React, TypeScript, Stripe"
                  className="w-full px-3.5 py-2.5 rounded-xl glass border border-white/10 text-white text-xs placeholder-white/30 focus:outline-none focus:border-orange-500/50"
                />
              </div>

              {/* Preview Screenshot / Banner Image */}
              <div>
                <label className="block text-white/60 text-xs font-medium mb-1 uppercase tracking-wider">
                  Preview Screenshot URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.preview_image}
                  onChange={(e) => setFormData((p) => ({ ...p, preview_image: e.target.value }))}
                  placeholder="https://images.unsplash.com/... or your screenshot URL"
                  className="w-full px-3.5 py-2.5 rounded-xl glass border border-white/10 text-white text-xs placeholder-white/30 focus:outline-none focus:border-orange-500/50"
                />
              </div>

              {/* Featured Switch */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/10">
                <input
                  type="checkbox"
                  id="featuredToggle"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData((p) => ({ ...p, is_featured: e.target.checked }))}
                  className="w-4 h-4 accent-orange-500 cursor-pointer"
                />
                <label htmlFor="featuredToggle" className="text-xs text-white cursor-pointer select-none">
                  <strong>Showcase on Main Homepage</strong> (Visible in Featured Web Projects section)
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl glass border border-white/10 text-xs text-white/60 hover:text-white transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary text-xs py-2 px-5 rounded-xl flex items-center gap-1.5 shadow-lg shadow-orange-500/20"
                >
                  {saving ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      {editingProject ? 'Update Website' : 'Add Website'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
