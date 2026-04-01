export interface Layer {
  id: string
  name: string
  visible: boolean
  locked: boolean
  opacity: number
}

export interface ViewportState {
  x: number
  y: number
  scale: number
}

export type ToolType = 'select' | 'rect' | 'ellipse' | 'text' | 'path' | 'pan' | 'triangle' | 'star' | 'arrow' | 'line'
