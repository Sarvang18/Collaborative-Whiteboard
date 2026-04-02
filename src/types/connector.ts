export interface ConnectionPoint {
  x: number
  y: number
  side: 'top' | 'right' | 'bottom' | 'left'
  elementId: string
}

export interface Connector {
  id: string
  type: 'connector'
  startElementId: string
  endElementId: string
  startPoint: ConnectionPoint
  endPoint: ConnectionPoint
  path: { x: number; y: number }[]
  stroke: string
  strokeWidth: number
  arrowEnd: boolean
  arrowStart: boolean
}
