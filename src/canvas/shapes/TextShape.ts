import { TextShapeData } from '../../types/shapes'
import { Viewport } from '../engine/Viewport'
import { BaseShape } from './BaseShape'

export class TextShape extends BaseShape {
  constructor(protected data: TextShapeData) {
    super(data)
  }

  render(ctx: CanvasRenderingContext2D, viewport: Viewport): void {
    this.applyTransform(ctx, viewport)

    const { text = 'Text', fontSize = 24, fontFamily = 'Arial', textAlign = 'left', fill } = this.data

    ctx.font = `${fontSize}px ${fontFamily}`
    ctx.textAlign = textAlign
    ctx.textBaseline = 'top'
    ctx.fillStyle = fill || '#000'

    ctx.fillText(text, 0, 0)

    this.restoreTransform(ctx)
  }
}
