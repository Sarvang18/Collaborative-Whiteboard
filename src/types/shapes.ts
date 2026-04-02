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
  width?: number
  height?: number
  rotation?: number
  layerId?: string
  fill?: string
  stroke?: string
  strokeWidth?: number
  opacity?: number
}

export interface RectShapeData extends BaseShapeData {
  type: 'rect'
  cornerRadius?: number
  width: number
  height: number
}

export interface EllipseShapeData extends BaseShapeData {
  type: 'ellipse'
  width: number
  height: number
}

export interface TextShapeData extends BaseShapeData {
  type: 'text'
  text?: string
  fontSize?: number
  fontFamily?: string
  textAlign?: 'left' | 'center' | 'right'
  width: number
  height: number
}

export interface PathShapeData extends BaseShapeData {
  type: 'path'
  points?: Point[]
}

export interface ImageShapeData extends BaseShapeData {
  type: 'image'
  imageData?: string
  src?: string
  width: number
  height: number
}

export interface TriangleShapeData extends BaseShapeData {
  type: 'triangle'
  width: number
  height: number
}

export interface StarShapeData extends BaseShapeData {
  type: 'star'
  width: number
  height: number
}

export interface ArrowShapeData extends BaseShapeData {
  type: 'arrow'
  width: number
  height: number
}

export interface LineShapeData extends BaseShapeData {
  type: 'line'
  width: number
  height: number
}

export type CanvasElement = 
  | RectShapeData 
  | EllipseShapeData 
  | TextShapeData 
  | PathShapeData 
  | ImageShapeData
  | TriangleShapeData
  | StarShapeData
  | ArrowShapeData
  | LineShapeData
