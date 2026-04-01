import { BoundingBox } from '../../types/shapes'
import { Viewport } from '../engine/Viewport'

export class SelectionRenderer {
  render(
    ctx: CanvasRenderingContext2D,
    bounds: BoundingBox,
    viewport: Viewport
  ) {
    const screen = viewport.boxToScreen(bounds)

    ctx.save()
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.strokeRect(screen.x, screen.y, screen.width, screen.height)

    // Draw resize handles
    const handleSize = 8
    const handles = [
      { x: screen.x, y: screen.y }, // nw
      { x: screen.x + screen.width, y: screen.y }, // ne
      { x: screen.x, y: screen.y + screen.height }, // sw
      { x: screen.x + screen.width, y: screen.y + screen.height }, // se
      { x: screen.x + screen.width / 2, y: screen.y }, // n
      { x: screen.x + screen.width / 2, y: screen.y + screen.height }, // s
      { x: screen.x + screen.width, y: screen.y + screen.height / 2 }, // e
      { x: screen.x, y: screen.y + screen.height / 2 }, // w
    ]

    ctx.fillStyle = 'white'
    ctx.strokeStyle = '#3b82f6'
    ctx.setLineDash([])

    handles.forEach((handle) => {
      ctx.fillRect(
        handle.x - handleSize / 2,
        handle.y - handleSize / 2,
        handleSize,
        handleSize
      )
      ctx.strokeRect(
        handle.x - handleSize / 2,
        handle.y - handleSize / 2,
        handleSize,
        handleSize
      )
    })

    ctx.restore()
  }
}
