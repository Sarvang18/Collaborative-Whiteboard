import { CanvasElement } from '../types/shapes'
import { nanoid } from 'nanoid'

export interface ImportResult {
  success: boolean
  elements?: CanvasElement[]
  error?: string
}

export class ImportService {
  /**
   * Import JSON board data
   */
  static async importFromJSON(file: File): Promise<ImportResult> {
    try {
      const text = await file.text()
      const data = JSON.parse(text)

      // Validate JSON structure
      if (!data.elements || !Array.isArray(data.elements)) {
        return {
          success: false,
          error: 'Invalid JSON format: missing elements array',
        }
      }

      // Validate and sanitize elements
      const elements: CanvasElement[] = []
      for (const el of data.elements) {
        const validated = this.validateElement(el)
        if (validated) {
          // Generate new IDs to avoid conflicts
          elements.push({ ...validated, id: nanoid() })
        }
      }

      if (elements.length === 0) {
        return {
          success: false,
          error: 'No valid elements found in JSON',
        }
      }

      return {
        success: true,
        elements,
      }
    } catch (error) {
      console.error('JSON import failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to parse JSON',
      }
    }
  }

  /**
   * Import image file (PNG, JPG, etc.)
   */
  static async importImage(file: File): Promise<ImportResult> {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        return {
          success: false,
          error: 'Invalid file type. Please upload an image file.',
        }
      }

      // Read image as data URL
      const dataUrl = await this.readFileAsDataURL(file)

      // Get image dimensions
      const dimensions = await this.getImageDimensions(dataUrl)

      // Create image element
      const imageElement: CanvasElement = {
        id: nanoid(),
        type: 'image',
        x: 100,
        y: 100,
        width: dimensions.width,
        height: dimensions.height,
        imageData: dataUrl,
        opacity: 1,
        rotation: 0,
      }

      return {
        success: true,
        elements: [imageElement],
      }
    } catch (error) {
      console.error('Image import failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to import image',
      }
    }
  }

  /**
   * Import SVG file
   */
  static async importSVG(file: File): Promise<ImportResult> {
    try {
      const text = await file.text()
      const parser = new DOMParser()
      const doc = parser.parseFromString(text, 'image/svg+xml')

      // Check for parsing errors
      const parserError = doc.querySelector('parsererror')
      if (parserError) {
        return {
          success: false,
          error: 'Invalid SVG file',
        }
      }

      // Convert SVG to data URL
      const svgBlob = new Blob([text], { type: 'image/svg+xml' })
      const dataUrl = await this.blobToDataURL(svgBlob)

      // Get SVG dimensions
      const svg = doc.querySelector('svg')
      const width = parseInt(svg?.getAttribute('width') || '500')
      const height = parseInt(svg?.getAttribute('height') || '500')

      // Create image element from SVG
      const imageElement: CanvasElement = {
        id: nanoid(),
        type: 'image',
        x: 100,
        y: 100,
        width,
        height,
        imageData: dataUrl,
        opacity: 1,
        rotation: 0,
      }

      return {
        success: true,
        elements: [imageElement],
      }
    } catch (error) {
      console.error('SVG import failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to import SVG',
      }
    }
  }

  /**
   * Handle file drop/upload
   */
  static async handleFileImport(file: File): Promise<ImportResult> {
    const extension = file.name.split('.').pop()?.toLowerCase()

    switch (extension) {
      case 'json':
        return this.importFromJSON(file)

      case 'svg':
        return this.importSVG(file)

      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'webp':
        return this.importImage(file)

      default:
        return {
          success: false,
          error: `Unsupported file type: .${extension}`,
        }
    }
  }

  /**
   * Validate and sanitize element data
   */
  private static validateElement(el: any): CanvasElement | null {
    try {
      // Required fields
      if (!el.type || typeof el.x !== 'number' || typeof el.y !== 'number') {
        return null
      }

      // Valid types
      const validTypes = [
        'rect',
        'ellipse',
        'triangle',
        'line',
        'arrow',
        'star',
        'path',
        'text',
        'image',
      ]
      if (!validTypes.includes(el.type)) {
        return null
      }

      // Base element
      const validated: any = {
        id: el.id || nanoid(),
        type: el.type,
        x: el.x,
        y: el.y,
        opacity: typeof el.opacity === 'number' ? el.opacity : 1,
        rotation: typeof el.rotation === 'number' ? el.rotation : 0,
      }

      // Width and height with defaults
      validated.width = typeof el.width === 'number' ? el.width : 100
      validated.height = typeof el.height === 'number' ? el.height : 100
      
      if (typeof el.fill === 'string') validated.fill = el.fill
      if (typeof el.stroke === 'string') validated.stroke = el.stroke
      if (typeof el.strokeWidth === 'number') validated.strokeWidth = el.strokeWidth

      // Type-specific fields
      if (el.type === 'text') {
        if (typeof el.text === 'string') validated.text = el.text
        if (typeof el.fontSize === 'number') validated.fontSize = el.fontSize
        if (typeof el.fontFamily === 'string') validated.fontFamily = el.fontFamily
      }

      if (el.type === 'path' && Array.isArray(el.points)) {
        validated.points = el.points.filter(
          (p: any) => typeof p.x === 'number' && typeof p.y === 'number'
        )
      }

      if (el.type === 'image' && typeof el.imageData === 'string') {
        validated.imageData = el.imageData
      }

      return validated as CanvasElement
    } catch (error) {
      console.error('Element validation failed:', error)
      return null
    }
  }

  /**
   * Helper: Read file as data URL
   */
  private static readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  /**
   * Helper: Convert blob to data URL
   */
  private static blobToDataURL(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  /**
   * Helper: Get image dimensions
   */
  private static getImageDimensions(
    dataUrl: string
  ): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        // Scale down large images
        let width = img.width
        let height = img.height
        const maxSize = 800

        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height)
          width *= ratio
          height *= ratio
        }

        resolve({ width, height })
      }
      img.onerror = reject
      img.src = dataUrl
    })
  }
}
