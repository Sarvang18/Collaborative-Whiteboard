import { Connector } from '../../types/connector'
import { Viewport } from '../engine/Viewport'

export class ConnectorRenderer {
  render(connector: Connector, ctx: CanvasRenderingContext2D, viewport: Viewport, isSelected: boolean = false) {
    ctx.save()

    ctx.strokeStyle = isSelected ? '#2196f3' : connector.stroke
    ctx.lineWidth = isSelected ? connector.strokeWidth + 1 : connector.strokeWidth
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // Draw path
    ctx.beginPath()
    const firstPoint = viewport.worldToScreen(connector.path[0])
    ctx.moveTo(firstPoint.x, firstPoint.y)

    for (let i = 1; i < connector.path.length; i++) {
      const point = viewport.worldToScreen(connector.path[i])
      ctx.lineTo(point.x, point.y)
    }

    ctx.stroke()

    // Draw arrow at end
    if (connector.arrowEnd && connector.path.length >= 2) {
      const lastPoint = connector.path[connector.path.length - 1]
      const secondLastPoint = connector.path[connector.path.length - 2]
      this.drawArrowHead(ctx, secondLastPoint, lastPoint, viewport, isSelected)
    }

    // Draw arrow at start
    if (connector.arrowStart && connector.path.length >= 2) {
      const firstPoint = connector.path[0]
      const secondPoint = connector.path[1]
      this.drawArrowHead(ctx, secondPoint, firstPoint, viewport, isSelected)
    }

    ctx.restore()
  }

  private drawArrowHead(
    ctx: CanvasRenderingContext2D,
    from: { x: number; y: number },
    to: { x: number; y: number },
    viewport: Viewport,
    isSelected: boolean = false
  ) {
    const fromScreen = viewport.worldToScreen(from)
    const toScreen = viewport.worldToScreen(to)

    const angle = Math.atan2(toScreen.y - fromScreen.y, toScreen.x - fromScreen.x)
    const headLength = 12

    ctx.strokeStyle = isSelected ? '#2196f3' : ctx.strokeStyle

    ctx.beginPath()
    ctx.moveTo(toScreen.x, toScreen.y)
    ctx.lineTo(
      toScreen.x - headLength * Math.cos(angle - Math.PI / 6),
      toScreen.y - headLength * Math.sin(angle - Math.PI / 6)
    )
    ctx.moveTo(toScreen.x, toScreen.y)
    ctx.lineTo(
      toScreen.x - headLength * Math.cos(angle + Math.PI / 6),
      toScreen.y - headLength * Math.sin(angle + Math.PI / 6)
    )
    ctx.stroke()
  }

  renderConnectionPoints(
    points: { x: number; y: number }[],
    ctx: CanvasRenderingContext2D,
    viewport: Viewport,
    highlight: boolean = false
  ) {
    ctx.save()

    for (const point of points) {
      const screenPoint = viewport.worldToScreen(point)

      ctx.beginPath()
      ctx.arc(screenPoint.x, screenPoint.y, 4, 0, Math.PI * 2)
      ctx.fillStyle = highlight ? '#2196f3' : '#94a3b8'
      ctx.fill()

      ctx.beginPath()
      ctx.arc(screenPoint.x, screenPoint.y, 4, 0, Math.PI * 2)
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.stroke()
    }

    ctx.restore()
  }
}
