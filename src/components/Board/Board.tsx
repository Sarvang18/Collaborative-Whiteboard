import { useRef, useEffect, useState } from 'react'
import { CanvasEngine } from '../../canvas/engine/CanvasEngine'
import { useCanvasStore } from '../../store/canvasStore'
import { useZoomPan } from '../../hooks/useZoomPan'
import { useDrawTool } from '../../hooks/useDrawTool'
import { useSelection } from '../../hooks/useSelection'
import { useKeyboard } from '../../hooks/useKeyboard'
import { useBoardNavigation } from '../../hooks/useBoardNavigation'
import { Toolbar } from '../Toolbar/Toolbar'
import { LayersPanel } from '../Panels/LayersPanel'
import { PropertiesPanel } from '../Panels/PropertiesPanel'
import { BoardNavigator } from '../BoardNavigator/BoardNavigator'
import { TextEditor } from './TextEditor'

export function Board() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<CanvasEngine | null>(null)
  const [editingText, setEditingText] = useState<{
    id: string
    x: number
    y: number
    width: number
    height: number
    text: string
    fontSize: number
  } | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const engine = new CanvasEngine(canvasRef.current)
    engineRef.current = engine
    engine.resize()

    // Subscribe to store changes
    const unsubscribe = useCanvasStore.subscribe((state) => {
      engine.setElements(state.elements)
      engine.setSelection(state.selectedIds)
    })

    // Initial render
    const state = useCanvasStore.getState()
    engine.setElements(state.elements)
    engine.setSelection(state.selectedIds)

    const handleResize = () => engine.resize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      unsubscribe()
      engine.destroy()
    }
  }, [])

  // Expose text editor trigger
  useEffect(() => {
    (window as any).openTextEditor = (id: string, x: number, y: number, width: number, height: number, text: string, fontSize: number) => {
      setEditingText({ id, x, y, width, height, text, fontSize })
    }
  }, [])

  useZoomPan(engineRef.current, canvasRef)
  useDrawTool(engineRef.current, canvasRef)
  useSelection(engineRef.current, canvasRef)
  useKeyboard()
  useBoardNavigation()

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#f3f4f6' }}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
      {editingText && (
        <TextEditor
          elementId={editingText.id}
          x={editingText.x}
          y={editingText.y}
          width={editingText.width}
          height={editingText.height}
          text={editingText.text}
          fontSize={editingText.fontSize}
          onClose={() => setEditingText(null)}
        />
      )}
      <Toolbar />
      <BoardNavigator />
      <LayersPanel />
      <PropertiesPanel />
    </div>
  )
}
