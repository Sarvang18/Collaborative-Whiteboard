import { useRef, useEffect } from 'react'
import { useCanvasStore } from '../../store/canvasStore'
import { Viewport } from '../../canvas/engine/Viewport'
import { ShapeRenderer } from '../../canvas/renderers/ShapeRenderer'
import './BoardsOverview.css'

interface BoardsOverviewProps {
  onClose: () => void
}

export function BoardsOverview({ onClose }: BoardsOverviewProps) {
  const boards = useCanvasStore((s) => s.boards)
  const boardOrder = useCanvasStore((s) => s.boardOrder)
  const currentBoardIndex = useCanvasStore((s) => s.currentBoardIndex)
  const switchToBoard = useCanvasStore((s) => s.switchToBoard)
  const deleteBoard = useCanvasStore((s) => s.deleteBoard)

  const handleBoardClick = (index: number) => {
    switchToBoard(index)
    onClose()
  }

  const handleDeleteBoard = (e: React.MouseEvent, boardId: string, index: number) => {
    e.stopPropagation()
    if (boards.size <= 1) {
      alert('Cannot delete the last board')
      return
    }
    if (confirm('Delete this board?')) {
      deleteBoard(boardId)
      if (boardOrder.length === 1) {
        onClose()
      }
    }
  }

  return (
    <div className="boards-overview-backdrop" onClick={onClose}>
      <div className="boards-overview" onClick={(e) => e.stopPropagation()}>
        <div className="overview-header">
          <h3>All Boards</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="boards-grid">
          {boardOrder.map((boardId, index) => {
            const board = boards.get(boardId)!
            const isActive = index === currentBoardIndex
            
            return (
              <div
                key={boardId}
                className={`board-card ${isActive ? 'active' : ''}`}
                onClick={() => handleBoardClick(index)}
              >
                <div className="board-preview">
                  <BoardPreview elements={board.elements} />
                </div>
                <div className="board-card-footer">
                  <span className="board-card-name">{board.name}</span>
                  <button
                    className="delete-board-button"
                    onClick={(e) => handleDeleteBoard(e, boardId, index)}
                    title="Delete board"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function BoardPreview({ elements }: { elements: Map<string, any> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || elements.size === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const dpr = window.devicePixelRatio || 1
    canvas.width = 250 * dpr
    canvas.height = 140 * dpr
    ctx.scale(dpr, dpr)

    // Clear canvas
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 250, 140)

    // Calculate bounds of all elements
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    elements.forEach(el => {
      minX = Math.min(minX, el.x)
      minY = Math.min(minY, el.y)
      maxX = Math.max(maxX, el.x + el.width)
      maxY = Math.max(maxY, el.y + el.height)
    })

    if (minX === Infinity) return

    const contentWidth = maxX - minX
    const contentHeight = maxY - minY
    const padding = 20

    // Calculate scale to fit content
    const scaleX = (250 - padding * 2) / contentWidth
    const scaleY = (140 - padding * 2) / contentHeight
    const scale = Math.min(scaleX, scaleY, 1) // Don't scale up

    // Center the content
    const offsetX = (250 - contentWidth * scale) / 2 - minX * scale
    const offsetY = (140 - contentHeight * scale) / 2 - minY * scale

    const viewport = new Viewport({ x: offsetX, y: offsetY, scale })
    const renderer = new ShapeRenderer()

    // Render all elements
    elements.forEach(el => {
      renderer.render(el, ctx, viewport)
    })
  }, [elements])

  if (elements.size === 0) {
    return (
      <div className="empty-preview">
        <span>Empty Board</span>
      </div>
    )
  }

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  )
}
