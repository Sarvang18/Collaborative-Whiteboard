import { create } from 'zustand'
import { CanvasElement, BoundingBox } from '../types/shapes'

interface CanvasState {
  boardId: string
  boards: Map<string, { id: string; name: string; elements: Map<string, CanvasElement> }>
  currentBoardIndex: number
  boardOrder: string[]
  elements: Map<string, CanvasElement>
  layerOrder: string[]
  selectedIds: Set<string>
  selectionBox: BoundingBox | null

  setBoardId: (id: string) => void
  createBoard: () => void
  deleteBoard: (id: string) => void
  nextBoard: () => void
  previousBoard: () => void
  switchToBoard: (index: number) => void
  addElement: (el: CanvasElement) => void
  updateElement: (id: string, patch: Partial<CanvasElement>) => void
  deleteElements: (ids: string[]) => void
  setSelection: (ids: string[]) => void
  setSelectionBox: (box: BoundingBox | null) => void
  clearBoard: () => void
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  boardId: 'board-1',
  boards: new Map([
    ['board-1', { id: 'board-1', name: 'Board 1', elements: new Map() }]
  ]),
  currentBoardIndex: 0,
  boardOrder: ['board-1'],
  elements: new Map(),
  layerOrder: [],
  selectedIds: new Set(),
  selectionBox: null,

  setBoardId: (id) => set({ boardId: id }),

  createBoard: () => {
    const state = get()
    const newIndex = state.boards.size + 1
    const newId = `board-${newIndex}`
    const newBoard = { id: newId, name: `Board ${newIndex}`, elements: new Map() }
    
    const newBoards = new Map(state.boards)
    newBoards.set(newId, newBoard)
    
    set({
      boards: newBoards,
      boardOrder: [...state.boardOrder, newId],
      currentBoardIndex: state.boardOrder.length,
      boardId: newId,
      elements: new Map(),
      layerOrder: [],
      selectedIds: new Set(),
    })
  },

  deleteBoard: (id) => {
    const state = get()
    if (state.boards.size <= 1) return // Keep at least one board
    
    const newBoards = new Map(state.boards)
    newBoards.delete(id)
    const newOrder = state.boardOrder.filter(bid => bid !== id)
    
    let newIndex = state.currentBoardIndex
    if (state.boardOrder[state.currentBoardIndex] === id) {
      newIndex = Math.max(0, state.currentBoardIndex - 1)
    }
    
    const newCurrentId = newOrder[newIndex]
    const newCurrentBoard = newBoards.get(newCurrentId)!
    
    set({
      boards: newBoards,
      boardOrder: newOrder,
      currentBoardIndex: newIndex,
      boardId: newCurrentId,
      elements: newCurrentBoard.elements,
      layerOrder: Array.from(newCurrentBoard.elements.keys()),
    })
  },

  nextBoard: () => {
    const state = get()
    const newIndex = (state.currentBoardIndex + 1) % state.boardOrder.length
    const newBoardId = state.boardOrder[newIndex]
    const newBoard = state.boards.get(newBoardId)!
    
    set({
      currentBoardIndex: newIndex,
      boardId: newBoardId,
      elements: newBoard.elements,
      layerOrder: Array.from(newBoard.elements.keys()),
      selectedIds: new Set(),
    })
  },

  previousBoard: () => {
    const state = get()
    const newIndex = state.currentBoardIndex === 0 
      ? state.boardOrder.length - 1 
      : state.currentBoardIndex - 1
    const newBoardId = state.boardOrder[newIndex]
    const newBoard = state.boards.get(newBoardId)!
    
    set({
      currentBoardIndex: newIndex,
      boardId: newBoardId,
      elements: newBoard.elements,
      layerOrder: Array.from(newBoard.elements.keys()),
      selectedIds: new Set(),
    })
  },

  switchToBoard: (index) => {
    const state = get()
    if (index < 0 || index >= state.boardOrder.length) return
    
    const newBoardId = state.boardOrder[index]
    const newBoard = state.boards.get(newBoardId)!
    
    set({
      currentBoardIndex: index,
      boardId: newBoardId,
      elements: newBoard.elements,
      layerOrder: Array.from(newBoard.elements.keys()),
      selectedIds: new Set(),
    })
  },

  addElement: (el) =>
    set((state) => {
      const next = new Map(state.elements)
      next.set(el.id, el)
      
      // Update current board
      const currentBoard = state.boards.get(state.boardId)!
      const updatedBoard = { ...currentBoard, elements: next }
      const newBoards = new Map(state.boards)
      newBoards.set(state.boardId, updatedBoard)
      
      return {
        elements: next,
        layerOrder: [...state.layerOrder, el.id],
        boards: newBoards,
      }
    }),

  updateElement: (id, patch) =>
    set((state) => {
      const next = new Map(state.elements)
      const existing = next.get(id)
      if (existing) {
        next.set(id, { ...existing, ...patch })
      }
      
      // Update current board
      const currentBoard = state.boards.get(state.boardId)!
      const updatedBoard = { ...currentBoard, elements: next }
      const newBoards = new Map(state.boards)
      newBoards.set(state.boardId, updatedBoard)
      
      return { elements: next, boards: newBoards }
    }),

  deleteElements: (ids) =>
    set((state) => {
      const next = new Map(state.elements)
      ids.forEach((id) => next.delete(id))
      
      // Update current board
      const currentBoard = state.boards.get(state.boardId)!
      const updatedBoard = { ...currentBoard, elements: next }
      const newBoards = new Map(state.boards)
      newBoards.set(state.boardId, updatedBoard)
      
      return {
        elements: next,
        layerOrder: state.layerOrder.filter((id) => !ids.includes(id)),
        selectedIds: new Set(
          [...state.selectedIds].filter((id) => !ids.includes(id))
        ),
        boards: newBoards,
      }
    }),

  setSelection: (ids) => set({ selectedIds: new Set(ids) }),

  setSelectionBox: (box) => set({ selectionBox: box }),

  clearBoard: () =>
    set((state) => {
      const clearedElements = new Map()
      
      // Update current board
      const currentBoard = state.boards.get(state.boardId)!
      const updatedBoard = { ...currentBoard, elements: clearedElements }
      const newBoards = new Map(state.boards)
      newBoards.set(state.boardId, updatedBoard)
      
      return {
        elements: clearedElements,
        layerOrder: [],
        selectedIds: new Set(),
        selectionBox: null,
        boards: newBoards,
      }
    }),
}))
