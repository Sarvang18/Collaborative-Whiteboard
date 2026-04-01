import { EllipseShapeData } from '../../types/shapes'
import { Viewport } from '../engine/Viewport'
import { BaseShape } from './BaseShape'

export class EllipseShape extends BaseShape {
  constructor(protected data: EllipseShapeData) {
    super(data)
  }

  render(ctx: CanvasRenderingContext2D, viewport: Viewport): void {
    this.applyTransform(ctx, viewport)

    const { width, height, fill, stroke, strokeWidth } = this.data
    const radiusX = width / 2
    const radiusY = height / 2

    ctx.beginPath()
    ctx.ellipse(radiusX, radiusY, radiusX, radiusY, 0, 0, Math.PI * 2)

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
