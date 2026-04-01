import { useEffect } from 'react'
import { useCanvasStore } from '../store/canvasStore'
import { useHistoryStore } from '../store/historyStore'

export function useKeyboard() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      const selectedIds = useCanvasStore.getState().selectedIds
      const deleteElements = useCanvasStore.getState().deleteElements
      const elements = useCanvasStore.getState().elements

      // Delete
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.size > 0) {
        e.preventDefault()
        
        // Save to history
        const deletedElements = Array.from(selectedIds).map(id => ({
          type: 'delete' as const,
          elementId: id,
          before: elements.get(id),
        }))
        useHistoryStore.getState().push(deletedElements)
        
        deleteElements(Array.from(selectedIds))
      }

      // Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        const entries = useHistoryStore.getState().undo()
        if (entries) {
          applyHistoryEntries(entries, true)
        }
      }

      // Redo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        const entries = useHistoryStore.getState().redo()
        if (entries) {
          applyHistoryEntries(entries, false)
        }
      }

      // Select All
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault()
        const allIds = Array.from(useCanvasStore.getState().elements.keys())
        useCanvasStore.getState().setSelection(allIds)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
}

function applyHistoryEntries(entries: any[], isUndo: boolean) {
  const store = useCanvasStore.getState()
  
  entries.forEach(entry => {
    if (entry.type === 'add') {
      if (isUndo) {
        // Undo add = delete
        store.deleteElements([entry.elementId])
      } else {
        // Redo add = add back
        if (entry.after) store.addElement(entry.after)
      }
    } else if (entry.type === 'update') {
      if (isUndo && entry.before) {
        // Restore previous state
        store.updateElement(entry.elementId, entry.before)
      } else if (!isUndo && entry.after) {
        // Restore updated state
        store.updateElement(entry.elementId, entry.after)
      }
    } else if (entry.type === 'delete') {
      if (isUndo && entry.before) {
        // Undo delete = add back
        store.addElement(entry.before)
      } else {
        // Redo delete = delete again
        store.deleteElements([entry.elementId])
      }
    }
  })
}
