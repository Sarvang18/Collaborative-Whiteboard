import { BaseShapeData } from '../../types/shapes'
import { Viewport } from '../engine/Viewport'
import { BaseShape } from './BaseShape'

export class TriangleShape extends BaseShape {
  constructor(protected data: BaseShapeData) {
    super(data)
  }

  render(ctx: CanvasRenderingContext2D, viewport: Viewport): void {
    this.applyTransform(ctx, viewport)

    const { width, height, fill, stroke, strokeWidth } = this.data

    ctx.beginPath()
    ctx.moveTo(width / 2, 0)
    ctx.lineTo(width, height)
    ctx.lineTo(0, height)
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
