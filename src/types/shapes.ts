export interface Point {
  x: number
  y: number
}

export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

export type ShapeType = 'rect' | 'ellipse' | 'text' | 'path' | 'image' | 'triangle' | 'star' | 'arrow' | 'line'

export interface BaseShapeData {
  id: string
  type: ShapeType
  x: number
  y: number
  width: number
  height: number
  rotation: number
  layerId: string
  fill?: string
  stroke?: string
  strokeWidth?: number
  opacity?: number
}

export interface RectShapeData extends BaseShapeData {
  type: 'rect'
  cornerRadius?: number
}

export interface EllipseShapeData extends BaseShapeData {
  type: 'ellipse'
}

export interface TextShapeData extends BaseShapeData {
  type: 'text'
  text: string
  fontSize: number
  fontFamily: string
  textAlign: 'left' | 'center' | 'right'
}

export interface PathShapeData extends BaseShapeData {
  type: 'path'
  points: Point[]
}

export interface ImageShapeData extends BaseShapeData {
  type: 'image'
  src: string
}

export type CanvasElement = RectShapeData | EllipseShapeData | TextShapeData | PathShapeData | ImageShapeData
