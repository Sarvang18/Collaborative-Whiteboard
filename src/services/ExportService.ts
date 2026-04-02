import { CanvasElement } from '../types/shapes'
import { jsPDF } from 'jspdf'

export class ExportService {
  /**
   * Export canvas to PNG with high accuracy
   */
  static async exportToPNG(
    canvas: HTMLCanvasElement,
    filename: string = 'whiteboard.png',
    quality: number = 1.0
  ): Promise<void> {
    try {
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob)
            else reject(new Error('Failed to create blob'))
          },
          'image/png',
          quality
        )
      })

      this.downloadBlob(blob, filename)
    } catch (error) {
      console.error('PNG export failed:', error)
      throw new Error('Failed to export PNG')
    }
  }

  /**
   * Export canvas to high-quality PNG with custom dimensions
   */
  static async exportToHighResPNG(
    elements: Map<string, CanvasElement>,
    filename: string = 'whiteboard.png',
    scale: number = 2
  ): Promise<void> {
    try {
      // Calculate bounding box of all elements
      const bounds = this.calculateBounds(elements)
      if (!bounds) {
        throw new Error('No elements to export')
      }

      // Add padding
      const padding = 50
      const width = (bounds.maxX - bounds.minX + padding * 2) * scale
      const height = (bounds.maxY - bounds.minY + padding * 2) * scale

      // Create offscreen canvas
      const offscreenCanvas = document.createElement('canvas')
      offscreenCanvas.width = width
      offscreenCanvas.height = height
      const ctx = offscreenCanvas.getContext('2d')!

      // Fill white background
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, width, height)

      // Apply transformations
      ctx.scale(scale, scale)
      ctx.translate(-bounds.minX + padding, -bounds.minY + padding)

      // Render all elements
      await this.renderElements(ctx, elements)

      // Export
      const blob = await new Promise<Blob>((resolve, reject) => {
        offscreenCanvas.toBlob(
          (blob) => {
            if (blob) resolve(blob)
            else reject(new Error('Failed to create blob'))
          },
          'image/png',
          1.0
        )
      })

      this.downloadBlob(blob, filename)
    } catch (error) {
      console.error('High-res PNG export failed:', error)
      throw new Error('Failed to export high-resolution PNG')
    }
  }

  /**
   * Export canvas to SVG with vector precision
   */
  static exportToSVG(
    elements: Map<string, CanvasElement>,
    filename: string = 'whiteboard.svg'
  ): void {
    try {
      const bounds = this.calculateBounds(elements)
      if (!bounds) {
        throw new Error('No elements to export')
      }

      const padding = 50
      const width = bounds.maxX - bounds.minX + padding * 2
      const height = bounds.maxY - bounds.minY + padding * 2

      let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="white"/>
  <g transform="translate(${-bounds.minX + padding}, ${-bounds.minY + padding})">`

      // Convert each element to SVG
      elements.forEach((element) => {
        svg += this.elementToSVG(element)
      })

      svg += `
  </g>
</svg>`

      const blob = new Blob([svg], { type: 'image/svg+xml' })
      this.downloadBlob(blob, filename)
    } catch (error) {
      console.error('SVG export failed:', error)
      throw new Error('Failed to export SVG')
    }
  }

  /**
   * Export canvas to PDF
   */
  static async exportToPDF(
    elements: Map<string, CanvasElement>,
    filename: string = 'whiteboard.pdf'
  ): Promise<void> {
    try {
      const bounds = this.calculateBounds(elements)
      if (!bounds) {
        throw new Error('No elements to export')
      }

      const padding = 50
      const width = bounds.maxX - bounds.minX + padding * 2
      const height = bounds.maxY - bounds.minY + padding * 2

      // Create high-res canvas for PDF
      const scale = 2
      const canvas = document.createElement('canvas')
      canvas.width = width * scale
      canvas.height = height * scale
      const ctx = canvas.getContext('2d')!

      // White background
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Render elements
      ctx.scale(scale, scale)
      ctx.translate(-bounds.minX + padding, -bounds.minY + padding)
      await this.renderElements(ctx, elements)

      // Convert to PDF
      const imgData = canvas.toDataURL('image/png', 1.0)
      const pdf = new jsPDF({
        orientation: width > height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [width, height],
      })

      pdf.addImage(imgData, 'PNG', 0, 0, width, height)
      pdf.save(filename)
    } catch (error) {
      console.error('PDF export failed:', error)
      throw new Error('Failed to export PDF')
    }
  }

  /**
   * Export board data to JSON
   */
  static exportToJSON(
    elements: Map<string, CanvasElement>,
    boardName: string = 'Untitled Board',
    filename: string = 'whiteboard.json'
  ): void {
    try {
      const data = {
        version: '1.0.0',
        boardName,
        exportDate: new Date().toISOString(),
        elements: Array.from(elements.values()),
      }

      const json = JSON.stringify(data, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      this.downloadBlob(blob, filename)
    } catch (error) {
      console.error('JSON export failed:', error)
      throw new Error('Failed to export JSON')
    }
  }

  /**
   * Helper: Calculate bounding box of all elements
   */
  private static calculateBounds(elements: Map<string, CanvasElement>) {
    if (elements.size === 0) return null

    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    elements.forEach((el) => {
      const bounds = this.getElementBounds(el)
      minX = Math.min(minX, bounds.minX)
      minY = Math.min(minY, bounds.minY)
      maxX = Math.max(maxX, bounds.maxX)
      maxY = Math.max(maxY, bounds.maxY)
    })

    return { minX, minY, maxX, maxY }
  }

  /**
   * Helper: Get element bounding box
   */
  private static getElementBounds(el: CanvasElement) {
    const width = el.width || 0
    const height = el.height || 0

    return {
      minX: el.x,
      minY: el.y,
      maxX: el.x + width,
      maxY: el.y + height,
    }
  }

  /**
   * Helper: Render elements to canvas context
   */
  private static async renderElements(
    ctx: CanvasRenderingContext2D,
    elements: Map<string, CanvasElement>
  ): Promise<void> {
    for (const element of elements.values()) {
      await this.renderElement(ctx, element)
    }
  }

  /**
   * Helper: Render single element
   */
  private static async renderElement(
    ctx: CanvasRenderingContext2D,
    el: CanvasElement
  ): Promise<void> {
    ctx.save()
    ctx.translate(el.x, el.y)

    if (el.rotation) {
      ctx.rotate((el.rotation * Math.PI) / 180)
    }

    ctx.globalAlpha = el.opacity ?? 1

    // Apply styles
    if (el.fill) ctx.fillStyle = el.fill
    if (el.stroke) ctx.strokeStyle = el.stroke
    ctx.lineWidth = el.strokeWidth ?? 2

    switch (el.type) {
      case 'rect':
        if (el.fill) ctx.fillRect(0, 0, el.width!, el.height!)
        if (el.stroke) ctx.strokeRect(0, 0, el.width!, el.height!)
        break

      case 'ellipse':
        ctx.beginPath()
        ctx.ellipse(
          el.width! / 2,
          el.height! / 2,
          el.width! / 2,
          el.height! / 2,
          0,
          0,
          Math.PI * 2
        )
        if (el.fill) ctx.fill()
        if (el.stroke) ctx.stroke()
        break

      case 'triangle':
        ctx.beginPath()
        ctx.moveTo(el.width! / 2, 0)
        ctx.lineTo(el.width!, el.height!)
        ctx.lineTo(0, el.height!)
        ctx.closePath()
        if (el.fill) ctx.fill()
        if (el.stroke) ctx.stroke()
        break

      case 'line':
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(el.width!, el.height!)
        ctx.stroke()
        break

      case 'arrow':
        this.drawArrow(ctx, 0, 0, el.width!, el.height!)
        break

      case 'star':
        this.drawStar(ctx, el.width! / 2, el.height! / 2, 5, el.width! / 2, el.width! / 4)
        if (el.fill) ctx.fill()
        if (el.stroke) ctx.stroke()
        break

      case 'path':
        if (el.points && el.points.length > 0) {
          ctx.beginPath()
          ctx.moveTo(el.points[0].x, el.points[0].y)
          for (let i = 1; i < el.points.length; i++) {
            ctx.lineTo(el.points[i].x, el.points[i].y)
          }
          ctx.stroke()
        }
        break

      case 'text':
        ctx.font = `${el.fontSize || 16}px ${el.fontFamily || 'Arial'}`
        ctx.fillStyle = el.fill || '#000000'
        ctx.textBaseline = 'top'
        if (el.text) {
          ctx.fillText(el.text, 0, 0)
        }
        break

      case 'image':
        if (el.imageData) {
          const img = await this.loadImage(el.imageData)
          ctx.drawImage(img, 0, 0, el.width!, el.height!)
        }
        break
    }

    ctx.restore()
  }

  /**
   * Helper: Draw arrow
   */
  private static drawArrow(
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): void {
    const headLength = 15
    const angle = Math.atan2(y2 - y1, x2 - x1)

    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(x2, y2)
    ctx.lineTo(
      x2 - headLength * Math.cos(angle - Math.PI / 6),
      y2 - headLength * Math.sin(angle - Math.PI / 6)
    )
    ctx.moveTo(x2, y2)
    ctx.lineTo(
      x2 - headLength * Math.cos(angle + Math.PI / 6),
      y2 - headLength * Math.sin(angle + Math.PI / 6)
    )
    ctx.stroke()
  }

  /**
   * Helper: Draw star
   */
  private static drawStar(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    spikes: number,
    outerRadius: number,
    innerRadius: number
  ): void {
    let rot = (Math.PI / 2) * 3
    let x = cx
    let y = cy
    const step = Math.PI / spikes

    ctx.beginPath()
    ctx.moveTo(cx, cy - outerRadius)

    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius
      y = cy + Math.sin(rot) * outerRadius
      ctx.lineTo(x, y)
      rot += step

      x = cx + Math.cos(rot) * innerRadius
      y = cy + Math.sin(rot) * innerRadius
      ctx.lineTo(x, y)
      rot += step
    }

    ctx.lineTo(cx, cy - outerRadius)
    ctx.closePath()
  }

  /**
   * Helper: Load image from data URL
   */
  private static loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
    })
  }

  /**
   * Helper: Convert element to SVG string
   */
  private static elementToSVG(el: CanvasElement): string {
    const opacity = el.opacity ?? 1
    const fill = el.fill || 'none'
    const stroke = el.stroke || 'none'
    const strokeWidth = el.strokeWidth ?? 2
    const transform = el.rotation
      ? `transform="rotate(${el.rotation} ${el.x + (el.width || 0) / 2} ${el.y + (el.height || 0) / 2})"`
      : ''

    switch (el.type) {
      case 'rect':
        return `\n    <rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" opacity="${opacity}" ${transform}/>`

      case 'ellipse':
        return `\n    <ellipse cx="${el.x + el.width! / 2}" cy="${el.y + el.height! / 2}" rx="${el.width! / 2}" ry="${el.height! / 2}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" opacity="${opacity}" ${transform}/>`

      case 'triangle':
        const points = `${el.x + el.width! / 2},${el.y} ${el.x + el.width!},${el.y + el.height!} ${el.x},${el.y + el.height!}`
        return `\n    <polygon points="${points}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" opacity="${opacity}" ${transform}/>`

      case 'line':
        return `\n    <line x1="${el.x}" y1="${el.y}" x2="${el.x + el.width!}" y2="${el.y + el.height!}" stroke="${stroke}" stroke-width="${strokeWidth}" opacity="${opacity}" ${transform}/>`

      case 'path':
        if (el.points && el.points.length > 0) {
          let d = `M ${el.x + el.points[0].x} ${el.y + el.points[0].y}`
          for (let i = 1; i < el.points.length; i++) {
            d += ` L ${el.x + el.points[i].x} ${el.y + el.points[i].y}`
          }
          return `\n    <path d="${d}" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" opacity="${opacity}" ${transform}/>`
        }
        return ''

      case 'text':
        return `\n    <text x="${el.x}" y="${el.y}" font-size="${el.fontSize || 16}" font-family="${el.fontFamily || 'Arial'}" fill="${fill}" opacity="${opacity}" ${transform}>${el.text || ''}</text>`

      case 'image':
        if (el.imageData) {
          return `\n    <image x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" href="${el.imageData}" opacity="${opacity}" ${transform}/>`
        }
        return ''

      default:
        return ''
    }
  }

  /**
   * Helper: Download blob as file
   */
  private static downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}
