import { Point } from '../../types/shapes'
import { Viewport } from '../engine/Viewport'

export class CursorRenderer {
  render(
    ctx: CanvasRenderingContext2D,
    cursors: Map<string, { cursor: Point | null; color: string; name: string }>,
    viewport: Viewport
  ) {
    cursors.forEach(({ cursor, color, name }) => {
      if (!cursor) return

      const screen = viewport.worldToScreen(cursor)

      // Draw cursor
      ctx.save()
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.moveTo(screen.x, screen.y)
      ctx.lineTo(screen.x + 12, screen.y + 12)
      ctx.lineTo(screen.x + 6, screen.y + 12)
      ctx.lineTo(screen.x, screen.y + 18)
      ctx.closePath()
      ctx.fill()

      // Draw name tag
      ctx.font = '12px sans-serif'
      const textWidth = ctx.measureText(name).width
      ctx.fillStyle = color
      ctx.fillRect(screen.x + 14, screen.y + 14, textWidth + 8, 20)
      ctx.fillStyle = 'white'
      ctx.fillText(name, screen.x + 18, screen.y + 27)
      ctx.restore()
    })
  }
}
