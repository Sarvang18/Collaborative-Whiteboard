import { useState } from 'react'
import { useCanvasStore } from '../../store/canvasStore'
import { BoardsOverview } from './BoardsOverview'
import './BoardNavigator.css'

export function BoardNavigator() {
  const [showOverview, setShowOverview] = useState(false)
  const currentBoardIndex = useCanvasStore((s) => s.currentBoardIndex)
  const boardOrder = useCanvasStore((s) => s.boardOrder)
  const boards = useCanvasStore((s) => s.boards)
  const createBoard = useCanvasStore((s) => s.createBoard)
  const nextBoard = useCanvasStore((s) => s.nextBoard)
  const previousBoard = useCanvasStore((s) => s.previousBoard)

  const currentBoard = boards.get(boardOrder[currentBoardIndex])

  return (
    <>
      <div className="board-navigator">
        <button
          className="nav-button"
          onClick={previousBoard}
          title="Previous Board (Ctrl+Left)"
        >
          ←
        </button>
        
        <button
          className="board-info-button"
          onClick={() => setShowOverview(true)}
          title="View all boards"
        >
          <div className="board-info">
            <span className="board-name">{currentBoard?.name}</span>
            <span className="board-count">
              {currentBoardIndex + 1} / {boardOrder.length}
            </span>
          </div>
        </button>

        <button
          className="nav-button"
          onClick={nextBoard}
          title="Next Board (Ctrl+Right)"
        >
          →
        </button>

        <div className="nav-divider" />

        <button
          className="nav-button create-button"
          onClick={createBoard}
          title="New Board (Ctrl+N)"
        >
          +
        </button>
      </div>

      {showOverview && <BoardsOverview onClose={() => setShowOverview(false)} />}
    </>
  )
}
