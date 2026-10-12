'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import {
  Upload,
  Trash2,
  Edit3,
  Save,
  X,
  Loader2,
  Plus,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'
import type { GalleryImageData } from '@/lib/content-store'

interface UploadForm {
  file: File | null
  title: string
  description: string
  alt_text: string
  category: string
  is_public: boolean
}

export default function AdminGalleryPage() {
  const [images, setImages] = useState<GalleryImageData[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadForm, setUploadForm] = useState<UploadForm>({
    file: null,
    title: '',
    description: '',
    alt_text: '',
    category: 'Portraits',
    is_public: true,
  })
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [uploadMessage, setUploadMessage] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<GalleryImageData>>({})
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchImages = async () => {
    try {
      const res = await fetch(`/api/gallery?all=true&_t=${Date.now()}`, {
        cache: 'no-store',
      })
      const json = await res.json()
      if (json.data) {
        setImages(json.data)
      }
    } catch (err) {
      console.error('Failed to load gallery images:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchImages()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadForm((prev) => ({ ...prev, file }))
    const url = URL.createObjectURL(file)
    setPreview(url)
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadForm.file || !uploadForm.title.trim()) {
      setUploadStatus('error')
      setUploadMessage('Please select a photo and enter a title.')
      return
    }

    setUploading(true)
    setUploadStatus('idle')

    try {
      // 1. Upload the image file
      const formData = new FormData()
      formData.append('file', uploadForm.file)
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
      const uploadData = await uploadRes.json()

      if (!uploadRes.ok) {
        setUploadStatus('error')
        setUploadMessage(uploadData.error || 'Upload failed.')
        return
      }

      // 2. Create the gallery record
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: uploadForm.title,
          category: uploadForm.category || 'Photography',
          description: uploadForm.description,
          alt_text: uploadForm.alt_text || uploadForm.title,
          public_url: uploadData.publicUrl,
          is_public: uploadForm.is_public,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setUploadStatus('error')
        setUploadMessage(data.error || 'Failed to save record.')
        return
      }

      setImages((prev) => [data.data, ...prev])
      setUploadForm({
        file: null,
        title: '',
        description: '',
        alt_text: '',
        category: 'Photography',
        is_public: true,
      })
      setPreview(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      setUploadStatus('success')
      setUploadMessage('Photo uploaded and published to the live site!')
    } catch {
      setUploadStatus('error')
      setUploadMessage('An unexpected error occurred during upload.')
    } finally {
      setUploading(false)
    }
  }

  const startEdit = (img: GalleryImageData) => {
    setEditingId(img.id)
    setEditForm({
      title: img.title,
      category: img.category,
      description: img.description || '',
      alt_text: img.alt_text || '',
      is_public: img.is_public,
    })
  }

  const saveEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/gallery/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      if (res.ok) {
        setImages((prev) =>
          prev.map((img) => (img.id === id ? { ...img, ...editForm } : img))
        )
        setEditingId(null)
      }
    } catch (err) {
      console.error('Failed to save edit:', err)
    }
  }

  const toggleVisibility = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/gallery/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_public: !current }),
      })
      if (res.ok) {
        setImages((prev) =>
          prev.map((img) => (img.id === id ? { ...img, is_public: !current } : img))
        )
      }
    } catch (err) {
      console.error('Failed to toggle visibility:', err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setImages((prev) => prev.filter((img) => img.id !== id))
        setUploadStatus('success')
        setUploadMessage('Photo deleted and removed from the live website!')
        setTimeout(() => setUploadStatus('idle'), 4000)
      }
    } catch (err) {
      console.error('Failed to delete image:', err)
    } finally {
      setDeletingId(null)
    }
  }

  const handleClearAll = async () => {
    if (
      !confirm(
        'Are you sure you want to remove ALL photos from the gallery? This will immediately clear the Visual Diary on the live site.'
      )
    )
      return

    setUploading(true)
    try {
      const res = await fetch('/api/gallery', { method: 'DELETE' })
      if (res.ok) {
        setImages([])
        setUploadStatus('success')
        setUploadMessage('All photos removed! The Visual Diary on your live site is now completely empty.')
        setTimeout(() => setUploadStatus('idle'), 4000)
      }
    } catch {
      setUploadStatus('error')
      setUploadMessage('Failed to clear photos.')
    } finally {
      setUploading(false)
    }
  }

  const inputClass =
    'w-full px-4 py-2.5 rounded-xl glass border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-orange-500/60 transition-colors'

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20 text-white/40">
        <Loader2 className="animate-spin mr-3" size={20} />
        Loading gallery...
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-white text-2xl font-bold font-display">Gallery Manager</h1>
          <p className="text-white/40 mt-1">
            Upload and manage public portfolio photos and artworks. Everything syncs to the live site.
          </p>
        </div>
        {images.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            disabled={uploading}
            className="px-3.5 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs font-medium inline-flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <Trash2 size={13} />
            <span>Clear All Photos ({images.length})</span>
          </button>
        )}
      </div>

      {/* Upload Form */}
      <form onSubmit={handleUpload} className="glass gradient-border rounded-2xl p-6 space-y-4">
        <h2 className="text-white font-semibold text-base mb-2">Upload New Photo</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* File input / preview */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            {preview ? (
              <div className="relative aspect-video rounded-xl overflow-hidden glass border border-white/10 group">
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  unoptimized
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPreview(null)
                    setUploadForm((p) => ({ ...p, file: null }))
                  }}
                  className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black/80"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-video rounded-xl glass border border-dashed border-white/20 hover:border-orange-500/50 flex flex-col items-center justify-center gap-2 text-white/40 hover:text-white transition-colors"
              >
                <Upload size={24} className="text-orange-400" />
                <span className="text-xs">Click to browse image</span>
              </button>
            )}
          </div>

          {/* Form details */}
          <div className="md:col-span-2 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sunset in Bali"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm((p) => ({ ...p, title: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
                  Category
                </label>
                <select
                  value={uploadForm.category}
                  onChange={(e) => setUploadForm((p) => ({ ...p, category: e.target.value }))}
                  className={`${inputClass} bg-[#111]`}
                >
                  <option value="Portraits">Portraits 📸</option>
                  <option value="Travel">Travel ✈️</option>
                  <option value="Lifestyle">Lifestyle ☕</option>
                  <option value="Vibes">Vibes 🌅</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
                Description / Caption
              </label>
              <input
                type="text"
                placeholder="Short story or context for this photo"
                value={uploadForm.description}
                onChange={(e) => setUploadForm((p) => ({ ...p, description: e.target.value }))}
                className={inputClass}
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 text-xs text-white/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={uploadForm.is_public}
                  onChange={(e) =>
                    setUploadForm((p) => ({ ...p, is_public: e.target.checked }))
                  }
                  className="rounded bg-white/10 border-white/20 text-orange-500 focus:ring-0"
                />
                Publish immediately to website
              </label>

              <button
                type="submit"
                disabled={uploading}
                className="btn-primary text-xs"
              >
                {uploading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Plus size={14} />
                    Publish Photo
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {uploadStatus !== 'idle' && (
          <div
            className={`flex items-center gap-2 p-3 rounded-xl text-xs ${
              uploadStatus === 'success'
                ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}
          >
            {uploadStatus === 'success' ? (
              <CheckCircle size={14} />
            ) : (
              <AlertCircle size={14} />
            )}
            <span>{uploadMessage}</span>
          </div>
        )}
      </form>

      {/* Images list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((img) => {
          const isEditing = editingId === img.id

          return (
            <div
              key={img.id}
              className={`glass gradient-border rounded-2xl overflow-hidden flex flex-col transition-opacity ${
                !img.is_public ? 'opacity-40' : 'opacity-100'
              }`}
            >
              <div className="relative aspect-video w-full bg-black/40">
                <Image
                  src={img.public_url}
                  alt={img.alt_text || img.title}
                  fill
                  unoptimized
                  className="object-cover"
                />
                <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-orange-400 text-[10px] uppercase font-semibold">
                  {img.category}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editForm.title ?? img.title}
                      onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                      className="px-2.5 py-1 rounded-lg glass text-xs text-white w-full"
                    />
                    <input
                      type="text"
                      value={editForm.description ?? img.description}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, description: e.target.value }))
                      }
                      className="px-2.5 py-1 rounded-lg glass text-xs text-white w-full"
                    />
                  </div>
                ) : (
                  <div>
                    <h3 className="text-white text-sm font-semibold truncate">{img.title}</h3>
                    {img.description && (
                      <p className="text-white/40 text-xs line-clamp-2 mt-1">
                        {img.description}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <span className="text-[11px] text-white/30">
                    {img.is_public ? 'Public' : 'Hidden'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => saveEdit(img.id)}
                          className="p-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/40"
                          title="Save"
                        >
                          <Save size={13} />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1.5 rounded-lg glass text-white/50 hover:text-white"
                          title="Cancel"
                        >
                          <X size={13} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => toggleVisibility(img.id, img.is_public)}
                          className="p-1.5 rounded-lg glass text-white/50 hover:text-white"
                          title={img.is_public ? 'Hide' : 'Make public'}
                        >
                          {img.is_public ? <Eye size={13} /> : <EyeOff size={13} />}
                        </button>
                        <button
                          onClick={() => startEdit(img)}
                          className="p-1.5 rounded-lg glass text-white/50 hover:text-orange-400"
                          title="Edit"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(img.id)}
                          disabled={deletingId === img.id}
                          className="p-1.5 rounded-lg glass text-white/50 hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
