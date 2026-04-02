import { CanvasElement } from '../../types/shapes'
import { Viewport } from '../engine/Viewport'
import { RectShape } from '../shapes/RectShape'
import { EllipseShape } from '../shapes/EllipseShape'
import { TextShape } from '../shapes/TextShape'
import { PathShape } from '../shapes/PathShape'
import { TriangleShape } from '../shapes/TriangleShape'
import { StarShape } from '../shapes/StarShape'
import { ArrowShape } from '../shapes/ArrowShape'
import { LineShape } from '../shapes/LineShape'
import { ImageShape } from '../shapes/ImageShape'

export class ShapeRenderer {
  render(element: CanvasElement, ctx: CanvasRenderingContext2D, viewport: Viewport) {
    try {
      switch (element.type) {
        case 'rect': {
          const shape = new RectShape(element)
          shape.render(ctx, viewport)
          break
        }
        case 'ellipse': {
          const shape = new EllipseShape(element)
          shape.render(ctx, viewport)
          break
        }
        case 'text': {
          const shape = new TextShape(element)
          shape.render(ctx, viewport)
          break
        }
        case 'path': {
          const shape = new PathShape(element)
          shape.render(ctx, viewport)
          break
        }
        case 'triangle': {
          const shape = new TriangleShape(element)
          shape.render(ctx, viewport)
          break
        }
        case 'star': {
          const shape = new StarShape(element)
          shape.render(ctx, viewport)
          break
        }
        case 'arrow': {
          const shape = new ArrowShape(element)
          shape.render(ctx, viewport)
          break
        }
        case 'line': {
          const shape = new LineShape(element)
          shape.render(ctx, viewport)
          break
        }
        case 'image': {
          const shape = new ImageShape(element)
          shape.render(ctx, viewport)
          break
        }
      }
    } catch (error) {
      console.error('Error rendering shape:', element.type, error)
    }
  }
}
