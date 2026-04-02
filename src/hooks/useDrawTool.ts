import { useEffect, useRef } from 'react'
import { CanvasEngine } from '../canvas/engine/CanvasEngine'
import { useCanvasStore } from '../store/canvasStore'
import { useUIStore } from '../store/uiStore'
import { useHistoryStore } from '../store/historyStore'
import { generateId } from '../utils/idgen'
import { CanvasElement } from '../types/shapes'
import { ShapeLibraryService } from '../services/ShapeLibraryService'

export function useDrawTool(engine: CanvasEngine | null, canvasRef: React.RefObject<HTMLCanvasElement>) {
  const activeTool = useUIStore((s) => s.activeTool)
  const pendingShape = useUIStore((s) => s.pendingShape)
  const setPendingShape = useUIStore((s) => s.setPendingShape)
  const isDrawing = useRef(false)
  const startPos = useRef({ x: 0, y: 0 })
  const currentElement = useRef<string | null>(null)
  const pathPoints = useRef<Array<{ x: number; y: number }>>([])

  // Handle pending shape placement
  useEffect(() => {
    if (!engine || !canvasRef.current || !pendingShape) return

    const canvas = canvasRef.current

    const handleShapeClick = (e: MouseEvent) => {
      if (e.button !== 0) return

      const rect = canvas.getBoundingClientRect()
      const screenPos = { x: e.clientX - rect.left, y: e.clientY - rect.top }
      const worldPos = engine.getViewport().screenToWorld(screenPos)

      // Create shape at click position
      const shape = ShapeLibraryService.createShape(pendingShape, worldPos.x, worldPos.y)
      if (shape) {
        useCanvasStore.getState().addElement(shape)
        
        // Save to history
        useHistoryStore.getState().push([{
          type: 'add',
          elementId: shape.id,
          after: shape,
        }])
      }

      // Clear pending shape
      setPendingShape(null)
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPendingShape(null)
      }
    }

    canvas.addEventListener('mousedown', handleShapeClick)
    window.addEventListener('keydown', handleEscape)
    canvas.style.cursor = 'crosshair'

    return () => {
      canvas.removeEventListener('mousedown', handleShapeClick)
      window.removeEventListener('keydown', handleEscape)
      canvas.style.cursor = 'default'
    }
  }, [engine, canvasRef, pendingShape, setPendingShape])

  useEffect(() => {
    if (!engine || !canvasRef.current || activeTool === 'select' || activeTool === 'pan' || pendingShape) return

    const canvas = canvasRef.current

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0 || e.shiftKey) return

      const rect = canvas.getBoundingClientRect()
      const screenPos = { x: e.clientX - rect.left, y: e.clientY - rect.top }
      const worldPos = engine.getViewport().screenToWorld(screenPos)

      isDrawing.current = true
      startPos.current = worldPos
      currentElement.current = generateId()

      // For path tool, initialize points array
      if (activeTool === 'path') {
        pathPoints.current = [{ x: 0, y: 0 }]
      }

      const newElement: CanvasElement = activeTool === 'text' 
        ? {
            id: currentElement.current,
            type: 'text',
            x: worldPos.x,
            y: worldPos.y,
            width: 200,
            height: 50,
            rotation: 0,
            layerId: 'default',
            text: 'Type here...',
            fontSize: 24,
            fontFamily: 'Arial',
            textAlign: 'left',
            fill: '#000',
            opacity: 1,
          }
        : activeTool === 'path'
        ? {
            id: currentElement.current,
            type: 'path',
            x: worldPos.x,
            y: worldPos.y,
            width: 1,
            height: 1,
            rotation: 0,
            layerId: 'default',
            points: [{ x: 0, y: 0 }],
            stroke: '#1e40af',
            strokeWidth: 3,
            opacity: 1,
          }
        : {
            id: currentElement.current,
            type: activeTool as any,
            x: worldPos.x,
            y: worldPos.y,
            width: 1,
            height: 1,
            rotation: 0,
            layerId: 'default',
            fill: '#3b82f6',
            stroke: '#1e40af',
            strokeWidth: 2,
            opacity: 1,
          }

      useCanvasStore.getState().addElement(newElement)
      
      // Save to history
      useHistoryStore.getState().push([{
        type: 'add',
        elementId: currentElement.current,
        after: newElement,
      }])

      // Open text editor for text elements
      if (activeTool === 'text' && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect()
        const screenPos = engine.getViewport().worldToScreen({ x: worldPos.x, y: worldPos.y })
        
        setTimeout(() => {
          (window as any).openTextEditor?.(
            currentElement.current,
            rect.left + screenPos.x,
            rect.top + screenPos.y,
            200,
            50,
            'Type here...',
            24
          )
        }, 0)
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDrawing.current || !currentElement.current) return

      const rect = canvas.getBoundingClientRect()
      const screenPos = { x: e.clientX - rect.left, y: e.clientY - rect.top }
      const worldPos = engine.getViewport().screenToWorld(screenPos)

      if (activeTool === 'path') {
        // Add point to path
        const dx = worldPos.x - startPos.current.x
        const dy = worldPos.y - startPos.current.y
        pathPoints.current.push({ x: dx, y: dy })

        useCanvasStore.getState().updateElement(currentElement.current, {
          points: [...pathPoints.current],
        })
      } else if (activeTool !== 'text') {
        const width = worldPos.x - startPos.current.x
        const height = worldPos.y - startPos.current.y

        useCanvasStore.getState().updateElement(currentElement.current, {
          x: width < 0 ? worldPos.x : startPos.current.x,
          y: height < 0 ? worldPos.y : startPos.current.y,
          width: Math.abs(width),
          height: Math.abs(height),
        })
      }
    }

    const handleMouseUp = () => {
      // Save final state to history for updates
      if (isDrawing.current && currentElement.current && activeTool !== 'text') {
        const element = useCanvasStore.getState().elements.get(currentElement.current)
        if (element) {
          // Update the history entry with final state
          const historyStack = useHistoryStore.getState().undoStack
          if (historyStack.length > 0) {
            const lastEntry = historyStack[historyStack.length - 1]
            if (lastEntry[0]?.elementId === currentElement.current) {
              lastEntry[0].after = element
            }
          }
        }
      }
      
      isDrawing.current = false
      currentElement.current = null
      pathPoints.current = []
    }

    canvas.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [engine, canvasRef, activeTool, pendingShape])
}
