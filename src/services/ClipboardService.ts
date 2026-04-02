import { CanvasElement } from '../types/shapes'
import { nanoid } from 'nanoid'

export class ClipboardService {
  private static clipboard: CanvasElement[] = []
  private static readonly STORAGE_KEY = 'whiteboard_clipboard'

  /**
   * Copy elements to clipboard
   */
  static copy(elements: CanvasElement[]): void {
    if (elements.length === 0) return

    // Deep clone elements
    this.clipboard = elements.map((el) => ({ ...el }))

    // Also save to localStorage for persistence
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.clipboard))
    } catch (error) {
      console.warn('Failed to save to localStorage:', error)
    }
  }

  /**
   * Cut elements (copy + mark for deletion)
   */
  static cut(elements: CanvasElement[]): void {
    this.copy(elements)
  }

  /**
   * Paste elements with offset
   */
  static paste(offsetX: number = 20, offsetY: number = 20): CanvasElement[] {
    // Try to load from localStorage if clipboard is empty
    if (this.clipboard.length === 0) {
      try {
        const stored = localStorage.getItem(this.STORAGE_KEY)
        if (stored) {
          this.clipboard = JSON.parse(stored)
        }
      } catch (error) {
        console.warn('Failed to load from localStorage:', error)
      }
    }

    if (this.clipboard.length === 0) return []

    // Create new elements with new IDs and offset positions
    return this.clipboard.map((el) => ({
      ...el,
      id: nanoid(),
      x: el.x + offsetX,
      y: el.y + offsetY,
    }))
  }

  /**
   * Duplicate elements (copy + paste in one operation)
   */
  static duplicate(elements: CanvasElement[]): CanvasElement[] {
    if (elements.length === 0) return []

    return elements.map((el) => ({
      ...el,
      id: nanoid(),
      x: el.x + 20,
      y: el.y + 20,
    }))
  }

  /**
   * Check if clipboard has content
   */
  static hasContent(): boolean {
    return this.clipboard.length > 0
  }

  /**
   * Clear clipboard
   */
  static clear(): void {
    this.clipboard = []
    try {
      localStorage.removeItem(this.STORAGE_KEY)
    } catch (error) {
      console.warn('Failed to clear localStorage:', error)
    }
  }

  /**
   * Copy elements to system clipboard (for cross-app paste)
   */
  static async copyToSystemClipboard(elements: CanvasElement[]): Promise<boolean> {
    try {
      const data = JSON.stringify({
        type: 'whiteboard-elements',
        version: '1.0.0',
        elements,
      })

      await navigator.clipboard.writeText(data)
      return true
    } catch (error) {
      console.error('Failed to copy to system clipboard:', error)
      return false
    }
  }

  /**
   * Paste from system clipboard
   */
  static async pasteFromSystemClipboard(): Promise<CanvasElement[]> {
    try {
      const text = await navigator.clipboard.readText()
      const data = JSON.parse(text)

      if (data.type === 'whiteboard-elements' && Array.isArray(data.elements)) {
        return data.elements.map((el: CanvasElement) => ({
          ...el,
          id: nanoid(),
        }))
      }

      return []
    } catch (error) {
      console.error('Failed to paste from system clipboard:', error)
      return []
    }
  }
}
