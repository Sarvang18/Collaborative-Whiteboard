import { Point, BoundingBox } from '../../types/shapes'
import { ViewportState } from '../../types/canvas'
import { clamp } from '../../utils/geometry'

export class Viewport {
  public x: number = 0
  public y: number = 0
  public scale: number = 1

  constructor(state?: Partial<ViewportState>) {
    if (state) {
      this.x = state.x ?? 0
      this.y = state.y ?? 0
      this.scale = state.scale ?? 1
    }
  }

  worldToScreen(p: Point): Point {
    return {
      x: p.x * this.scale + this.x,
      y: p.y * this.scale + this.y,
    }
  }

  screenToWorld(p: Point): Point {
    return {
      x: (p.x - this.x) / this.scale,
      y: (p.y - this.y) / this.scale,
    }
  }

  boxToScreen(box: BoundingBox): BoundingBox {
    const topLeft = this.worldToScreen({ x: box.x, y: box.y })
    return {
      x: topLeft.x,
      y: topLeft.y,
      width: box.width * this.scale,
      height: box.height * this.scale,
    }
  }

  zoomAt(focal: Point, delta: number) {
    const worldFocal = this.screenToWorld(focal)
    this.scale = clamp(this.scale * (1 + delta), 0.05, 20)
    this.x = focal.x - worldFocal.x * this.scale
    this.y = focal.y - worldFocal.y * this.scale
  }

  pan(dx: number, dy: number) {
    this.x += dx
    this.y += dy
  }

  getState(): ViewportState {
    return { x: this.x, y: this.y, scale: this.scale }
  }
}
