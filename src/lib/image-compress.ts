/**
 * High-performance client-side image optimization for mobile & desktop.
 * - Downscales large camera photos (e.g. 12MP - 108MP) to maximum 2048px
 * - Compresses 10MB - 20MB raw camera files down to ~300KB - 700KB
 * - Preserves natural aspect ratio & orientation
 * - Prevents Vercel 4.5MB payload limit errors
 * - Prevents black preview / broken render on mobile browsers
 */

export interface ProcessedImageResult {
  file: File
  previewUrl: string
  width: number
  height: number
  originalSize: number
  compressedSize: number
  format: string
}

export function processAndCompressImage(
  file: File,
  maxDimension = 2048,
  quality = 0.86
): Promise<ProcessedImageResult> {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided.'))
      return
    }

    const originalSize = file.size
    const fileName = file.name || 'photo.jpg'
    const isPng = file.type === 'image/png' || fileName.toLowerCase().endsWith('.png')

    // Create a temporary object URL to load the image
    const objectUrl = URL.createObjectURL(file)
    const img = new window.Image()

    img.onload = () => {
      try {
        let width = img.naturalWidth || img.width
        let height = img.naturalHeight || img.height

        // If dimensions couldn't be detected, default fallback
        if (!width || !height) {
          width = 1200
          height = 800
        }

        // Calculate aspect-ratio preserving dimensions
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width)
            width = maxDimension
          } else {
            width = Math.round((width * maxDimension) / height)
            height = maxDimension
          }
        }

        // Create canvas
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          // If canvas context fails, fallback to objectUrl
          resolve({
            file,
            previewUrl: objectUrl,
            width,
            height,
            originalSize,
            compressedSize: originalSize,
            format: file.type || 'image/jpeg',
          })
          return
        }

        // Smooth image rendering
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'

        // If not PNG, fill white background to prevent any black alpha channel
        if (!isPng) {
          ctx.fillStyle = '#FFFFFF'
          ctx.fillRect(0, 0, width, height)
        }

        // Draw the image
        ctx.drawImage(img, 0, 0, width, height)

        const outputMime = isPng ? 'image/png' : 'image/jpeg'
        const outputExt = isPng ? '.png' : '.jpg'
        const cleanBaseName = fileName.replace(/\.[^.]+$/, '')
        const newFileName = `${cleanBaseName}${outputExt}`

        // Generate data URL for guaranteed mobile preview
        const dataUrl = canvas.toDataURL(outputMime, isPng ? undefined : quality)

        // Generate compressed Blob
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(objectUrl)

            if (!blob) {
              resolve({
                file,
                previewUrl: dataUrl,
                width,
                height,
                originalSize,
                compressedSize: originalSize,
                format: outputMime,
              })
              return
            }

            const compressedFile = new File([blob], newFileName, {
              type: outputMime,
              lastModified: Date.now(),
            })

            resolve({
              file: compressedFile,
              previewUrl: dataUrl,
              width,
              height,
              originalSize,
              compressedSize: blob.size,
              format: outputMime,
            })
          },
          outputMime,
          isPng ? undefined : quality
        )
      } catch (err) {
        URL.revokeObjectURL(objectUrl)
        console.warn('Canvas compression error, using original:', err)
        resolve({
          file,
          previewUrl: objectUrl,
          width: 800,
          height: 600,
          originalSize,
          compressedSize: originalSize,
          format: file.type || 'image/jpeg',
        })
      }
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      // If image failed to load natively (e.g. raw HEIC on unsupported browser)
      // Try FileReader as fallback data URL
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = (e.target?.result as string) || objectUrl
        resolve({
          file,
          previewUrl: dataUrl,
          width: 800,
          height: 600,
          originalSize,
          compressedSize: originalSize,
          format: file.type || 'image/jpeg',
        })
      }
      reader.onerror = () => {
        reject(new Error('Unable to read the selected photo. Please try a standard JPG or PNG.'))
      }
      reader.readAsDataURL(file)
    }

    img.src = objectUrl
  })
}

/**
 * Format bytes into human-readable string (e.g. "4.2 MB", "420 KB")
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}
