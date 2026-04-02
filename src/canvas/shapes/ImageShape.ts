import { BaseShape } from './BaseShape'
import { CanvasElement } from '../../types/shapes'
import { Viewport } from '../engine/Viewport'

export class ImageShape extends BaseShape {
  private static imageCache = new Map<string, HTMLImageElement>()

  constructor(data: CanvasElement) {
    super(data)
  }

  render(ctx: CanvasRenderingContext2D, viewport: Viewport): void {
    if (this.data.type !== 'image') return

    const src = this.data.imageData || this.data.src
    if (!src) {
      this.renderPlaceholder(ctx, viewport)
      return
    }

    let image = ImageShape.imageCache.get(src)
    
    if (!image) {
      image = new Image()
      image.src = src
      ImageShape.imageCache.set(src, image)
      
      if (!image.complete) {
        this.renderPlaceholder(ctx, viewport)
        return
      }
    }

    if (!image.complete) {
      this.renderPlaceholder(ctx, viewport)
      return
    }

    this.applyTransform(ctx, viewport)

    try {
      ctx.drawImage(
        image,
        0,
        0,
        this.data.width || image.naturalWidth,
        this.data.height || image.naturalHeight
      )
    } catch (error) {
      console.error('Error rendering image:', error)
      this.renderPlaceholder(ctx, viewport)
    }

    this.restoreTransform(ctx)
  }

  private renderPlaceholder(ctx: CanvasRenderingContext2D, viewport: Viewport): void {
    this.applyTransform(ctx, viewport)

    const width = this.data.width || 100
    const height = this.data.height || 100

    ctx.fillStyle = '#f0f0f0'
    ctx.fillRect(0, 0, width, height)

    ctx.strokeStyle = '#ccc'
    ctx.lineWidth = 2
    ctx.strokeRect(0, 0, width, height)

    ctx.fillStyle = '#999'
    ctx.font = '24px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('🖼️', width / 2, height / 2)

    this.restoreTransform(ctx)
  }
}
