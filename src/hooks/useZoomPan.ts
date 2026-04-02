import { useEffect, useRef } from 'react'
import { CanvasEngine } from '../canvas/engine/CanvasEngine'
import { useUIStore } from '../store/uiStore'

export function useZoomPan(engine: CanvasEngine | null, canvasRef: React.RefObject<HTMLCanvasElement>) {
  const activeTool = useUIStore((s) => s.activeTool)
  const isPanning = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (!engine || !canvasRef.current) return

    const canvas = canvasRef.current

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      // Zoom disabled - boards have fixed size
      // const delta = e.deltaY > 0 ? -0.1 : 0.1
      // const rect = canvas.getBoundingClientRect()
      // const focal = { x: e.clientX - rect.left, y: e.clientY - rect.top }
      // 
      // const viewport = engine.getViewport()
      // viewport.zoomAt(focal, delta)
      // engine.setViewport(viewport.x, viewport.y, viewport.scale)
    }

    const handleMouseDown = (e: MouseEvent) => {
      // Pan with middle mouse or pan tool or shift+left click
      if (e.button === 1 || activeTool === 'pan' || (e.button === 0 && e.shiftKey)) {
        e.preventDefault()
        isPanning.current = true
        lastPos.current = { x: e.clientX, y: e.clientY }
        canvas.style.cursor = 'grabbing'
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (isPanning.current) {
        const dx = e.clientX - lastPos.current.x
        const dy = e.clientY - lastPos.current.y
        lastPos.current = { x: e.clientX, y: e.clientY }
        
        const viewport = engine.getViewport()
        viewport.pan(dx, dy)
        engine.setViewport(viewport.x, viewport.y, viewport.scale)
      } else if (activeTool === 'pan') {
        canvas.style.cursor = 'grab'
      } else {
        canvas.style.cursor = 'default'
      }
    }

    const handleMouseUp = () => {
      if (isPanning.current) {
        isPanning.current = false
        canvas.style.cursor = activeTool === 'pan' ? 'grab' : 'default'
      }
    }

    canvas.addEventListener('wheel', handleWheel, { passive: false })
    canvas.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      canvas.removeEventListener('wheel', handleWheel)
      canvas.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [engine, canvasRef, activeTool])
}
