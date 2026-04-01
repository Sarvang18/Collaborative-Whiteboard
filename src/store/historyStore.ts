import { create } from 'zustand'
import { CanvasElement } from '../types/shapes'

interface HistoryEntry {
  type: 'add' | 'update' | 'delete'
  elementId: string
  before?: CanvasElement
  after?: CanvasElement
}

interface HistoryState {
  undoStack: HistoryEntry[][]
  redoStack: HistoryEntry[][]
  
  push: (entries: HistoryEntry[]) => void
  undo: () => HistoryEntry[] | null
  redo: () => HistoryEntry[] | null
  clear: () => void
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  undoStack: [],
  redoStack: [],

  push: (entries) =>
    set((state) => ({
      undoStack: [...state.undoStack, entries],
      redoStack: [], // Clear redo stack on new action
    })),

  undo: () => {
    const { undoStack } = get()
    if (undoStack.length === 0) return null

    const entries = undoStack[undoStack.length - 1]
    set({
      undoStack: undoStack.slice(0, -1),
      redoStack: [...get().redoStack, entries],
    })
    return entries
  },

  redo: () => {
    const { redoStack } = get()
    if (redoStack.length === 0) return null

    const entries = redoStack[redoStack.length - 1]
    set({
      undoStack: [...get().undoStack, entries],
      redoStack: redoStack.slice(0, -1),
    })
    return entries
  },

  clear: () => set({ undoStack: [], redoStack: [] }),
}))
