import { CanvasElement } from '../../types/shapes'
import { Viewport } from './Viewport'
import { ShapeRenderer } from '../renderers/ShapeRenderer'
import { SelectionRenderer } from '../renderers/SelectionRenderer'
import { ConnectorRenderer } from '../renderers/ConnectorRenderer'
import { useCanvasStore } from '../../store/canvasStore'
import { useConnectorStore } from '../../store/connectorStore'

export class CanvasEngine {
  private ctx: CanvasRenderingContext2D
  private viewport: Viewport
  private renderer: ShapeRenderer
  private selectionRenderer: SelectionRenderer
  private connectorRenderer: ConnectorRenderer
  private rafId: number | null = null
  private elements = new Map<string, CanvasElement>()
  private selectedIds = new Set<string>()

  constructor(
    private canvas: HTMLCanvasElement,
    viewportState?: { x: number; y: number; scale: number }
  ) {
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Could not get 2D context')
    this.ctx = ctx
    this.viewport = new Viewport(viewportState)
    this.renderer = new ShapeRenderer()
    this.selectionRenderer = new SelectionRenderer()
    this.connectorRenderer = new ConnectorRenderer()
  }

  resize() {
    const dpr = window.devicePixelRatio || 1
    const rect = this.canvas.getBoundingClientRect()
    
    this.canvas.width = rect.width * dpr
    this.canvas.height = rect.height * dpr
    this.ctx.scale(dpr, dpr)
    
    this.scheduleRender()
  }

  setElements(elements: Map<string, CanvasElement>) {
    this.elements = elements
    this.scheduleRender()
  }

  setSelection(selectedIds: Set<string>) {
    this.selectedIds = selectedIds
    this.scheduleRender()
  }

  setViewport(x: number, y: number, scale: number) {
    this.viewport.x = x
    this.viewport.y = y
    this.viewport.scale = scale
    this.scheduleRender()
  }

  getViewport() {
    return this.viewport
  }

  private scheduleRender() {
    if (this.rafId) return
    this.rafId = requestAnimationFrame(() => {
      this.render()
      this.rafId = null
    })
  }

  private render() {
    const rect = this.canvas.getBoundingClientRect()
    this.ctx.clearRect(0, 0, rect.width, rect.height)
    
    // Draw all elements
    for (const element of this.elements.values()) {
      this.renderer.render(element, this.ctx, this.viewport)
    }

    // Draw connectors
    const connectors = useConnectorStore.getState().connectors
    const selectedConnectorId = useConnectorStore.getState().selectedConnectorId
    for (const [id, connector] of connectors.entries()) {
      this.connectorRenderer.render(connector, this.ctx, this.viewport, id === selectedConnectorId)
    }

    // Draw selection box (for area selection)
    const selectionBox = useCanvasStore.getState().selectionBox
    if (selectionBox) {
      const screen = this.viewport.boxToScreen(selectionBox)
      this.ctx.save()
      this.ctx.strokeStyle = '#3b82f6'
      this.ctx.lineWidth = 1
      this.ctx.setLineDash([5, 5])
      this.ctx.strokeRect(screen.x, screen.y, screen.width, screen.height)
      this.ctx.fillStyle = 'rgba(59, 130, 246, 0.1)'
      this.ctx.fillRect(screen.x, screen.y, screen.width, screen.height)
      this.ctx.restore()
    }

    // Draw selection boxes for selected elements
    for (const id of this.selectedIds) {
      const element = this.elements.get(id)
      if (element) {
        const bounds = {
          x: element.x,
          y: element.y,
          width: element.width || 0,
          height: element.height || 0,
        }
        this.selectionRenderer.render(this.ctx, bounds, this.viewport)
      }
    }
  }

  destroy() {
    if (this.rafId) cancelAnimationFrame(this.rafId)
  }
}
