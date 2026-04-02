import { CanvasElement } from '../types/shapes'
import { Connector } from '../types/connector'

export type SharePermission = 'view' | 'edit'

export interface ShareData {
  boardId: string
  boardName: string
  elements: CanvasElement[]
  connectors: Connector[]
  permission: SharePermission
}

export class ShareService {
  private static readonly SERVER_URL = 'http://localhost:3001'

  /**
   * Generate shareable link with server storage
   */
  static async generateShareLink(
    boardId: string,
    boardName: string,
    elements: Map<string, CanvasElement>,
    connectors: Map<string, Connector>,
    permission: SharePermission = 'view'
  ): Promise<string> {
    const shareData = {
      boardId,
      boardName,
      elements: Array.from(elements.values()),
      connectors: Array.from(connectors.values()),
      permission,
    }

    try {
      const response = await fetch(`${this.SERVER_URL}/api/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shareData),
      })

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create share')
      }

      const baseUrl = window.location.origin + window.location.pathname
      return `${baseUrl}?share=${result.shareId}`
    } catch (error) {
      console.error('Failed to generate share link:', error)
      throw error
    }
  }

  /**
   * Load shared board from share ID
   */
  static async loadSharedBoard(): Promise<ShareData | null> {
    try {
      const params = new URLSearchParams(window.location.search)
      const shareId = params.get('share')
      
      if (!shareId) {
        return null
      }

      const response = await fetch(`${this.SERVER_URL}/api/share/${shareId}`)
      const result = await response.json()

      if (!result.success) {
        console.error('Share not found:', result.error)
        return null
      }

      return result.data
    } catch (error) {
      console.error('Failed to load shared board:', error)
      return null
    }
  }

  /**
   * Copy share link to clipboard
   */
  static async copyShareLink(shareLink: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(shareLink)
      return true
    } catch (error) {
      console.error('Failed to copy share link:', error)
      return false
    }
  }

  /**
   * Check if current URL has share parameter
   */
  static hasShareData(): boolean {
    const params = new URLSearchParams(window.location.search)
    return params.has('share')
  }

  /**
   * Get permission from share data
   */
  static getPermissionFromShare(shareData: ShareData): SharePermission {
    return shareData.permission || 'view'
  }

  /**
   * Export share data for manual sharing
   */
  static exportShareData(shareData: ShareData): string {
    return JSON.stringify(shareData)
  }

  /**
   * Import share data from JSON
   */
  static importShareData(jsonData: string): ShareData | null {
    try {
      const data = JSON.parse(jsonData)
      if (!data.elements || !Array.isArray(data.elements)) {
        return null
      }
      return data as ShareData
    } catch (error) {
      console.error('Failed to import share data:', error)
      return null
    }
  }
}
