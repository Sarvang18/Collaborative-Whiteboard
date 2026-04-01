import { useEffect, useRef } from 'react'
import { CanvasEngine } from '../canvas/engine/CanvasEngine'
import { useCanvasStore } from '../store/canvasStore'
import { useUIStore } from '../store/uiStore'
import { HitTester } from '../canvas/engine/HitTester'
import { Point } from '../types/shapes'

type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w' | null

export function useSelection(engine: CanvasEngine | null, canvasRef: React.RefObject<HTMLCanvasElement>) {
  const activeTool = useUIStore((s) => s.activeTool)
  const isDragging = useRef(false)
  const isResizing = useRef(false)
  const isBoxSelecting = useRef(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const boxStart = useRef({ x: 0, y: 0 })
  const elementStartPos = useRef<Map<string, { x: number; y: number; width: number; height: number }>>(new Map())
  const resizeHandle = useRef<ResizeHandle>(null)
  const hitTester = useRef(new HitTester())

  useEffect(() => {
    if (!engine || !canvasRef.current || activeTool !== 'select') return

    const canvas = canvasRef.current

    const getResizeHandle = (worldPos: Point, elementId: string): ResizeHandle => {
      const elements = useCanvasStore.getState().elements
      const element = elements.get(elementId)
      if (!element) return null

      const handleSize = 8 / engine.getViewport().scale
      const { x, y, width, height } = element

      const handles = [
        { type: 'nw' as const, x: x, y: y },
        { type: 'ne' as const, x: x + width, y: y },
        { type: 'sw' as const, x: x, y: y + height },
        { type: 'se' as const, x: x + width, y: y + height },
        { type: 'n' as const, x: x + width / 2, y: y },
        { type: 's' as const, x: x + width / 2, y: y + height },
        { type: 'e' as const, x: x + width, y: y + height / 2 },
        { type: 'w' as const, x: x, y: y + height / 2 },
      ]

      for (const handle of handles) {
        const dx = Math.abs(worldPos.x - handle.x)
        const dy = Math.abs(worldPos.y - handle.y)
        if (dx < handleSize && dy < handleSize) {
          return handle.type
        }
      }

      return null
    }

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0 || e.shiftKey) return

      const rect = canvas.getBoundingClientRect()
      const screenPos = { x: e.clientX - rect.left, y: e.clientY - rect.top }
      const worldPos = engine.getViewport().screenToWorld(screenPos)

      const elements = useCanvasStore.getState().elements
      const selectedIds = useCanvasStore.getState().selectedIds
      const setSelection = useCanvasStore.getState().setSelection

      // Check if clicking on resize handle
      if (selectedIds.size === 1) {
        const selectedId = Array.from(selectedIds)[0]
        const handle = getResizeHandle(worldPos, selectedId)
        if (handle) {
          isResizing.current = true
          resizeHandle.current = handle
          dragStart.current = worldPos
          
          const el = elements.get(selectedId)
          if (el) {
            elementStartPos.current.set(selectedId, { 
              x: el.x, 
              y: el.y, 
              width: el.width, 
              height: el.height 
            })
          }
          return
        }
      }

      // Find clicked element
      const elementsArray = Array.from(elements.values()).reverse()
      const clicked = elementsArray.find(el => hitTester.current.testPoint(el, worldPos))

      if (clicked) {
        if (!selectedIds.has(clicked.id)) {
          setSelection([clicked.id])
        }

        // Double click on text to edit
        if (clicked.type === 'text') {
          const now = Date.now()
          const lastClick = (canvas as any).lastClickTime || 0
          const lastClickId = (canvas as any).lastClickId || null

          if (now - lastClick < 300 && lastClickId === clicked.id) {
            // Double click detected
            const rect = canvas.getBoundingClientRect()
            const screenPos = engine.getViewport().worldToScreen({ x: clicked.x, y: clicked.y })
            
            setTimeout(() => {
              (window as any).openTextEditor?.(
                clicked.id,
                rect.left + screenPos.x,
                rect.top + screenPos.y,
                clicked.width * engine.getViewport().scale,
                clicked.height * engine.getViewport().scale,
                clicked.text || 'Type here...',
                clicked.fontSize
              )
            }, 0)
            return
          }

          (canvas as any).lastClickTime = now
          (canvas as any).lastClickId = clicked.id
        }
        
        isDragging.current = true
        dragStart.current = worldPos
        
        elementStartPos.current.clear()
        const currentSelectedIds = useCanvasStore.getState().selectedIds
        currentSelectedIds.forEach(id => {
          const el = elements.get(id)
          if (el) {
            elementStartPos.current.set(id, { x: el.x, y: el.y, width: el.width, height: el.height })
          }
        })
      } else {
        // Start box selection
        isBoxSelecting.current = true
        boxStart.current = worldPos
        dragStart.current = worldPos
        useCanvasStore.getState().setSelectionBox({
          x: worldPos.x,
          y: worldPos.y,
          width: 0,
          height: 0,
        })
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const screenPos = { x: e.clientX - rect.left, y: e.clientY - rect.top }
      const worldPos = engine.getViewport().screenToWorld(screenPos)

      // Update cursor for resize handles
      if (!isDragging.current && !isResizing.current && !isBoxSelecting.current) {
        const selectedIds = useCanvasStore.getState().selectedIds
        if (selectedIds.size === 1) {
          const selectedId = Array.from(selectedIds)[0]
          const handle = getResizeHandle(worldPos, selectedId)
          
          const cursors: Record<string, string> = {
            'nw': 'nwse-resize',
            'ne': 'nesw-resize',
            'sw': 'nesw-resize',
            'se': 'nwse-resize',
            'n': 'ns-resize',
            's': 'ns-resize',
            'e': 'ew-resize',
            'w': 'ew-resize',
          }
          
          canvas.style.cursor = handle ? cursors[handle] : 'default'
        }
      }

      if (isResizing.current && resizeHandle.current) {
        const selectedIds = useCanvasStore.getState().selectedIds
        const selectedId = Array.from(selectedIds)[0]
        const startState = elementStartPos.current.get(selectedId)
        
        if (startState) {
          const dx = worldPos.x - dragStart.current.x
          const dy = worldPos.y - dragStart.current.y
          const handle = resizeHandle.current
          
          let newX = startState.x
          let newY = startState.y
          let newWidth = startState.width
          let newHeight = startState.height

          if (handle.includes('w')) {
            newX = startState.x + dx
            newWidth = startState.width - dx
          }
          if (handle.includes('e')) {
            newWidth = startState.width + dx
          }
          if (handle.includes('n')) {
            newY = startState.y + dy
            newHeight = startState.height - dy
          }
          if (handle.includes('s')) {
            newHeight = startState.height + dy
          }

          // Minimum size
          if (newWidth < 10) newWidth = 10
          if (newHeight < 10) newHeight = 10

          useCanvasStore.getState().updateElement(selectedId, {
            x: newX,
            y: newY,
            width: newWidth,
            height: newHeight,
          })
        }
      } else if (isDragging.current) {
        const dx = worldPos.x - dragStart.current.x
        const dy = worldPos.y - dragStart.current.y

        const selectedIds = useCanvasStore.getState().selectedIds
        const updateElement = useCanvasStore.getState().updateElement

        selectedIds.forEach(id => {
          const startPos = elementStartPos.current.get(id)
          if (startPos) {
            updateElement(id, {
              x: startPos.x + dx,
              y: startPos.y + dy,
            })
          }
        })
      } else if (isBoxSelecting.current) {
        const width = worldPos.x - boxStart.current.x
        const height = worldPos.y - boxStart.current.y

        useCanvasStore.getState().setSelectionBox({
          x: width < 0 ? worldPos.x : boxStart.current.x,
          y: height < 0 ? worldPos.y : boxStart.current.y,
          width: Math.abs(width),
          height: Math.abs(height),
        })
      }
    }

    const handleMouseUp = () => {
      if (isBoxSelecting.current) {
        const box = useCanvasStore.getState().selectionBox
        if (box) {
          const elements = useCanvasStore.getState().elements
          const selected: string[] = []
          
          elements.forEach((el, id) => {
            if (
              el.x >= box.x &&
              el.y >= box.y &&
              el.x + el.width <= box.x + box.width &&
              el.y + el.height <= box.y + box.height
            ) {
              selected.push(id)
            }
          })
          
          useCanvasStore.getState().setSelection(selected)
        }
        useCanvasStore.getState().setSelectionBox(null)
      }

      isDragging.current = false
      isResizing.current = false
      isBoxSelecting.current = false
      resizeHandle.current = null
      elementStartPos.current.clear()
      canvas.style.cursor = 'default'
    }

    canvas.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [engine, canvasRef, activeTool])
}
