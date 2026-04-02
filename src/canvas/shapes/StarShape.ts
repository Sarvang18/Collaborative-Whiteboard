import { CanvasElement } from '../../types/shapes'
import { Viewport } from '../engine/Viewport'
import { BaseShape } from './BaseShape'

export class StarShape extends BaseShape {
  constructor(protected data: CanvasElement) {
    super(data)
  }

  render(ctx: CanvasRenderingContext2D, viewport: Viewport): void {
    this.applyTransform(ctx, viewport)

    const { width = 100, height = 100, fill, stroke, strokeWidth } = this.data
    const cx = width / 2
    const cy = height / 2
    const outerRadius = Math.min(width, height) / 2
    const innerRadius = outerRadius * 0.4
    const spikes = 5

    ctx.beginPath()
    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius
      const angle = (Math.PI * i) / spikes - Math.PI / 2
      const x = cx + Math.cos(angle) * radius
      const y = cy + Math.sin(angle) * radius
      
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
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
