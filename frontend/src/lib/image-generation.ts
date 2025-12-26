/**
 * Image Generation Utilities
 * 
 * Utilities for generating shareable images from numerology data.
 */

export interface ShareableImageData {
  title: string
  subtitle?: string
  numbers?: Array<{ label: string; value: number }>
  quote?: string
  background?: 'space' | 'cosmic' | 'gradient'
}

/**
 * Generate shareable image URL (would integrate with image generation service)
 * For now, returns a data URL or placeholder
 */
export async function generateShareableImage(
  data: ShareableImageData
): Promise<string> {
  // This would typically call a backend service or use canvas API
  // For now, return a placeholder
  
  // In production, you might:
  // 1. Use canvas API to draw the image
  // 2. Call a backend service that generates the image
  // 3. Use a service like Cloudinary or Imgix
  
  return new Promise((resolve) => {
    // Placeholder implementation
    const canvas = document.createElement('canvas')
    canvas.width = 1200
    canvas.height = 630
    
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      resolve('')
      return
    }

    // Draw background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, '#0a1628')
    gradient.addColorStop(1, '#1a2942')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw title
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 48px Playfair Display'
    ctx.textAlign = 'center'
    ctx.fillText(data.title, canvas.width / 2, 200)

    // Draw subtitle if provided
    if (data.subtitle) {
      ctx.font = '24px Inter'
      ctx.fillStyle = '#00d4ff'
      ctx.fillText(data.subtitle, canvas.width / 2, 260)
    }

    // Draw numbers if provided
    if (data.numbers && data.numbers.length > 0) {
      const startX = canvas.width / 2 - (data.numbers.length * 150) / 2
      data.numbers.forEach((num, index) => {
        const x = startX + index * 150
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 72px Inter'
        ctx.textAlign = 'center'
        ctx.fillText(num.value.toString(), x, 400)
        ctx.font = '18px Inter'
        ctx.fillStyle = '#00d4ff'
        ctx.fillText(num.label, x, 440)
      })
    }

    // Draw quote if provided
    if (data.quote) {
      ctx.font = '20px Inter'
      ctx.fillStyle = '#ffffff'
      ctx.textAlign = 'center'
      const words = data.quote.split(' ')
      let line = ''
      let y = 500
      words.forEach((word) => {
        const testLine = line + word + ' '
        const metrics = ctx.measureText(testLine)
        if (metrics.width > canvas.width - 100 && line !== '') {
          ctx.fillText(line, canvas.width / 2, y)
          line = word + ' '
          y += 30
        } else {
          line = testLine
        }
      })
      ctx.fillText(line, canvas.width / 2, y)
    }

    resolve(canvas.toDataURL('image/png'))
  })
}

/**
 * Download shareable image
 */
export async function downloadShareableImage(
  data: ShareableImageData,
  filename = 'numerology-share.png'
) {
  const imageUrl = await generateShareableImage(data)
  const link = document.createElement('a')
  link.href = imageUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

