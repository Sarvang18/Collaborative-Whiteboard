import { CanvasElement } from '../types/shapes'
import { ConnectionPoint, Connector } from '../types/connector'
import { nanoid } from 'nanoid'

export class ConnectorService {
  /**
   * Get connection points for an element
   */
  static getConnectionPoints(element: CanvasElement): ConnectionPoint[] {
    const width = element.width || 0
    const height = element.height || 0

    return [
      {
        x: element.x + width / 2,
        y: element.y,
        side: 'top',
        elementId: element.id,
      },
      {
        x: element.x + width,
        y: element.y + height / 2,
        side: 'right',
        elementId: element.id,
      },
      {
        x: element.x + width / 2,
        y: element.y + height,
        side: 'bottom',
        elementId: element.id,
      },
      {
        x: element.x,
        y: element.y + height / 2,
        side: 'left',
        elementId: element.id,
      },
    ]
  }

  /**
   * Find nearest connection point to a position
   */
  static findNearestConnectionPoint(
    x: number,
    y: number,
    element: CanvasElement,
    snapDistance: number = 20
  ): ConnectionPoint | null {
    const points = this.getConnectionPoints(element)
    let nearest: ConnectionPoint | null = null
    let minDistance = snapDistance

    for (const point of points) {
      const distance = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2))
      if (distance < minDistance) {
        minDistance = distance
        nearest = point
      }
    }

    return nearest
  }

  /**
   * Create a connector between two elements
   */
  static createConnector(
    startElement: CanvasElement,
    endElement: CanvasElement,
    startSide?: 'top' | 'right' | 'bottom' | 'left',
    endSide?: 'top' | 'right' | 'bottom' | 'left'
  ): Connector {
    const startPoints = this.getConnectionPoints(startElement)
    const endPoints = this.getConnectionPoints(endElement)

    // Auto-select best connection points if not specified
    let startPoint: ConnectionPoint
    let endPoint: ConnectionPoint

    if (startSide) {
      startPoint = startPoints.find((p) => p.side === startSide)!
    } else {
      startPoint = this.findBestStartPoint(startElement, endElement)
    }

    if (endSide) {
      endPoint = endPoints.find((p) => p.side === endSide)!
    } else {
      endPoint = this.findBestEndPoint(startElement, endElement)
    }

    const path = this.calculatePath(startPoint, endPoint, [])

    return {
      id: nanoid(),
      type: 'connector',
      startElementId: startElement.id,
      endElementId: endElement.id,
      startPoint,
      endPoint,
      path,
      stroke: '#1e40af',
      strokeWidth: 2,
      arrowEnd: true,
      arrowStart: false,
    }
  }

  /**
   * Find best start connection point
   */
  private static findBestStartPoint(
    startElement: CanvasElement,
    endElement: CanvasElement
  ): ConnectionPoint {
    const points = this.getConnectionPoints(startElement)
    const endCenter = {
      x: endElement.x + (endElement.width || 0) / 2,
      y: endElement.y + (endElement.height || 0) / 2,
    }

    let bestPoint = points[0]
    let minDistance = Infinity

    for (const point of points) {
      const distance = Math.sqrt(
        Math.pow(point.x - endCenter.x, 2) + Math.pow(point.y - endCenter.y, 2)
      )
      if (distance < minDistance) {
        minDistance = distance
        bestPoint = point
      }
    }

    return bestPoint
  }

  /**
   * Find best end connection point
   */
  private static findBestEndPoint(
    startElement: CanvasElement,
    endElement: CanvasElement
  ): ConnectionPoint {
    const points = this.getConnectionPoints(endElement)
    const startCenter = {
      x: startElement.x + (startElement.width || 0) / 2,
      y: startElement.y + (startElement.height || 0) / 2,
    }

    let bestPoint = points[0]
    let minDistance = Infinity

    for (const point of points) {
      const distance = Math.sqrt(
        Math.pow(point.x - startCenter.x, 2) + Math.pow(point.y - startCenter.y, 2)
      )
      if (distance < minDistance) {
        minDistance = distance
        bestPoint = point
      }
    }

    return bestPoint
  }

  /**
   * Calculate path between two connection points with auto-routing
   */
  static calculatePath(
    start: ConnectionPoint,
    end: ConnectionPoint,
    _obstacles: CanvasElement[]
  ): { x: number; y: number }[] {
    const path: { x: number; y: number }[] = []

    // Start point
    path.push({ x: start.x, y: start.y })

    // Simple orthogonal routing
    const dx = end.x - start.x
    const dy = end.y - start.y

    // Determine routing based on connection sides
    if (start.side === 'right' && end.side === 'left') {
      // Horizontal connection
      const midX = start.x + dx / 2
      path.push({ x: midX, y: start.y })
      path.push({ x: midX, y: end.y })
    } else if (start.side === 'bottom' && end.side === 'top') {
      // Vertical connection
      const midY = start.y + dy / 2
      path.push({ x: start.x, y: midY })
      path.push({ x: end.x, y: midY })
    } else if (start.side === 'right' && end.side === 'top') {
      // Right to top
      path.push({ x: end.x, y: start.y })
    } else if (start.side === 'bottom' && end.side === 'left') {
      // Bottom to left
      path.push({ x: start.x, y: end.y })
    } else if (start.side === 'right' && end.side === 'bottom') {
      // Right to bottom
      path.push({ x: end.x, y: start.y })
    } else if (start.side === 'top' && end.side === 'left') {
      // Top to left
      path.push({ x: start.x, y: end.y })
    } else {
      // Default: L-shaped routing
      if (Math.abs(dx) > Math.abs(dy)) {
        path.push({ x: end.x, y: start.y })
      } else {
        path.push({ x: start.x, y: end.y })
      }
    }

    // End point
    path.push({ x: end.x, y: end.y })

    return path
  }

  /**
   * Update connector when elements move
   */
  static updateConnector(
    connector: Connector,
    startElement: CanvasElement,
    endElement: CanvasElement
  ): Connector {
    const startPoints = this.getConnectionPoints(startElement)
    const endPoints = this.getConnectionPoints(endElement)

    const startPoint = startPoints.find((p) => p.side === connector.startPoint.side)!
    const endPoint = endPoints.find((p) => p.side === connector.endPoint.side)!

    const path = this.calculatePath(startPoint, endPoint, [])

    return {
      ...connector,
      startPoint,
      endPoint,
      path,
    }
  }

  /**
   * Check if a point is near a connection point
   */
  static isNearConnectionPoint(
    x: number,
    y: number,
    elements: CanvasElement[],
    snapDistance: number = 20
  ): { element: CanvasElement; point: ConnectionPoint } | null {
    for (const element of elements) {
      const point = this.findNearestConnectionPoint(x, y, element, snapDistance)
      if (point) {
        return { element, point }
      }
    }
    return null
  }
}
