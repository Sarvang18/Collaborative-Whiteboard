import { BaseShapeData } from '../../types/shapes'
import { Viewport } from '../engine/Viewport'
import { BaseShape } from './BaseShape'

export class ArrowShape extends BaseShape {
  constructor(protected data: BaseShapeData) {
    super(data)
  }

  render(ctx: CanvasRenderingContext2D, viewport: Viewport): void {
    this.applyTransform(ctx, viewport)

    const { width, height, fill, stroke, strokeWidth } = this.data
    const headWidth = Math.min(width * 0.3, height)
    const shaftHeight = height * 0.4

    ctx.beginPath()
    // Shaft
    ctx.moveTo(width * 0.3, (height - shaftHeight) / 2)
    ctx.lineTo(width - headWidth, (height - shaftHeight) / 2)
    ctx.lineTo(width - headWidth, 0)
    // Arrow head
    ctx.lineTo(width, height / 2)
    ctx.lineTo(width - headWidth, height)
    ctx.lineTo(width - headWidth, (height + shaftHeight) / 2)
    ctx.lineTo(width * 0.3, (height + shaftHeight) / 2)
    ctx.closePath()

    if (fill) {
      ctx.fillStyle = fill
      ctx.fill()
    }

    if (stroke && strokeWidth) {
      ctx.strokeStyle = stroke
      ctx.lineWidth = strokeWidth
      ctx.stroke()
    }

    this.restoreTransform(ctx)
  }
}
