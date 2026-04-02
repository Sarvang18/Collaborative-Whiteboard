import { PathShapeData } from '../../types/shapes'
import { Viewport } from '../engine/Viewport'
import { BaseShape } from './BaseShape'

export class PathShape extends BaseShape {
  constructor(protected data: PathShapeData) {
    super(data)
  }

  render(ctx: CanvasRenderingContext2D, viewport: Viewport): void {
    if (!this.data.points || this.data.points.length < 2) return

    this.applyTransform(ctx, viewport)

    const { points, stroke, strokeWidth } = this.data

    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)

    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y)
    }

    ctx.strokeStyle = stroke || '#000'
    ctx.lineWidth = strokeWidth || 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()

    this.restoreTransform(ctx)
  }
}
