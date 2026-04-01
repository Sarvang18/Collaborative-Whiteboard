import { CanvasElement } from '../../types/shapes'
import { Viewport } from '../engine/Viewport'

export abstract class BaseShape {
  constructor(protected data: CanvasElement) {}

  abstract render(ctx: CanvasRenderingContext2D, viewport: Viewport): void

  protected applyTransform(ctx: CanvasRenderingContext2D, viewport: Viewport) {
    const screen = viewport.worldToScreen({ x: this.data.x, y: this.data.y })
    
    ctx.save()
    ctx.translate(screen.x, screen.y)
    ctx.scale(viewport.scale, viewport.scale)
    
    if (this.data.rotation) {
      ctx.rotate((this.data.rotation * Math.PI) / 180)
    }
    
    ctx.globalAlpha = this.data.opacity ?? 1
  }

  protected restoreTransform(ctx: CanvasRenderingContext2D) {
    ctx.restore()
  }
}
