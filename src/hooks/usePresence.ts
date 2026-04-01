import { useEffect, useCallback } from 'react'
import { CanvasEngine } from '../canvas/engine/CanvasEngine'
import { throttle } from '../utils/throttle'
import { SocketEmitter } from '../services/socket/SocketEmitter'

export function usePresence(
  engine: CanvasEngine | null,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  emitter: SocketEmitter | null
) {
  const emitCursor = useCallback(
    throttle((x: number, y: number) => {
      if (emitter) {
        try {
          emitter.emitCursorMove(x, y)
        } catch (error) {
          // Ignore socket errors in offline mode
        }
      }
    }, 33),
    [emitter]
  )

  useEffect(() => {
    if (!engine || !canvasRef.current) return

    const canvas = canvasRef.current

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const screenPos = { x: e.clientX - rect.left, y: e.clientY - rect.top }
      const worldPos = engine.getViewport().screenToWorld(screenPos)
      emitCursor(worldPos.x, worldPos.y)
    }

    canvas.addEventListener('mousemove', handleMouseMove)
    return () => canvas.removeEventListener('mousemove', handleMouseMove)
  }, [engine, canvasRef, emitCursor])
}
