import { CanvasElement } from '../types/shapes'
import { Connector } from '../types/connector'

export class PersistenceService {
  private static STORAGE_KEY_PREFIX = 'whiteboard_board_'

  static saveBoardState(boardId: string, elements: Map<string, CanvasElement>, connectors: Map<string, Connector>) {
    try {
      const data = {
        elements: Array.from(elements.values()),
        connectors: Array.from(connectors.values()),
        timestamp: Date.now()
      }
      localStorage.setItem(this.STORAGE_KEY_PREFIX + boardId, JSON.stringify(data))
      console.log(`💾 Saved board ${boardId} to localStorage: ${data.elements.length} elements, ${data.connectors.length} connectors`)
    } catch (error) {
      console.error('Failed to save board state:', error)
    }
  }

  static loadBoardState(boardId: string): { elements: CanvasElement[], connectors: Connector[] } | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY_PREFIX + boardId)
      if (!stored) return null

      const data = JSON.parse(stored)
      console.log(`📂 Loaded board ${boardId} from localStorage: ${data.elements.length} elements, ${data.connectors.length} connectors`)
      
      return {
        elements: data.elements || [],
        connectors: data.connectors || []
      }
    } catch (error) {
      console.error('Failed to load board state:', error)
      return null
    }
  }

  static clearBoardState(boardId: string) {
    try {
      localStorage.removeItem(this.STORAGE_KEY_PREFIX + boardId)
      console.log(`🗑️ Cleared board ${boardId} from localStorage`)
    } catch (error) {
      console.error('Failed to clear board state:', error)
    }
  }

  static getAllBoardIds(): string[] {
    try {
      const keys = Object.keys(localStorage)
      return keys
        .filter(key => key.startsWith(this.STORAGE_KEY_PREFIX))
        .map(key => key.replace(this.STORAGE_KEY_PREFIX, ''))
    } catch (error) {
      console.error('Failed to get board IDs:', error)
      return []
    }
  }
}
