import { useEffect, useRef } from 'react'
import { CanvasEngine } from '../canvas/engine/CanvasEngine'
import { useConnectorStore } from '../store/connectorStore'
import { useCanvasStore } from '../store/canvasStore'
import { ConnectorService } from '../services/ConnectorService'

export function useConnector(
  engine: CanvasEngine | null,
  canvasRef: React.RefObject<HTMLCanvasElement>
) {
  const isConnectorMode = useConnectorStore((s) => s.isConnectorMode)
  const connectingFrom = useConnectorStore((s) => s.connectingFrom)
  const setConnectingFrom = useConnectorStore((s) => s.setConnectingFrom)
  const addConnector = useConnectorStore((s) => s.addConnector)

  const hoverElement = useRef<string | null>(null)

  useEffect(() => {
    if (!engine || !canvasRef.current || !isConnectorMode) return

    const canvas = canvasRef.current

    const handleMouseMove = (e: MouseEvent) => {
      if (!isConnectorMode) return

      const rect = canvas.getBoundingClientRect()
      const screenPos = { x: e.clientX - rect.left, y: e.clientY - rect.top }
      const worldPos = engine.getViewport().screenToWorld(screenPos)

      const elements = Array.from(useCanvasStore.getState().elements.values())
      const nearConnection = ConnectorService.isNearConnectionPoint(
        worldPos.x,
        worldPos.y,
        elements,
        20
      )

      if (nearConnection) {
        hoverElement.current = nearConnection.element.id
        canvas.style.cursor = 'crosshair'
      } else {
        hoverElement.current = null
        canvas.style.cursor = 'default'
      }
    }

    const handleClick = (e: MouseEvent) => {
      if (!isConnectorMode) return

      const rect = canvas.getBoundingClientRect()
      const screenPos = { x: e.clientX - rect.left, y: e.clientY - rect.top }
      const worldPos = engine.getViewport().screenToWorld(screenPos)

      const elements = Array.from(useCanvasStore.getState().elements.values())
      
      // Check if clicking on existing connector
      const connectors = useConnectorStore.getState().connectors
      for (const [id, connector] of connectors.entries()) {
        if (isPointNearConnector(worldPos, connector)) {
          useConnectorStore.getState().setSelectedConnector(id)
          return
        }
      }
      
      // Clear connector selection
      useConnectorStore.getState().setSelectedConnector(null)
      
      const nearConnection = ConnectorService.isNearConnectionPoint(
        worldPos.x,
        worldPos.y,
        elements,
        20
      )

      if (!nearConnection) return

      if (!connectingFrom) {
        // Start connecting
        setConnectingFrom(nearConnection.element.id)
      } else if (connectingFrom !== nearConnection.element.id) {
        // Complete connection
        const startElement = useCanvasStore.getState().elements.get(connectingFrom)
        const endElement = nearConnection.element

        if (startElement && endElement) {
          const connector = ConnectorService.createConnector(startElement, endElement)
          addConnector(connector)
        }

        setConnectingFrom(null)
      }
    }

    function isPointNearConnector(point: { x: number; y: number }, connector: any): boolean {
      const threshold = 10
      for (let i = 0; i < connector.path.length - 1; i++) {
        const p1 = connector.path[i]
        const p2 = connector.path[i + 1]
        const dist = distanceToLineSegment(point, p1, p2)
        if (dist < threshold) return true
      }
      return false
    }

    function distanceToLineSegment(
      point: { x: number; y: number },
      p1: { x: number; y: number },
      p2: { x: number; y: number }
    ): number {
      const dx = p2.x - p1.x
      const dy = p2.y - p1.y
      const lengthSquared = dx * dx + dy * dy
      
      if (lengthSquared === 0) {
        return Math.sqrt((point.x - p1.x) ** 2 + (point.y - p1.y) ** 2)
      }
      
      let t = ((point.x - p1.x) * dx + (point.y - p1.y) * dy) / lengthSquared
      t = Math.max(0, Math.min(1, t))
      
      const projX = p1.x + t * dx
      const projY = p1.y + t * dy
      
      return Math.sqrt((point.x - projX) ** 2 + (point.y - projY) ** 2)
    }

    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('click', handleClick)

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('click', handleClick)
    }
  }, [engine, canvasRef, isConnectorMode, connectingFrom, setConnectingFrom, addConnector])

  // Update connectors when elements move
  useEffect(() => {
    if (!engine) return

    const unsubscribe = useCanvasStore.subscribe((state) => {
      const connectors = useConnectorStore.getState().connectors

      connectors.forEach((connector) => {
        const startElement = state.elements.get(connector.startElementId)
        const endElement = state.elements.get(connector.endElementId)

        if (startElement && endElement) {
          const updated = ConnectorService.updateConnector(connector, startElement, endElement)
          useConnectorStore.getState().updateConnector(connector.id, updated)
        }
      })
    })

    return unsubscribe
  }, [engine])
}
