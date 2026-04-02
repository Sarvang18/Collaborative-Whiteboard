import { useRef, useEffect, useState } from 'react'
import { CanvasEngine } from '../../canvas/engine/CanvasEngine'
import { useCanvasStore } from '../../store/canvasStore'
import { useConnectorStore } from '../../store/connectorStore'
import { useUIStore } from '../../store/uiStore'
import { useZoomPan } from '../../hooks/useZoomPan'
import { useDrawTool } from '../../hooks/useDrawTool'
import { useSelection } from '../../hooks/useSelection'
import { useKeyboard } from '../../hooks/useKeyboard'
import { useBoardNavigation } from '../../hooks/useBoardNavigation'
import { useConnector } from '../../hooks/useConnector'
import { Toolbar } from '../Toolbar/Toolbar'
import { LayersPanel } from '../Panels/LayersPanel'
import { PropertiesPanel } from '../Panels/PropertiesPanel'
import { BoardNavigator } from '../BoardNavigator/BoardNavigator'
import { TextEditor } from './TextEditor'
import { ExportMenu } from '../ExportImport/ExportMenu'
import { ImportButton } from '../ExportImport/ImportButton'
import { ShareMenu } from '../ExportImport/ShareMenu'
import { TemplatesPanel } from '../Templates/TemplatesPanel'
import { ShapeLibraryPanel } from '../ShapeLibrary/ShapeLibraryPanel'
import { ShareService } from '../../services/ShareService'

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

  const addElement = useCanvasStore((s) => s.addElement)
  const addConnector = useConnectorStore((s) => s.addConnector)
  const setReadOnly = useUIStore((s) => s.setReadOnly)
  const isReadOnly = useUIStore((s) => s.isReadOnly)
  const updateElement = useCanvasStore((s) => s.updateElement)
  const deleteElements = useCanvasStore((s) => s.deleteElements)
  const updateConnector = useConnectorStore((s) => s.updateConnector)
  const deleteConnector = useConnectorStore((s) => s.deleteConnector)

  const [shareId, setShareId] = useState<string | null>(null)
  const socketRef = useRef<any>(null)
  const isReceivingUpdate = useRef(false)
  const boardId = useCanvasStore((s) => s.boardId)
  const unsubscribeRef = useRef<(() => void)[]>([])

  // Check for shared board on mount
  useEffect(() => {
    const loadSharedBoard = async () => {
      if (ShareService.hasShareData()) {
        const shareData = await ShareService.loadSharedBoard()
        if (shareData) {
          const permission = ShareService.getPermissionFromShare(shareData)
          
          const originalBoardId = shareData.boardId
          setShareId(originalBoardId)
          
          console.log('Loading shared board, original boardId:', originalBoardId)
          
          // Block ALL broadcasts during initial load
          isReceivingUpdate.current = true
          
          setReadOnly(false)
          
          useCanvasStore.getState().clearBoard()
          useConnectorStore.getState().clearConnectors()
          
          shareData.elements.forEach((element) => {
            addElement(element)
          })

          if (shareData.connectors) {
            shareData.connectors.forEach((connector) => {
              addConnector(connector)
            })
          }

          // Unblock broadcasts after load completes
          setTimeout(() => {
            isReceivingUpdate.current = false
            console.log('✅ Initial load complete, broadcasts enabled')
          }, 1000)

          if (permission === 'view') {
            setReadOnly(true)
            alert(`📖 Viewing shared board: ${shareData.boardName}\n\n⚠️ READ-ONLY MODE`)
          } else {
            setReadOnly(false)
            alert(`✏️ Editing shared board: ${shareData.boardName}\n\n🔄 Real-time collaboration enabled!`)
          }
        } else {
          alert('Failed to load shared board.')
        }
      }
    }

    loadSharedBoard()
  }, [addElement, addConnector, setReadOnly])

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
  useConnector(engineRef.current, canvasRef)

  // Real-time collaboration for shared boards
  useEffect(() => {
    const roomId = shareId || boardId
    
    if (!roomId) return

    console.log('🔌 Connecting to room:', roomId)

    // Connect to socket immediately
    import('socket.io-client').then(({ io }) => {
      const socket = io('http://localhost:3001', {
        query: { 
          boardId: roomId,
          userId: `user-${Date.now()}`
        }
      })

      socket.on('connect', () => {
        console.log('✅ Socket connected for room:', roomId)
        socketRef.current = socket

        // Set up broadcast listeners immediately after connection
        const unsub1 = useCanvasStore.subscribe((state, prevState) => {
          if (isReceivingUpdate.current) return

          state.elements.forEach((element, id) => {
            if (!prevState.elements.has(id)) {
              console.log('🔴 Broadcasting element:add', element.id)
              socket.emit('element:add', element)
            }
          })

          prevState.elements.forEach((_, id) => {
            if (!state.elements.has(id)) {
              console.log('🔴 Broadcasting element:delete', id)
              socket.emit('element:delete', [id])
            }
          })

          state.elements.forEach((element, id) => {
            const prev = prevState.elements.get(id)
            if (prev && JSON.stringify(prev) !== JSON.stringify(element)) {
              console.log('🔴 Broadcasting element:update', id)
              socket.emit('element:update', { id, patch: element })
            }
          })
        })
        
        const unsub2 = useConnectorStore.subscribe((state, prevState) => {
          if (isReceivingUpdate.current) return

          state.connectors.forEach((connector, id) => {
            if (!prevState.connectors.has(id)) {
              console.log('🔴 Broadcasting connector:add', connector.id)
              socket.emit('connector:add', connector)
            }
          })

          prevState.connectors.forEach((_, id) => {
            if (!state.connectors.has(id)) {
              console.log('🔴 Broadcasting connector:delete', id)
              socket.emit('connector:delete', id)
            }
          })

          state.connectors.forEach((connector, id) => {
            const prev = prevState.connectors.get(id)
            if (prev && JSON.stringify(prev) !== JSON.stringify(connector)) {
              console.log('🔴 Broadcasting connector:update', id)
              socket.emit('connector:update', { id, connector })
            }
          })
        })
        
        unsubscribeRef.current = [unsub1, unsub2]
      })

      // Listen for element changes from other users
      socket.on('element:add', (element: any) => {
        console.log('🟢 Received element:add', element.id)
        isReceivingUpdate.current = true
        
        const exists = useCanvasStore.getState().elements.has(element.id)
        if (!exists) {
          const wasReadOnly = useUIStore.getState().isReadOnly
          useUIStore.getState().setReadOnly(false)
          addElement(element)
          useUIStore.getState().setReadOnly(wasReadOnly)
        }
        
        setTimeout(() => { isReceivingUpdate.current = false }, 50)
      })

      socket.on('element:update', ({ id, patch }: any) => {
        console.log('🟢 Received element:update', id)
        isReceivingUpdate.current = true
        
        const wasReadOnly = useUIStore.getState().isReadOnly
        useUIStore.getState().setReadOnly(false)
        updateElement(id, patch)
        useUIStore.getState().setReadOnly(wasReadOnly)
        
        setTimeout(() => { isReceivingUpdate.current = false }, 50)
      })

      socket.on('element:delete', (ids: string[]) => {
        console.log('🟢 Received element:delete', ids)
        isReceivingUpdate.current = true
        
        const wasReadOnly = useUIStore.getState().isReadOnly
        useUIStore.getState().setReadOnly(false)
        deleteElements(ids)
        useUIStore.getState().setReadOnly(wasReadOnly)
        
        setTimeout(() => { isReceivingUpdate.current = false }, 50)
      })

      socket.on('connector:add', (connector: any) => {
        console.log('🟢 Received connector:add', connector.id)
        isReceivingUpdate.current = true
        
        const exists = useConnectorStore.getState().connectors.has(connector.id)
        if (!exists) {
          const wasReadOnly = useUIStore.getState().isReadOnly
          useUIStore.getState().setReadOnly(false)
          addConnector(connector)
          useUIStore.getState().setReadOnly(wasReadOnly)
        }
        
        setTimeout(() => { isReceivingUpdate.current = false }, 50)
      })

      socket.on('connector:update', ({ id, connector }: any) => {
        console.log('🟢 Received connector:update', id)
        isReceivingUpdate.current = true
        
        const wasReadOnly = useUIStore.getState().isReadOnly
        useUIStore.getState().setReadOnly(false)
        updateConnector(id, connector)
        useUIStore.getState().setReadOnly(wasReadOnly)
        
        setTimeout(() => { isReceivingUpdate.current = false }, 50)
      })

      socket.on('connector:delete', (id: string) => {
        console.log('🟢 Received connector:delete', id)
        isReceivingUpdate.current = true
        
        const wasReadOnly = useUIStore.getState().isReadOnly
        useUIStore.getState().setReadOnly(false)
        deleteConnector(id)
        useUIStore.getState().setReadOnly(wasReadOnly)
        
        setTimeout(() => { isReceivingUpdate.current = false }, 50)
      })

      socketRef.current = socket
    })

    return () => {
      unsubscribeRef.current.forEach(fn => fn())
      unsubscribeRef.current = []
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [shareId, boardId, addElement, updateElement, deleteElements, addConnector, updateConnector, deleteConnector])

  // Remove the separate broadcast effects - they're now inside the socket connection

  // Handle drag and drop for images
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
    }

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const file = e.dataTransfer?.files[0]
      if (!file || !file.type.startsWith('image/')) return

      try {
        const { ImportService } = await import('../../services/ImportService')
        const result = await ImportService.importImage(file)

        if (result.success && result.elements && result.elements[0]) {
          const element = result.elements[0]
          
          // Position at drop location
          const rect = canvas.getBoundingClientRect()
          const x = e.clientX - rect.left
          const y = e.clientY - rect.top

          addElement({
            ...element,
            x,
            y,
          })
        }
      } catch (error) {
        console.error('Failed to import dropped image:', error)
      }
    }

    canvas.addEventListener('dragover', handleDragOver)
    canvas.addEventListener('drop', handleDrop)

    return () => {
      canvas.removeEventListener('dragover', handleDragOver)
      canvas.removeEventListener('drop', handleDrop)
    }
  }, [addElement])

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
      <TemplatesPanel />
      <ShapeLibraryPanel />
      
      {/* Read-only banner */}
      {isReadOnly && (
        <div style={{
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          background: '#dc2626',
          color: 'white',
          padding: '8px 16px',
          textAlign: 'center',
          fontWeight: 'bold',
          zIndex: 9999,
          fontSize: '14px'
        }}>
          📖 READ-ONLY MODE - You are viewing a shared board without edit permissions
        </div>
      )}
      
      {/* Export/Import/Share Controls */}
      <div style={{
        position: 'fixed',
        top: '16px',
        right: '16px',
        display: 'flex',
        gap: '8px',
        zIndex: 100
      }}>
        <ImportButton />
        <ExportMenu />
        <ShareMenu />
      </div>
    </div>
  )
}
