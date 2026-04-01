import { BaseShapeData } from '../../types/shapes'
import { Viewport } from '../engine/Viewport'
import { BaseShape } from './BaseShape'

export class LineShape extends BaseShape {
  constructor(protected data: BaseShapeData) {
    super(data)
  }

  render(ctx: CanvasRenderingContext2D, viewport: Viewport): void {
    this.applyTransform(ctx, viewport)

    const { width, height, stroke, strokeWidth } = this.data

    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(width, height)

    ctx.strokeStyle = stroke || '#1e40af'
    ctx.lineWidth = strokeWidth || 2
    ctx.lineCap = 'round'
    ctx.stroke()

    this.restoreTransform(ctx)
  }
}
