import { Point, BoundingBox, CanvasElement } from '../../types/shapes'
import { pointInRect } from '../../utils/geometry'

export class HitTester {
  testPoint(element: CanvasElement, point: Point): boolean {
    const bounds = this.getElementBounds(element)
    return pointInRect(point, bounds)
  }

  getElementBounds(element: CanvasElement): BoundingBox {
    return {
      x: element.x,
      y: element.y,
      width: element.width || 0,
      height: element.height || 0,
    }
  }

  findElementsInBox(elements: CanvasElement[], box: BoundingBox): CanvasElement[] {
    return elements.filter(el => {
      const bounds = this.getElementBounds(el)
      return (
        bounds.x >= box.x &&
        bounds.y >= box.y &&
        bounds.x + bounds.width <= box.x + box.width &&
        bounds.y + bounds.height <= box.y + box.height
      )
    })
  }
}
