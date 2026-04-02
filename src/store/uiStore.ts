import { create } from 'zustand'
import { ToolType } from '../types/canvas'

interface UIState {
  activeTool: ToolType
  zoom: number
  showLayers: boolean
  showProperties: boolean
  isReadOnly: boolean
  pendingShape: string | null

  setActiveTool: (tool: ToolType) => void
  setZoom: (zoom: number) => void
  toggleLayers: () => void
  toggleProperties: () => void
  setReadOnly: (readOnly: boolean) => void
  setPendingShape: (shapeId: string | null) => void
}

export const useUIStore = create<UIState>((set) => ({
  activeTool: 'select',
  zoom: 1,
  showLayers: false,
  showProperties: false,
  isReadOnly: false,
  pendingShape: null,

  setActiveTool: (tool) => set({ activeTool: tool }),
  setZoom: (zoom) => set({ zoom }),
  toggleLayers: () => set((state) => ({ showLayers: !state.showLayers })),
  toggleProperties: () => set((state) => ({ showProperties: !state.showProperties })),
  setReadOnly: (readOnly) => set({ isReadOnly: readOnly }),
  setPendingShape: (shapeId) => set({ pendingShape: shapeId }),
}))
