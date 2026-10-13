'use client'

import { useState, useRef, useEffect } from 'react'
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
  Sparkles,
  Camera,
  Image as ImageIcon,
} from 'lucide-react'
import type { GalleryImageData } from '@/lib/content-store'
import { processAndCompressImage, uploadImageFile, formatBytes } from '@/lib/image-compress'

interface UploadForm {
  file: File | null
  title: string
  description: string
  alt_text: string
  category: string
  is_public: boolean
}

function AdminGalleryImage({
  src,
  alt,
  category,
}: {
  src: string
  alt: string
  category: string
}) {
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)

  return (
    <div className="relative aspect-video w-full bg-neutral-900 overflow-hidden">
      {!loaded && !error && (
        <div className="absolute inset-0 bg-white/5 animate-pulse flex items-center justify-center">
          <Loader2 size={16} className="text-white/30 animate-spin" />
        </div>
      )}

      {error ? (
        <div className="absolute inset-0 bg-neutral-950 border border-white/5 flex flex-col items-center justify-center text-white/40 p-3 text-center">
          <Camera size={22} className="text-orange-400 mb-1 opacity-70" />
          <p className="text-xs font-medium text-white/70 line-clamp-1">{alt}</p>
          <span className="text-[10px] text-white/40">Image link unreachable</span>
        </div>
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-orange-400 text-[10px] uppercase font-semibold border border-white/10 z-10">
        {category}
      </span>
    </div>
  )
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
  const [optimizing, setOptimizing] = useState(false)
  const [optimizationInfo, setOptimizationInfo] = useState<{
    original: string
    compressed: string
    savedPercent: number
  } | null>(null)
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number }>({
    width: 800,
    height: 600,
  })

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = e.target.files?.[0]
    if (!rawFile) return

    setOptimizing(true)
    setUploadStatus('idle')
    setOptimizationInfo(null)

    try {
      // Automatic client-side optimization:
      // Downscales large mobile camera photos (max 1600px), prevents memory exhaustion,
      // and converts to web-ready JPEG so it never turns black or fails on any network.
      const result = await processAndCompressImage(rawFile, 1600, 0.82)

      setUploadForm((prev) => ({
        ...prev,
        file: result.file,
        title: prev.title.trim()
          ? prev.title
          : rawFile.name
              .replace(/\.[^.]+$/, '')
              .replace(/[-_]+/g, ' ')
              .replace(/\b\w/g, (c) => c.toUpperCase())
              .slice(0, 40),
      }))

      setPreview(result.previewUrl)
      setImageDimensions({ width: result.width, height: result.height })

      const savedPercent =
        result.originalSize > result.compressedSize
          ? Math.round(((result.originalSize - result.compressedSize) / result.originalSize) * 100)
          : 0

      setOptimizationInfo({
        original: formatBytes(result.originalSize),
        compressed: formatBytes(result.compressedSize),
        savedPercent,
      })
    } catch (err: any) {
      console.warn('Preprocessing fallback:', err)
      setUploadForm((prev) => ({ ...prev, file: rawFile }))
      setPreview(URL.createObjectURL(rawFile))
    } finally {
      setOptimizing(false)
    }
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
      // 1. Upload the optimized photo via universal resilient uploader
      const uploaded = await uploadImageFile(uploadForm.file, {
        maxDimension: 1600,
        quality: 0.82,
        fileName: uploadForm.file.name,
      })

      if (!uploaded.publicUrl) {
        throw new Error('Upload could not generate a valid image URL. Please try again.')
      }

      // 2. Create the gallery record
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: uploadForm.title.trim(),
          category: uploadForm.category || 'Portraits',
          description: uploadForm.description.trim(),
          alt_text: uploadForm.alt_text.trim() || uploadForm.title.trim(),
          public_url: uploaded.publicUrl,
          width: uploaded.width || imageDimensions.width || 800,
          height: uploaded.height || imageDimensions.height || 600,
          is_public: uploadForm.is_public,
        }),
      })

      let data: any = null
      try {
        data = await res.json()
      } catch {
        const rawText = await res.text().catch(() => '')
        throw new Error(rawText || `Server responded with status ${res.status}`)
      }

      if (!res.ok || (!data?.data && !data?.success)) {
        throw new Error(data?.error || 'Failed to save gallery record.')
      }

      const newRecord = data.data || {
        id: String(Date.now()),
        title: uploadForm.title.trim(),
        category: uploadForm.category || 'Portraits',
        description: uploadForm.description.trim(),
        alt_text: uploadForm.alt_text.trim() || uploadForm.title.trim(),
        public_url: uploaded.publicUrl,
        width: uploaded.width || 800,
        height: uploaded.height || 600,
        is_public: uploadForm.is_public,
        slug: 'photo-' + Date.now(),
      }

      setImages((prev) => [newRecord, ...prev])
      setUploadForm({
        file: null,
        title: '',
        description: '',
        alt_text: '',
        category: 'Portraits',
        is_public: true,
      })
      setPreview(null)
      setOptimizationInfo(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      setUploadStatus('success')
      setUploadMessage('Photo uploaded and published live to Visual Diary!')
    } catch (err: any) {
      console.error('Gallery upload error:', err)
      setUploadStatus('error')
      setUploadMessage(err?.message || 'Upload could not be completed. Please try again.')
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
    if (!confirm('Are you sure you want to delete this photo from the Visual Diary?')) return
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
        <Loader2 className="animate-spin mr-3 text-orange-500" size={20} />
        Loading gallery...
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-white text-2xl font-bold font-display">Visual Diary Gallery Manager</h1>
          <p className="text-white/40 mt-1 text-sm">
            Upload and manage public portfolio photos and visual moments. Everything syncs live across all devices.
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
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-white font-semibold text-base flex items-center gap-2">
            <Camera size={18} className="text-orange-400" />
            <span>Upload New Photo (Mobile &amp; Web Optimized)</span>
          </h2>
          <span className="text-[11px] text-white/40">Auto-compress enabled</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* File input / preview */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {optimizing ? (
              <div className="w-full aspect-video rounded-xl glass border border-orange-500/40 flex flex-col items-center justify-center gap-3 text-orange-400 p-4 bg-orange-500/[0.04]">
                <Loader2 size={26} className="animate-spin text-orange-500" />
                <div className="text-center">
                  <p className="text-xs font-semibold text-white">Processing Mobile Photo...</p>
                  <p className="text-[11px] text-white/50 mt-0.5">Optimizing resolution &amp; preparing preview</p>
                </div>
              </div>
            ) : preview ? (
              <div className="space-y-2">
                <div className="relative aspect-video rounded-xl overflow-hidden glass border border-white/10 group bg-neutral-900 shadow-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPreview(null)
                      setOptimizationInfo(null)
                      setUploadForm((p) => ({ ...p, file: null }))
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/75 text-white hover:bg-black transition-all shadow-md"
                    title="Change photo"
                  >
                    <X size={14} />
                  </button>
                </div>

                {optimizationInfo && (
                  <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1.5 text-orange-400 font-medium truncate">
                      <Sparkles size={12} className="flex-shrink-0" />
                      <span>{optimizationInfo.original} → {optimizationInfo.compressed}</span>
                    </span>
                    {optimizationInfo.savedPercent > 0 && (
                      <span className="text-emerald-400 font-semibold flex-shrink-0 ml-1">
                        {optimizationInfo.savedPercent}% lighter ⚡
                      </span>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-video rounded-xl glass border border-dashed border-white/20 hover:border-orange-500/50 flex flex-col items-center justify-center gap-2 text-white/40 hover:text-white transition-all bg-white/[0.01] hover:bg-orange-500/[0.03] group active:scale-[0.98]"
              >
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform">
                  <Upload size={20} />
                </div>
                <div className="text-center">
                  <span className="text-xs font-semibold text-white/80 block">Tap to select photo</span>
                  <span className="text-[10px] text-white/40">Camera, Gallery, JPG, PNG, HEIC</span>
                </div>
              </button>
            )}
          </div>

          {/* Form details */}
          <div className="md:col-span-2 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
                  Photo Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Golden Sunset in Dhaka"
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
                Description / Caption (Optional)
              </label>
              <input
                type="text"
                placeholder="Short story, location, or vibe of this photo"
                value={uploadForm.description}
                onChange={(e) => setUploadForm((p) => ({ ...p, description: e.target.value }))}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <label className="flex items-center gap-2 text-xs text-white/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={uploadForm.is_public}
                  onChange={(e) =>
                    setUploadForm((p) => ({ ...p, is_public: e.target.checked }))
                  }
                  className="rounded bg-white/10 border-white/20 text-orange-500 focus:ring-0"
                />
                <span>Publish immediately to live Visual Diary</span>
              </label>

              <button
                type="submit"
                disabled={uploading || optimizing || !uploadForm.file}
                className="btn-primary text-xs w-full sm:w-auto justify-center disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Uploading to Cloud...</span>
                  </>
                ) : (
                  <>
                    <Plus size={14} />
                    <span>Publish Photo</span>
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
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
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
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold text-sm">
            Live Gallery Photos ({images.length})
          </h2>
          <span className="text-white/40 text-xs">Sorted by newest first</span>
        </div>

        {images.length === 0 ? (
          <div className="p-12 text-center glass rounded-2xl border border-white/10 text-white/40 space-y-2">
            <ImageIcon size={32} className="mx-auto text-white/20" />
            <p className="text-sm font-medium">No photos in Visual Diary yet</p>
            <p className="text-xs text-white/30">Use the form above to upload your first photo from your phone or computer.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((img) => {
              const isEditing = editingId === img.id

              return (
                <div
                  key={img.id}
                  className={`glass gradient-border rounded-2xl overflow-hidden flex flex-col transition-all ${
                    !img.is_public ? 'opacity-40' : 'opacity-100'
                  }`}
                >
                  <AdminGalleryImage
                    src={img.public_url}
                    alt={img.alt_text || img.title}
                    category={img.category}
                  />

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
                          placeholder="Description"
                        />
                        <select
                          value={editForm.category ?? img.category}
                          onChange={(e) => setEditForm((p) => ({ ...p, category: e.target.value }))}
                          className="px-2.5 py-1 rounded-lg glass text-xs text-white w-full bg-[#111]"
                        >
                          <option value="Portraits">Portraits 📸</option>
                          <option value="Travel">Travel ✈️</option>
                          <option value="Lifestyle">Lifestyle ☕</option>
                          <option value="Vibes">Vibes 🌅</option>
                        </select>
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

                    <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-xs">
                      <button
                        type="button"
                        onClick={() => toggleVisibility(img.id, img.is_public)}
                        className={`inline-flex items-center gap-1.5 transition-colors ${
                          img.is_public ? 'text-emerald-400 hover:text-emerald-300' : 'text-white/40 hover:text-white'
                        }`}
                        title={img.is_public ? 'Public on live site' : 'Hidden from live site'}
                      >
                        {img.is_public ? <Eye size={13} /> : <EyeOff size={13} />}
                        <span className="text-[11px]">{img.is_public ? 'Visible' : 'Hidden'}</span>
                      </button>

                      <div className="flex items-center gap-2">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              onClick={() => saveEdit(img.id)}
                              className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400 hover:bg-orange-500/30"
                              title="Save changes"
                            >
                              <Save size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="p-1.5 rounded-lg bg-white/5 text-white/60 hover:bg-white/10"
                              title="Cancel"
                            >
                              <X size={13} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => startEdit(img)}
                              className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5"
                              title="Edit details"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              type="button"
                              disabled={deletingId === img.id}
                              onClick={() => handleDelete(img.id)}
                              className="p-1.5 rounded-lg text-white/50 hover:text-red-400 hover:bg-red-500/10"
                              title="Delete photo"
                            >
                              {deletingId === img.id ? (
                                <Loader2 size={13} className="animate-spin text-red-400" />
                              ) : (
                                <Trash2 size={13} />
                              )}
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
        )}
      </div>
    </div>
  )
}
